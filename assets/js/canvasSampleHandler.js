

function resetListeners(can) {
    // can.onmousemove = null;
    // can.onmousedown = null;
    // can.onmouseup = null;

    can.onpointerdown = null
    can.onpointermove = null
    can.onpointerup = null

}

function switchMode(type) {
    let can = document.getElementById("inVis")

    if (type === "rect") {
        resetListeners(can)


        can.onpointerdown = e => {
            origin = {x: e.offsetX, y: e.offsetY};
        };

        can.onpointerup = e => {

            const torigin = {...origin}

            origin = null;

            render(e);
            addRectSample(torigin.x, torigin.y, e.offsetX - torigin.x, e.offsetY - torigin.y);
        };
        can.onpointermove = render;
    } else if (type === "free") {

        resetListeners(can)

        /*
                can.onmousedown = onMouseDown
                can.onmousemove = onMouseMove
                can.onmouseup = onMouseUp
        */

        can.onpointerdown = onMouseDown
        can.onpointermove = onMouseMove
        can.onpointerup = onMouseUp

    }


}


//----------------- Rect stuff

const drawImage = () => {
    let can = document.getElementById("inVis")
    let cont = can.getContext('2d');
    let w = can.getBoundingClientRect().width
    let h = can.getBoundingClientRect().height

    cont.drawImage(currImg, 0, 0, w, h);
}

const drawSelection = (e) => {
    let can = document.getElementById("inVis")
    let cont = can.getContext('2d');

    cont.strokeStyle = "#000";
    cont.beginPath();
    cont.rect(origin.x, origin.y, e.offsetX - origin.x, e.offsetY - origin.y);
    cont.stroke();
};

const clear = () => {
    let can = document.getElementById("inVis")
    let cont = can.getContext('2d');

    let w = can.getBoundingClientRect().width
    let h = can.getBoundingClientRect().height

    // cont.strokeStyle = "#fff";
    cont.clearRect(0, 0, w, h);
};

const render = (e) => {
    clear();
    drawImage();

    if (origin) drawSelection(e);
}


//----------------- Free-form stuff
function draw(cont, x, y) {

    cont.beginPath();
    cont.strokeStyle = categories[selectedCategory].color
    cont.moveTo(...strokePoint);
    cont.lineTo(x, y);
    cont.stroke()
    cont.closePath();

}

function onMouseDown(e) {
    let xy = getMousePos(e);
    strokePoint = [xy.x, xy.y];
    mouseDown = 1;
}

function onMouseUp() {
    mouseDown = 0
    addFreeSample(stroke)
    stroke = []
    // drawImage()

}

function onMouseMove(e) {
    if (mouseDown === 1) {
        let can = document.getElementById("inVis")
        let cont = can.getContext('2d');

        let xy = getMousePos(e);
        draw(cont, xy.x, xy.y);
        stroke.push([...strokePoint])
        strokePoint = [xy.x, xy.y];
    }
}

function getMousePos(e) {
    let o = {};

    if (e.offsetX) {
        o.x = e.offsetX
        o.y = e.offsetY
    } else if (e.layerX) {
        o.x = e.layerX
        o.y = e.layerY
    }
    return o;
}

function addFreeSample(points) {
    let corners = getRect(points)

    let can = document.getElementById("inVis")
    let trec = can.getBoundingClientRect()
    let tx = trec.width
    let ty = trec.height


    let tcan = document.createElement('canvas');
    let tcont = tcan.getContext('2d');


    tcan.width = corners[1][0] - corners[0][0]
    tcan.height = corners[1][1] - corners[0][1]

    tcan.style.border = "solid " + categories[selectedCategory].color + " 2px"


    let tw = corners[1][0] - corners[0][0]
    let th = corners[1][1] - corners[0][1]


    let tres = {
        x: corners[0][0],
        y: corners[0][1],
        width: tw,
        height: th,
        type: "free",
        canvas: tcan,
        // img: tcan.toDataURL("image/png"), //use of imgs for furture works -> load from json ?
        rx: corners[0][0] / tx,
        ry: corners[0][1] / ty,
        rWidth: tw / tx,
        rHeight: th / ty,
        category: categories[selectedCategory],
        data: {}
    }

    // console.log(points[0][0] - corners[0][0], points[0][1] - corners[0][1]
    // console.log(points[1][0] - corners[0][0], points[1][1] - corners[0][1])

    tcont.beginPath();
    tcont.moveTo(points[0][0] - corners[0][0], points[0][1] - corners[0][1]);
    for (let i = 1; i < points.length; i++) {
        tcont.lineTo(points[i][0] - corners[0][0], points[i][1] - corners[0][1]);
    }
    // tcont.stroke()
    tcont.closePath();
    tcont.clip()


    tcont.drawImage(currImg,
        tres.rx * currImg.width,
        tres.ry * currImg.height,
        tres.rWidth * currImg.width,
        tres.rHeight * currImg.height,
        0,
        0,
        tw,
        th
    )

    let marks = document.getElementById("marks")

    marks.append(tcan)

    sampleData.push(tres)
}

function getRect(points) {
    let xs = points.map(d => d[0])
    let ys = points.map(d => d[1])

    return [
        [Math.min(...xs), Math.min(...ys)],
        [Math.max(...xs), Math.max(...ys)],
    ]
}