import cv2
import numpy as np

import sys, os
PATH = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(1, os.path.abspath(f"{PATH}\\..\\\\"))
sys.path.insert(1, os.path.abspath(f"{PATH}/../pipeoptz/"))

from pipeoptz import Pipeline, Node

def get_bb(el, bonus=0):
    xy = np.argwhere(el)
    y1, x1 = xy[:,0].min(), xy[:,1].min()
    y2, x2 = xy[:,0].max(), xy[:,1].max()
    return max(x1-bonus,0), max(y1-bonus,0), min(x2+bonus,el.shape[1]-1), min(y2+bonus,el.shape[0]-1)

def to_grayscale(image):
    return cv2.cvtColor(image, cv2.COLOR_RGBA2GRAY)

def gaussian_blur(image, kernel_size=5):
    return cv2.GaussianBlur(image, (kernel_size, kernel_size), 0)

def adaptive_threshold(image, block_size, c):
    return cv2.adaptiveThreshold(image, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, cv2.THRESH_BINARY, block_size, c)

def find_contours(image):
    contours, hierarchy =  cv2.findContours(image, cv2.RETR_TREE, cv2.CHAIN_APPROX_SIMPLE)
    return contours, hierarchy

def draw_contours(image, contours_hierarchy):
    contours, hierarchy = contours_hierarchy
    temp = np.zeros_like(image)
    color = (255, 255, 255)
    for i in range(len(contours)):
        cv2.drawContours(temp, contours, i, color, 5, cv2.LINE_8, hierarchy, 100)
    return temp

def process_contours(contours_hierarchy):
    contours, hierarchy = contours_hierarchy
    points = []
    for i, contour in enumerate(contours):
        if hierarchy[0][i][3] > 0:
            area = cv2.contourArea(contour)
            if area > 1:
                points.append(contour)
    return points

def create_masks(contours, image):
    masks = []
    shape = image.shape[:2]
    for contour in contours:
        mask = np.zeros(shape, dtype=np.uint8)
        cv2.drawContours(mask, [contour], -1, (255), thickness=cv2.FILLED)
        masks.append(mask.astype(bool))
    return masks

def surface_min(masks, treshold):
    return [mask for mask in masks if mask.sum() >= treshold]

def generate_res(masks, image):
    res = []
    for mask in masks:
        bb = get_bb(mask)
        rbb = bb[0]/image.shape[1], bb[1]/image.shape[0], bb[2]/image.shape[1], bb[3]/image.shape[0]
        im = image[bb[1]:bb[3], bb[0]:bb[2]]*mask[bb[1]:bb[3], bb[0]:bb[2]][:,:,np.newaxis]
        res.append([im, list(rbb)])
    return res



def initPipeline():
    pipeline = Pipeline("ExtractElements")
    pipeline.add_node(
        Node("Grayscale", to_grayscale),
        predecessors={"image": "run_params:image"}
    )
    pipeline.add_node(
        Node("GaussianBlur", gaussian_blur, fixed_params={"kernel_size": 5}),
        predecessors={"image": "Grayscale"}
    )
    pipeline.add_node(
        Node("AdaptiveThreshold", adaptive_threshold, fixed_params={"block_size": 17, "c": 16}),
        predecessors={"image": "GaussianBlur"}
    )
    pipeline.add_node(
        Node("FindContours1", find_contours),
        predecessors={"image": "AdaptiveThreshold"}
    )
    pipeline.add_node(
        Node("DrawContours", draw_contours),
        predecessors={"image": "AdaptiveThreshold", "contours_hierarchy": "FindContours1"}
    )
    pipeline.add_node(
        Node("FindContours2", find_contours),
        predecessors={"image": "DrawContours"}
    )
    pipeline.add_node(
        Node("ProcessContours", process_contours),
        predecessors={"contours_hierarchy": "FindContours2"}
    )
    pipeline.add_node(
        Node("CreateMasks", create_masks),
        predecessors={"contours": "ProcessContours", "image": "run_params:image"}
    )
    pipeline.add_node(
        Node("SurfaceMin", surface_min, fixed_params={"treshold": 400}),
        predecessors={"masks": "CreateMasks"}
    )
    pipeline.add_node(
        Node("Results", generate_res),
        predecessors={"masks": "SurfaceMin", "image": "run_params:image"}
    )
    return pipeline


if __name__ == "__main__":
    from PIL import Image
    import numpy as np
    import matplotlib.pyplot as plt

    pipeline = initPipeline()
    im = np.array(Image.open(f"{PATH}\\..\\assets\\images\\tempLoad\\dearDat.png"))
    
    i, h, t = pipeline.run({"image": im})
    res = h[i]
    print(len(res))
    print(f"time = {round(t[0],5)}")
    for k in t[1].keys():
        print(f"\t{k} = {round(t[1][k],2)}s")
    print(res[12][1])
    #plt.imshow(res[12][0])
    #plt.show()