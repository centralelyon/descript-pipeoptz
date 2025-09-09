import scipy as sp
import numpy as np
import sys, os

PATH = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(1, os.path.abspath(f"{PATH}/../"))

from pipeoptz import Pipeline, Node

def to_mask(image):
    return image[:,:,3] != 0

def get_points(mask):
    return np.vstack(np.where(mask)).T.astype(np.float16)[:, [1,0]]

def rotate_points(points, angle_rad):
    c, s = np.cos(angle_rad), np.sin(angle_rad)
    rotation_matrix = np.array([[c, -s], [s, c]])
    return points @ rotation_matrix.T # Apply rotation: P' = P * R^T

def height_width_ratio(points, angle_rad):
    rotated = rotate_points(points, angle_rad)
    min_xy = rotated.min(axis=0)
    max_xy = rotated.max(axis=0)
    w, h = max_xy - min_xy
    return h / w if w != 0 else 0.0

def height(points, angle_rad):
    rotated = rotate_points(points, angle_rad)
    min_xy = rotated.min(axis=0)
    max_xy = rotated.max(axis=0)
    _, h = max_xy - min_xy
    return h

def get_orientation(points, initial_angle=0., step=np.pi/8, precision=0.01, heuristic=height_width_ratio):
    if points.shape[0] < 2:
        return initial_angle

    current_angle = initial_angle % np.pi
    best_ratio = heuristic(points, current_angle)

    current_step = step
    while current_step > precision:
        improved = False
        for direction in [-1, 1]:
            new_angle = (current_angle + direction * current_step) % np.pi
            ratio = heuristic(points, new_angle)
            if ratio > best_ratio:
                print(ratio)
                current_angle = new_angle
                best_ratio = ratio
                improved = True
                break
        if not improved:
            current_step /= 2
    return current_angle

def rotate(image, angle_rad, order=0, reshape=True):
    return sp.ndimage.rotate(image, -angle_rad * 180 / np.pi, reshape=reshape, order=order)


def initPipeline():
    pipeline = Pipeline("RotDich")
    pipeline.add_node(
        Node("ToMask", to_mask),
        predecessors={"image": "run_params:image"}
    )
    pipeline.add_node(
        Node("GetPoints", get_points),
        predecessors={"mask": "ToMask"}
    )
    pipeline.add_node(
        Node("GetOrientation", get_orientation, {"heuristic": height_width_ratio}),
        predecessors={"points": "GetPoints"}
    )
    pipeline.add_node(
        Node("Rotate", rotate, {"order": 0, "reshape": True}),
        predecessors={"image": "run_params:image", "angle_rad": "GetOrientation"}
    )
    return pipeline

def initParameters():
    return []
