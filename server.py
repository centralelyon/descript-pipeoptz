from flask import Flask, render_template, request, session, redirect, logging, jsonify, Response
import cv2
import numpy as np
from PIL import Image
import sys, os
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
    resp = Response(response=ujson.dumps({
        "pipelines": list(pipelines.keys())
    }),
        status=200,
        mimetype="application/json")

    return resp

@app.route('/ask', methods=["POST"])
@cross_origin()
def ask():
    st = time.time()

    im = Image.open(request.files['image'])

    if im.size[0] > maxImgSize[0]:
        ratio = maxImgSize[0] / im.size[0]
        im = im.resize((maxImgSize[0], int(im.size[1] * ratio)), Image.Resampling.LANCZOS)

    tt = np.array(im)

    print(request.form['pipeline'])
    tpip = pipelines[request.form['pipeline']]
    setup = time.time()
    print("----")
    print("setup", setup - st)
    print("----")

    res = tpip.run({'image': tt})
    tres = []

    t = res[2]
    print(f"run = {t[0]}")
    for k in t[1].keys():
        if t[1][k] > 0.01:
            print(f"\t{k} = {round(t[1][k],2)}s")
    print("----")
    
    run = time.time()
    for el in res[1][res[0]]:
        tres.append([numpy_to_b64(el[0]), el[1]])

    resp = Response(
        response=ujson.dumps({"images": tres}),
        status=200,
        mimetype="application/json")

    send = time.time()
    print("send", send - run)
    print("----")


    return resp


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
