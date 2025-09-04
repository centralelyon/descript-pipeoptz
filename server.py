from flask import Flask, render_template, request, session, redirect, logging, jsonify, Response
import numpy as np
from PIL import Image, ImageOps
from flask_cors import CORS, cross_origin

from pipelines.rmv_bg_isolate import initPipeline

app = Flask(__name__)
cors = CORS(app)  # allow CORS for all domains on all routes.
app.config['CORS_HEADERS'] = 'Content-Type'
import re
import base64
from io import BytesIO
import ujson as ujson
import time
from pipelines import pipelines, parameters, loss
from pipelines.extract_elements import initPipeline
from pipeoptz.optimizer import PipelineOptimizer
from pipeoptz.parameter import IntParameter, FloatParameter, ChoiceParameter, BoolParameter, MultiChoiceParameter

maxImgSize = [1000, 1000]


def castParam(param):
    # ATM we have no clue what type a node param expect. Hence, we assume all of them should be ints or bools
    if param == "false" or param == "true":
        param = bool(param)
    else:
        param = int(param)
    return param


@app.route('/pipes', methods=["GET"])
@cross_origin()
def pipes():
    keys = list(pipelines.keys())
    graphs = {}
    fixedParams = {}
    for key in keys:
        graphs[key] = pipelines[key].to_dot()
        fixedParams[key] = pipelines[key].get_fixed_params()

    resp = Response(response=ujson.dumps({
        "pipelines": keys,
        "graphs": graphs,
        "fixedParams": fixedParams
    }),
        status=200,
        mimetype="application/json")

    return resp


@app.route('/setPipeParams', methods=["POST"])
@cross_origin()
def setPipeParams():
    tpip = request.form['pipeline']
    nodes = ujson.loads(request.form['nodes'])
    for node in nodes:
        for param in nodes[node]:
            nodes[node][param] = castParam(nodes[node][param])
            pipelines[tpip].nodes[node].set_fixed_param(param, nodes[node][param])
    return "ok"


@app.route('/optimizePipeline', methods=["POST"])
@cross_origin()
def optimize_pipe():
    tpip = request.form['pipeline']
    inputImg = Image.open(request.files['input'])
    images = ujson.loads(request.form['images'])
    coords = ujson.loads(request.form['coords'])
    tshape = []

    if inputImg.size[0] > maxImgSize[0]:
        ratio = maxImgSize[0] / inputImg.size[0]
        inputImg = inputImg.resize((maxImgSize[0], int(inputImg.size[1] * ratio)), Image.Resampling.LANCZOS)

    # inputImg = ImageOps.grayscale(inputImg)
    temp = {"image": np.array(inputImg, dtype=np.uint8)}
    for i in range(len(images)):
        image = images[i]
        coord = coords[i]

        imgdata = base64.b64decode(str(image).replace("data:image/png;base64,", ""))
        tim = Image.open(BytesIO(imgdata))
        # tim = ImageOps.grayscale(tim)
        tshape.append((np.array(tim, dtype=np.float64), (coord[0], coord[1])))
        # y.append((,))

    pipe = pipelines[tpip]

    params = parameters[tpip]
    optimizer = PipelineOptimizer(pipe, loss, max_time_pipeline=5)

    for param in params:
        optimizer.add_param(param)

    best_params, loss_log = optimizer.optimize(
        # [temp], [(yims, ycoords)],
        [temp], [tshape],
        method="BO",
        verbose=True,
        iterations=10,
        init_points=4,
    )

    resp = Response(
        response=ujson.dumps({"best_params": best_params, "loss": loss_log}),
        status=200,
        mimetype="application/json")

    return resp



@app.route('/testNode', methods=["POST"])
@cross_origin()
def testNode():
    tpip = request.form['pipeline']
    params = ujson.loads(request.form['params'])

    for param in params:
        params[param] = castParam(params[param])

    nodeName = request.form['node']

    img = pipelines[tpip].run_single_node(nodeName, inputs=params)

    resp = Response(
        response=ujson.dumps({"result": numpy_to_b64(img)}),
        status=200,
        mimetype="application/json")

    return resp


@app.route('/ask', methods=["POST"])
@cross_origin()
def ask():
    im = Image.open(request.files['image'])

    if im.size[0] > maxImgSize[0]:
        ratio = maxImgSize[0] / im.size[0]
        im = im.resize((maxImgSize[0], int(im.size[1] * ratio)), Image.Resampling.LANCZOS)

    tt = np.array(im)

    tpip = pipelines[request.form['pipeline']]

    res = tpip.run({'image': tt})
    tres = []

    t = res[2]
    print(f"run = {t[0]}")
    for k in t[1].keys():
        if t[1][k] > 0.01:
            print(f"\t{k} = {round(t[1][k], 2)}s")

    for el in res[1][res[0]]:
        tres.append([numpy_to_b64(el[0]), el[1]])

    resp = Response(
        response=ujson.dumps({"images": tres, "outputs": getItermediateResults(tpip)}),
        status=200,
        mimetype="application/json")

    return resp


def getItermediateResults(pipeline):
    res = {}

    for node in pipeline.nodes:
        if type(pipeline.nodes[node].output) == np.ndarray:
            res[node] = numpy_to_b64(pipeline.nodes[node].output)
    return res


def numpy_to_b64(array):
    im_pil = Image.fromarray(array)
    if im_pil.mode != 'RGBA':
        im_pil = im_pil.convert('RGBA')
    buff = BytesIO()
    im_pil.save(buff, format="png")
    im_b64 = base64.b64encode(buff.getvalue()).decode("utf-8")

    return im_b64


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=False)
