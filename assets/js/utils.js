function euclidian_dist(a, b) {
    let sum = 0;

    for (let n = 0; n < a.length; n++) {
        sum += Math.pow(a[n] - b[n], 2)
    }
    return Math.sqrt(sum)
}

function toScreen(point, origin, scale) {
    const x = point.x * scale + origin.x;
    const y = point.y * scale + origin.y;
    return {x, y};
}

function toWorld(point, origin, scale) {  // convert to world coordinates
    const x = (point.x - origin.x) / scale;
    const y = (point.y - origin.y) / scale;
    return {x, y};
}

function get_orr(p1, p2) {
    let a = (Math.atan2(p2[1] - p1[1], p2[0] - p1[0]) * 180) / Math.PI;
    // a += 90;
    return a;
}