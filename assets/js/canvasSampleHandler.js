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

            clear();
            drawImage();

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

    cont.drawImage(currImg, 0, 0, ...viewDim);
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

    if (origin) {
        clear();
        drawImage();
        drawSelection(e);
    }
}

async function addRectSample(x, y, width, height) {


    let coords = curateCoordinates(x, y, width, height);


    let can = document.getElementById("inVis")
    let trec = can.getBoundingClientRect()
    let tx = trec.width
    let ty = trec.height


    let tcan = document.createElement('canvas');
    let tcont = tcan.getContext('2d');


    tcan.width = coords[2]
    tcan.height = coords[3]

    tcan.style.border = "solid " + categories[selectedCategory].color + " 2px"

    let tcat = {}

    tcat[selectedCategory] = categories[selectedCategory]

    let tres = {
        x: coords[0],
        y: coords[1],
        width: coords[2],
        height: coords[3],
        type: "rect",
        canvas: tcan,
        // img: tcan.toDataURL("image/png"), //use of imgs for furture works -> load from json ?
        rx: coords[0] / tx,
        ry: coords[1] / ty,
        rWidth: coords[2] / tx,
        rHeight: coords[3] / ty,
        categories: tcat,
        data: {}
    }

    let dp = tres


    sampleData.push(tres)

    let marks = document.getElementById("marks")

    marks.append(tcan)

    tcont.drawImage(currImg,
        Math.round(dp.rx * currImg.width),
        Math.round(dp.ry * currImg.height),
        Math.round(dp.rWidth * currImg.width),
        Math.round(dp.rHeight * currImg.height),
        0,
        0,
        dp.width,
        dp.height);


}


function curateCoordinates(x, y, width, height) {

    if (width < 0) {
        width = Math.abs(width)
        x = Math.max(x - width, 0)
    }

    if (height < 0) {
        height = Math.abs(height)
        y = Math.max(y - height, 0)
    }

    return [x, y, width, height]
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
        e.preventDefault()
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

async function addFreeSample(points) {
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

    let tcat = {}

    tcat[selectedCategory] = categories[selectedCategory]

    const vectors = PCA.getEigenVectors(points)

    const angle = get_orr(vectors[0].vector, vectors[1].vector)

    let tres = {
        x: corners[0][0],
        y: corners[0][1],
        width: tw,
        height: th,
        type: "free",
        canvas: tcan,
        perimeter: [...points],
        // img: tcan.toDataURL("image/png"), //use of imgs for furture works -> load from json ?
        rx: corners[0][0] / tx,
        ry: corners[0][1] / ty,
        rWidth: tw / tx,
        rHeight: th / ty,
        categories: tcat,
        data: {
            orientation: Math.round(angle * 100) / 100
        }
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

function tempTest() {


    let cont = sampleData[0].canvas.getContext("2d")

    let dp = sampleData[0]
    cont.drawImage(currImg,
        dp.rx * currImg.width,
        dp.ry * currImg.height,
        dp.rWidth * currImg.width,
        dp.rHeight * currImg.height,
        0,
        0,
        dp.width,
        dp.height);

    /*    tcont.drawImage(currImg,
            tres.rx * currImg.width,
            tres.ry * currImg.height,
            tres.rWidth * currImg.width,
            tres.rHeight * currImg.height,
            0,
            0,
            tw,
            th*/
}