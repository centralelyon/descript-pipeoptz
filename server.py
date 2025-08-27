from flask import Flask, render_template, request, session, redirect, logging, jsonify, Response
import numpy as np
from PIL import Image
from flask_cors import CORS, cross_origin

app = Flask(__name__)
cors = CORS(app)  # allow CORS for all domains on all routes.
app.config['CORS_HEADERS'] = 'Content-Type'

import base64
from io import BytesIO
import ujson as ujson
import time

from pipelines import pipelines

maxImgSize = [1000, 1000]


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
            # ATM we have no clue what type a node param expect. Hence, we assume all of them should be ints or bools
            if nodes[node][param] == "false" or nodes[node][param] == "true":
                nodes[node][param] = bool(nodes[node][param])
            else:
                nodes[node][param] = int(nodes[node][param])
            pipelines[tpip].nodes[node].set_fixed_param(param, nodes[node][param])
    return "ok"


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

    # t = res[2]
    # print(f"run = {t[0]}")
    # for k in t[1].keys():
    #     if t[1][k] > 0.01:
    #         print(f"\t{k} = {round(t[1][k], 2)}s")
    # print("----")

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
