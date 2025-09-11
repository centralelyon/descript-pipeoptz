import numpy as np
from PIL import Image
from matplotlib import pyplot as plt
import random


pipelines = {}

from _shape_detection import initPipeline
pipelines["ShapeDetection"] = initPipeline()

from extract_elements import initPipeline
pipelines["ExtractElements"] = initPipeline()

from _rot_dich import initPipeline
pipelines["RotDich"] = initPipeline()

im = np.array(Image.open("assets/images/tempLoad/dearDat.png"))

lolipops = pipelines["ExtractElements"].run({"image": im})
lolipops = lolipops[1][lolipops[0]]

plt.figure(figsize=(8, 3))
for i in range(15):
    plt.subplot(2, 15, i+1)
    plt.axis("off")
    loli = lolipops[random.randint(0, len(lolipops)-1)][0]
    plt.imshow(loli)
    plt.subplot(2, 15, i+16)
    plt.axis("off")
    l = pipelines["RotDich"].run({"image": loli})
    l = l[1][l[0]]
    plt.imshow(l)
plt.show()