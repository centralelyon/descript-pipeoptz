import numpy as np


def IoU(im1, im2):
    """Calculate Intersection over Union (IoU) between two binary masks."""
    im1_mask = im1 > 0
    im2_mask = im2 > 0
    intersection = np.logical_and(im1_mask, im2_mask)
    union = np.logical_or(im1_mask, im2_mask)
    iou_score = np.sum(intersection) / np.sum(union)
    return iou_score


def d2(p1, p2):
    """Calculate the squared Euclidean distance between two points."""
    return (p1[0] - p2[0]) ** 2 + (p1[1] - p2[1]) ** 2


def loss(res, expected):
    """
    Calculate a loss score based on the IoU of matched image segments.
    Each element in `res` and `expected` is a one element list of a list of a tuple (image, (pos_x, pos_y)).
    """
    if not len(res) or not len(expected):
        return np.inf

    im_shape = [0, 0]
    for r in res:
        im_shape[0] += r[0].shape[0]
        im_shape[1] += r[0].shape[1]
    im_shape = round(im_shape[0]/len(res)), round(im_shape[1]/len(res))

    res_wanted = []

    for _, pos_xpctd in expected:
        delta = np.inf
        n = -1
        for i, (_, pos_res) in enumerate(res):
            if d2(pos_xpctd, pos_res) < delta:
                delta = d2(pos_xpctd, pos_res)
                n = i
                if delta == 0:
                    break
        if n != -1:
            res_wanted.append(res[n])

    score = 0
    for (im_xpctd, pos_xpctd), (im_res, pos_res) in zip(expected, res_wanted):
        pos_xpctd = round(pos_xpctd[0]*im_shape[1]), round(pos_xpctd[1]*im_shape[0])
        pos_res = round(pos_res[0]*im_shape[1]), round(pos_res[1]*im_shape[0])

        delta_pos = [pos_xpctd[i] - pos_res[i] for i in range(2)]
        shape = [max(im_xpctd.shape[i], im_res.shape[i]) + abs(delta_pos[i]) for i in range(2)]
        if len(expected[0][0].shape) == 3:
            shape.append(expected[0][0].shape[2])

        im_xpctd_padded = np.zeros(shape, dtype=im_xpctd.dtype)
        im_res_padded = np.zeros(shape, dtype=im_res.dtype)

        # Center both images in the padded array according to their position offsets
        # For expected image
        x_dst_start, y_dst_start = max(0, delta_pos[0]), max(0, delta_pos[1])
        x_dst_end, y_dst_end = x_dst_start+im_xpctd.shape[0], y_dst_start+im_xpctd.shape[1]

        # Ensure destination indices are within bounds
        x_dst_end = min(x_dst_end, shape[0])
        y_dst_end = min(y_dst_end, shape[1])
        x_src_end = x_dst_end - x_dst_start
        y_src_end = y_dst_end - y_dst_start

        im_xpctd_padded[x_dst_start:x_dst_end, y_dst_start:y_dst_end] = im_xpctd[:x_src_end, :y_src_end]

        # For result image
        x_dst_start, y_dst_start = max(0, -delta_pos[0]), max(0, -delta_pos[1])
        x_dst_end, y_dst_end = x_dst_start + im_res.shape[0], y_dst_start + im_res.shape[1]

        # Ensure destination indices are within bounds
        x_dst_end = min(x_dst_end, shape[0])
        y_dst_end = min(y_dst_end, shape[1])
        x_src_end = x_dst_end - x_dst_start
        y_src_end = y_dst_end - y_dst_start

        im_res_padded[x_dst_start:x_dst_end, y_dst_start:y_dst_end] = im_res[:x_src_end, :y_src_end]

        score += 1 - IoU(im_xpctd_padded, im_res_padded)
    return score / len(expected)
