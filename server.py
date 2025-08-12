from flask import Flask, render_template, request, session, redirect, logging, jsonify, Response
import cv2
import numpy as np
import matplotlib.pyplot as plt
from PIL import Image
import sys, os
from flask_cors import CORS, cross_origin

app = Flask(__name__)
cors = CORS(app)  # allow CORS for all domains on all routes.
app.config['CORS_HEADERS'] = 'Content-Type'

import base64
from io import BytesIO
import ujson as ujson

from pipelines.simple_split import *
from pipelines.split16 import *

# import complex
pipelines = {
            "split4": initSplit(),
            "split16": initSplit16()
            }


def initPipelines():
    global pipelines


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
    im = request.files['image']
    tt = np.array(Image.open(im))

    print(request.form['pipeline'])
    tpip = pipelines[request.form['pipeline']]

    res = tpip.run({'image': tt})
    tres = []
    for img in res[1][res[0]]:
        tres.append(numpy_to_b64(img))

    resp = Response(response=ujson.dumps({
        "images": tres
    }),
        status=200,
        mimetype="application/json")

    return resp


def numpy_to_b64(array):
    im_pil = Image.fromarray(array)
    if im_pil.mode != 'RGB':
        im_pil = im_pil.convert('RGB')
    buff = BytesIO()
    im_pil.save(buff, format="png")
    im_b64 = base64.b64encode(buff.getvalue()).decode("utf-8")

    return im_b64


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=False)
