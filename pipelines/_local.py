import numpy as np
from PIL import Image
from matplotlib import pyplot as plt
import random
random.seed(8)


pipelines = {}
parameters = {}

from pipelines._shape_detection import initPipeline, initParameters
pipelines["ShapeDetection"] = initPipeline()
parameters["ShapeDetection"] = initParameters()

from extract_elements import initPipeline, initParameters
pipelines["ExtractElements"] = initPipeline()
parameters["ExtractElements"] = initParameters()

from _rot_dich import initPipeline, initParameters
pipelines["RotDich"] = initPipeline()
pipelines["RotDich"].to_dot(generate_png=True, cleanup_dot=True)

im = np.array(Image.open("assets/images/tempLoad/dearDat.png"))

lolipops = pipelines["ExtractElements"].run({"image": im})
lolipops = lolipops[1][lolipops[0]]

plt.figure(figsize=(8, 3))
for i in range(10):
    plt.subplot(2, 10, i+1)
    plt.axis("off")
    loli = lolipops[random.randint(0, len(lolipops)-1)][0]
    l = pipelines["ShapeDetection"].run({"image": loli})
    l = l[1][l[0]][0]
    plt.imshow(l)
    plt.subplot(2, 10, i+11)
    plt.axis("off")
    l = pipelines["RotDich"].run({"image": loli})
    l = l[1][l[0]]
    plt.imshow(l)
plt.show()