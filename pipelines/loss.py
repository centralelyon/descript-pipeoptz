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
    Each element in `res` and `expected` is a tuple (image, (pos_x, pos_y)).
    """
    res_wanted = []
    print("using loss")

    # tt = expected[0]
    # print(tt)
    # pos_xpctd = expected[1]

    for _, pos_xpctd in expected:
        delta = np.inf
        n = -1
        for i, (_, pos_res) in enumerate(res):
            if d2(pos_xpctd, pos_res) < delta:
                delta = d2(pos_xpctd, pos_res)
                n = i
                if delta <= 2:  # it's max 1 pixel shift in diag, if it's exist so it's probably the best
                    break
        if len(res) > n > -1:
            res_wanted.append(res[n])

    score = 0
    for (im_xpctd, pos_xpctd), (im_res, pos_res) in zip(expected, res_wanted):
        delta_pos = [pos_xpctd[i] - pos_res[i] for i in range(2)]
        shape = [int(np.floor(max(im_xpctd.shape[i], im_res.shape[i]) + abs(delta_pos[i]))) for i in range(2)]

        shape.append(4)
        im_xpctd_padded = np.zeros(shape, dtype=im_xpctd.dtype)
        im_res_padded = np.zeros(shape, dtype=im_res.dtype)

        # Center both images in the padded array according to their position offsets
        # For expected image
        x_dst_start, y_dst_start = int(max(0, delta_pos[0])), int(max(0, delta_pos[1]))
        x_dst_end, y_dst_end = int(x_dst_start + im_xpctd.shape[0]), int(y_dst_start + im_xpctd.shape[1])

        x_src_start, y_src_start = 0, 0
        x_src_end, y_src_end, _ = im_xpctd.shape

        # Ensure destination indices are within bounds
        x_dst_end = min(x_dst_end, shape[0])
        y_dst_end = min(y_dst_end, shape[1])
        x_src_end = x_src_start + (x_dst_end - x_dst_start)
        y_src_end = y_src_start + (y_dst_end - y_dst_start)

        im_xpctd_padded[x_dst_start:x_dst_end, y_dst_start:y_dst_end] = im_xpctd[
            x_src_start:x_src_end, y_src_start:y_src_end]

        # For result image
        x_dst_start, y_dst_start = max(0, -delta_pos[0]), max(0, -delta_pos[1])
        x_dst_end, y_dst_end = x_dst_start + im_res.shape[0], y_dst_start + im_res.shape[1]

        x_src_start, y_src_start, _ = 0, 0 , 0
        # x_src_end, y_src_end = im_res.shape

        # Ensure destination indices are within bounds
        x_dst_end = min(x_dst_end, shape[0])
        y_dst_end = min(y_dst_end, shape[1])
        x_src_end = x_src_start + (x_dst_end - x_dst_start)
        y_src_end = y_src_start + (y_dst_end - y_dst_start)

        im_res_padded[x_dst_start:x_dst_end, y_dst_start:y_dst_end] = im_res[
            x_src_start:x_src_end, y_src_start:y_src_end]

        score += 1 - IoU(im_xpctd_padded, im_res_padded)
    return score / len(expected)
