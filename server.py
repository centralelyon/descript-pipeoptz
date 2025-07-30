from flask import Flask, render_template, request, session, redirect, logging, jsonify, Response
import cv2
import numpy as np
import matplotlib.pyplot as plt
from PIL import Image
import sys, os


app = Flask(__name__)

import ujson as ujson
sys.path.insert(1, 'pipelines')

from complex  import pipeline
# import complex
pipelines = dict({"removeBG": pipeline})


@app.route('/ask', methods=["POST"])
def ask():

    im =  request.files['image']
    tt =  np.array(Image.open(im))

    tpip = pipelines[request.form['pipeline']]

    res = tpip.run({'image':tt})
    print(res)

    resp = Response(response=ujson.dumps({
        "images": res
    }),
        status=200,
        mimetype="application/json")

    return resp


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=False)
