import sys, os
PATH = os.path.dirname(os.path.abspath(__file__))
from pipeoptz import Pipeline, Node

def split_image_16(image):
    h, w, _ = image.shape
    h4, w4 = h // 4, w // 4
    return [image[i*h4:(i+1)*h4-1, j*w4:(j+1)*w4-1] for i in range(4) for j in range(4)]


def initSplit16():
    pipeline = Pipeline("ImageSplitter8")
    pipeline.add_node(
    Node("Splitter", split_image_16),
    predecessors={"image": "run_params:image"}
    )
    return pipeline