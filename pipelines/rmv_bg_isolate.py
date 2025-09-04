import numpy as np
from math import comb
from sklearn.cluster import MiniBatchKMeans 
from skimage.color import rgb2lab, lab2rgb
import scipy as sp
import sys, os

PATH = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(1, os.path.abspath(f"{PATH}/../pipeoptz/"))

from pipeoptz import Pipeline, Node, IntParameter, BoolParameter


def ith_subset(n, i):
    total = 2**n
    if i < 0:
        raise ValueError(f"Index i must be in [0, {total - 1}]")
    i = min(i, total - 1)

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

def color_mask(image, mask):
    if mask is not None:
        return image*mask[:,:,np.newaxis]
    else:
        return np.zeros(shape=image.shape)

def extract_palette(image, n_colors, max_iter=100, use_lab=False, batch_size=256):
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
        sample = rgb2lab(pixels_normalized)
    else:
        sample = pixels.astype(np.float32)

    if sample.shape[0] < n_colors:
        n_colors = max(1, sample.shape[0])
        if n_colors == 0:
            return np.array([], dtype=np.uint8).reshape(0, 3)

    kmeans = MiniBatchKMeans(n_clusters=n_colors, max_iter=max_iter, tol=1e-1, random_state=0, batch_size=batch_size)
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
    sizes = np.bincount(labeled_array.ravel())[1:]  # skip background
    valid_labels = np.where(sizes >= sizemin)[0] + 1
    return [(labeled_array == label) for label in valid_labels]

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
    if not rows.shape[0] or not cols.shape[0]:
        return np.array([[]])
    y1, y2 = np.where(rows)[0][[0, -1]]
    x1, x2 = np.where(cols)[0][[0, -1]]
    return im[y1:y2+1, x1:x2+1]

def generate_res(image, mask, rBB):
    h, w = image.shape[:2]
    im_colored = color_mask(image[int(rBB[1]*h):int(rBB[3]*h), int(rBB[0]*w):int(rBB[2]*w)], mask[int(rBB[1]*h):int(rBB[3]*h), int(rBB[0]*w):int(rBB[2]*w)])
    return [min_size(im_colored), rBB]

def globalVar(x):
    return x



def initPipeline():
    pipeline = Pipeline("BG & Isolate")
    pipeline.add_node(
        Node("[optz]PaletteSize", globalVar, {"x":8})
    )
    pipeline.add_node(
        Node("ExtractPalette", extract_palette, {"use_lab":False, "batch_size":256}), 
        {"image":"run_params:image", "n_colors":"[optz]PaletteSize"})
    pipeline.add_node(
        Node("Recolor", recolor), 
        {"image":"run_params:image", "palette":"ExtractPalette"})
    pipeline.add_node(
        Node("[optz]PaletteIndices", ith_subset, {"i":37}),
        {"n":"[optz]PaletteSize"})
    pipeline.add_node(
        Node("RemovePalette", remove_palette), 
        {"image":"run_params:image", "recolored_image":"Recolor", "palette":"ExtractPalette", "indices_to_remove":"[optz]PaletteIndices"})
    pipeline.add_node(
        Node("ToMask", to_mask), 
        {"image":"RemovePalette"})
    pipeline.add_node(
        Node("Isolate", isolate, {"sizemin":400}), 
        {"binary_mask": "ToMask"})
    pipeline.add_node(
        Node("rBB", get_rBB), 
        {"[mask]":"Isolate"})
    pipeline.add_node(
        Node("Results", generate_res), 
        {"image":"run_params:image", "[mask]":"Isolate", "[rBB]":"rBB"})
    return pipeline


def initParameters():
    return [
        IntParameter("[optz]PaletteSize", "x", 6, 12),
        BoolParameter("ExtractPalette", "use_lab"),
        IntParameter("[optz]PaletteIndices", "i", 1, 128),
        IntParameter("Isolate", "sizemin", 1, 1000)
    ]