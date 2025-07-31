import sys, os
PATH = os.path.dirname(os.path.abspath(__file__))
from pipeoptz import Pipeline, Node

def split_image_in_four(image):
    h, w, _ = image.shape
    mid_h, mid_w = h // 2, w // 2

    top_left = image[:mid_h, :mid_w]
    top_right = image[:mid_h, mid_w:w]
    bottom_left = image[mid_h:h, :mid_w]
    bottom_right = image[mid_h:h, mid_w:w]

    return [top_left, top_right, bottom_left, bottom_right]


pipeline = Pipeline("ImageSplitter")
pipeline.add_node(
    Node("Splitter", split_image_in_four),
    predecessors={"image": "run_params:image"}
)

