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

function docReady(fn) {
    // see if DOM is already available
    if (document.readyState === "complete" || document.readyState === "interactive") {
        // call on next available tick
        setTimeout(fn, 1);
    } else {
        document.addEventListener("DOMContentLoaded", fn);
    }
}

function getKeyByValue(object, value) {
    return Object.keys(object).find(key => object[key] === value);
}



function getPoint(theta, dist, pt) {
    theta = toRad(theta)

    return {
        x: pt.x + (dist * Math.cos(theta)),
        y: pt.y + (dist * Math.sin(theta))

    }

}

function toRad(degrees) {
    return degrees * (Math.PI / 180);
}


function rotate_point(src, pt, angle) {
    angle = toRad(angle)

    return {
        x: Math.cos(angle) * (pt.x - src.x) - Math.sin(angle) * (pt.y - src.y) + src.x,
        y: Math.sin(angle) * (pt.x - src.x) + Math.cos(angle) * (pt.y - src.y) + src.y,
    }

}

// ----------------------------- DATA MANIPULATION STUFF ----------------------------------------------
function tempEdit() {


    for (let i = 0; i < sampleData.length; i++) {
        // sampleData[i]["data"] = {}

        sampleData[i]["data"]["stem"] = {value: sampleData[i]["data"]["stem"]}

        // delete sampleData[i]["data"]["stem "]

    }
}


async function tsave() {

    let dat = await getTData()

    loadImg(dat.background)
}

async function getTData() {
    const url = "assets/images/tempLoad/clean.json";
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Response status: ${response.status}`);
        }

        return await response.json();

    } catch (error) {
        return error
    }
}