########## IMPORT DES BIBLIOTHEQUES #########
import cv2
import numpy as np
import matplotlib.pyplot as plt
from math import comb
from sklearn.cluster import KMeans
from skimage.color import rgb2lab, lab2rgb
import scipy as sp
from PIL import Image
import sys, os

PATH = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(1, os.path.abspath(f"{PATH}/../pipeoptz/"))

from pipeoptz import Pipeline, Node


########## FONCTIONS POUR LES NODES ##########
def ith_subset(n, i):
    total = 2**n
    if i < 0 or i >= total:
        raise ValueError(f"Index i must be in [0, {total - 1}]")

    remaining = i
    for k in range(n + 1):
        c = comb(n, k)
        if remaining < c:
            cardinality = k
            break
        remaining -= c

    subset = []
    x = 0
    for j in range(cardinality):
        while comb(n-1 - x, cardinality - j - 1) <= remaining:
            remaining -= comb(n-1 - x, cardinality - j - 1)
            x += 1
        subset.append(x)
        x += 1
    return subset

def integer(n):
    return n

def to_mask(image):
    return image[:,:,3] != 0

def colore_mask(image, mask):
    if mask is not None:
        return image*mask[:,:,np.newaxis]
    else:
        return np.zeros(shape=image.shape)

def extract_palette(image, n_colors, sample_size=0, max_iter=300, use_lab=False):
    if image.shape[2] == 4:
        opaque_mask = image[:, :, 3] != 0
        pixels = image[opaque_mask][:, :3]
        if pixels.shape[0] == 0:
            return np.array([], dtype=np.uint8).reshape(0, 3)
    elif image.shape[2] == 3:  # RGB
        pixels = image.reshape(-1, 3)
    else:
        raise ValueError("Image must be RGB or RGBA.")
    
    if use_lab:
        pixels_normalized = pixels.astype(np.float32) / 255.0
        data_for_kmeans = rgb2lab(pixels_normalized)
    else:
        data_for_kmeans = pixels.astype(np.float32)

    if sample_size > 0 and data_for_kmeans.shape[0] > sample_size:
        indices = np.random.choice(data_for_kmeans.shape[0], size=sample_size, replace=False)
        sample = data_for_kmeans[indices]
    else:
        sample = data_for_kmeans

    if sample.shape[0] < n_colors:
        n_colors = max(1, sample.shape[0])
        if n_colors == 0:
            return np.array([], dtype=np.uint8).reshape(0, 3)

    kmeans = KMeans(n_clusters=n_colors, max_iter=max_iter, n_init='auto', random_state=0)
    kmeans.fit(sample)
    centers = kmeans.cluster_centers_

    if use_lab:
        palette_float = lab2rgb(centers)
        palette = np.clip(palette_float * 255, 0, 255).astype(np.uint8)
        l_values = centers[:, 0]
        sorted_indices = np.argsort(l_values)[::-1]
        palette = palette[sorted_indices]
    else:
        palette_float = centers
        palette = np.clip(palette_float, 0, 255).astype(np.uint8)
        luminance = 0.299 * palette[:, 0] + 0.587 * palette[:, 1] + 0.114 * palette[:, 2]
        sorted_indices = np.argsort(luminance)[::-1]
        palette = palette[sorted_indices]
        
    return palette

def recolor(image, palette) :
    h, w, c = image.shape
    is_rgba = (c == 4)
    
    rgb_image_part = image[:, :, :3].astype(np.float32)
    pixels_flat = rgb_image_part.reshape(-1, 3)
    palette_float = palette.astype(np.float32)

    dists = np.linalg.norm(pixels_flat[:, np.newaxis, :] - palette_float[np.newaxis, :, :], axis=2)
    
    nearest_palette_indices = np.argmin(dists, axis=1)
    recolored_rgb_flat = palette[nearest_palette_indices]
    recolored_rgb = recolored_rgb_flat.reshape(h, w, 3).astype(np.uint8)

    if is_rgba:
        alpha_channel = image[:, :, 3:]
        return np.dstack((recolored_rgb, alpha_channel))
    return recolored_rgb

def remove_palette(image, recolored_image, palette, indices_to_remove):
    if image.shape[2] != 4:
        raise ValueError("Original image must be RGBA.")

    output_image = image.copy()
    recolored_rgb = recolored_image[:,:,:3]

    for i in indices_to_remove:
        if 0 <= i < len(palette):
            color_to_match = palette[i]
            match_mask = np.all(recolored_rgb == color_to_match, axis=2)
            output_image[match_mask, 3] = 0
    return output_image

def isolate(binary_mask, sizemin=1):
    if not np.any(binary_mask):
        return []
    labeled_array, num_features = sp.ndimage.label(binary_mask)
    
    elements = []
    for i in range(1, num_features + 1):
        component_mask = (labeled_array == i)
        if np.sum(component_mask) >= sizemin:
            elements.append(component_mask)
    return elements

def get_rBB(mask, bonus=0):
    h, w = mask.shape
    xy = np.argwhere(mask)
    y1, x1 = xy[:,0].min(), xy[:,1].min()
    y2, x2 = xy[:,0].max(), xy[:,1].max()
    return max(x1-bonus,0)/w, max(y1-bonus,0)/h, min(x2+bonus,w)/w, min(y2+bonus,h)/h

def min_size(im):
    filter = im if im.ndim == 2 else im[..., 0] != 0
    rows = np.any(filter, axis=1)
    cols = np.any(filter, axis=0)
    y1, y2 = np.where(rows)[0][[0, -1]]
    x1, x2 = np.where(cols)[0][[0, -1]]
    return im[y1:y2+1, x1:x2+1]

def generate_res(im_colored, rBB):
    return [min_size(im_colored), rBB]


########## DEFINITION DE LA PIPELINE ##########
def initPipeline():
    n_color = 8
    pipeline = Pipeline("BG & Isolate")
    pipeline.add_node(
        Node("Palette size", integer, {"n":n_color}))
    pipeline.add_node(
        Node("Extract palette", extract_palette, {"n_colors":n_color, "use_lab":False}), 
        {"image":"run_params:image"})
    pipeline.add_node(
        Node("Recolor", recolor), 
        {"image":"run_params:image", "palette":"Extract palette"})
    pipeline.add_node(
        Node("Remove palette", remove_palette, {"indices_to_remove": [0,1,2]}), 
        {"image":"run_params:image", "recolored_image":"Recolor", "palette":"Extract palette"})
    pipeline.add_node(
        Node("To mask", to_mask), 
        {"image":"Remove palette"})
    pipeline.add_node(
        Node("Isolate", isolate, {"sizemin":400}), 
        {"binary_mask": "To mask"})
    pipeline.add_node(
        Node("Get rBB", get_rBB), 
        {"[mask]":"Isolate"})
    pipeline.add_node(
        Node("Color", colore_mask), 
        {"image":"run_params:image", "[mask]":"Isolate"})
    pipeline.add_node(
        Node("Results", generate_res), 
        {"[im_colored]":"Color", "[rBB]":"Get rBB"})
    return pipeline

