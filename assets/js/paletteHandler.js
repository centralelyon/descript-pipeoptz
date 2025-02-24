let selectedPalette;
let marks = {}
let primitive = {}
let stWidth = 1
let mode = "stroke"

let paletteScale = 1
let paletteOrigin = {x: 0, y: 0};
const paletteInitCoords = {x: 0, y: 0};
let paletteTempCan
let stColor = '#333'


function fillPalette(range = [0, 10]) {

    marks = {}
    const container = document.getElementById("paletteCont")
    container.innerHTML = ""

    for (let i = 0; i < sampleData.length; i++) {

        if (sampleData[i]["data"]) {
            for (const [key, value] of Object.entries(sampleData[i].data)) {
                if (value?.proto?.canvas) {
                    if (marks[key] === undefined) {
                        marks[key] = {}
                    }

                    if (marks[key][value.value] === undefined) {
                        value.type = "area"
                        marks[key][value.value] = value
                    }
                }
            }
        }
    }

    for (const [key, value] of Object.entries(marks)) {
        const tdiv = document.createElement("div")
        tdiv.id = "palette_" + key
        tdiv.className = "paletteMarks"
        tdiv.innerHTML = "<h4 class='paletteData'>" + key + ":</h4>"
        for (let i = range[0]; i < range[1]; i++) {
            const tdiv_mark = document.createElement("div")
            tdiv_mark.id = "mark_" + key
            tdiv_mark.className = "paletteMark"
            tdiv_mark.setAttribute("number", "" + i)
            tdiv_mark.setAttribute("key", key)
            tdiv_mark.innerHTML = "<p class='paletteNumber'>" + i + "</p>"
            if (value[i]) {
                tdiv_mark.append(value[i].proto.canvas)
            } else {
                const tcan = document.createElement("canvas")
                tcan.width = 60
                tcan.height = 60
                tdiv_mark.append(tcan)
                value[i] = {
                    value: i,
                    type: "fake",
                    proto: {canvas: tcan, corners: [[0, 0], [tcan.width, tcan.height]]},
                }
            }
            tdiv_mark.onclick = editPalette
            tdiv.appendChild(tdiv_mark)
        }
        container.appendChild(tdiv)
    }


    let tkeys = Object.keys(marks)

    for (let i = 0; i < sampleData.length; i++) {
        if (sampleData[i]["data"]) {
            for (const [key, value] of Object.entries(sampleData[i].data)) {
                if (!tkeys.includes(key)) {
                    primitive[key] = {
                        shape: "line",
                        growth: "end",
                        anchor_type: "start",
                        color: "#555",
                        angle: "90"
                    }
                }
            }

        }
    }


    for (const [key, value] of Object.entries(primitive)) {
        const tdiv = document.createElement("div")
        tdiv.id = "palette_" + key
        tdiv.className = "paletteMarks"
        tdiv.innerHTML = "<h4 class='paletteData'>" + key + ":</h4>"
        const tdiv_mark = document.createElement("div")
        tdiv_mark.id = "mark_" + key
        tdiv_mark.className = "paletteMark"
        tdiv_mark.setAttribute("key", key)
        tdiv_mark.innerHTML =
            "<div class='primitiveData'>" +
            "<p class='primitiveLabel'> Shape </p>" +
            "<select>" +
            "<option selected>line</option>" +
            // "<option>start</option>" +
            // "<option>middle</option>" +
            "</select>" +
            "</div>" +

            "<div class='primitiveData'>" +
            "<p class='primitiveLabel'> Growth </p>" +
            "<select>" +
            "<option selected>end</option>" +
            "<option>start</option>" +
            "<option>middle</option>" +
            "</select>" +
            "</div>" +

            "<div class='primitiveData'>" +
            "<p class='primitiveLabel'> Anchor </p>" +
            "<select>" +
            "<option >end</option>" +
            "<option selected>start</option>" +
            "<option>middle</option>" +
            "</select>" +
            "</div>" +

            "<div class='primitiveData'>" +
            "<p class='primitiveLabel'> Color </p>" +
            "<input type='color' id='primitiveColor'>" +
            "</div>" +

            "<div class='primitiveData'>" +
            "<p class='primitiveLabel'> Angle </p>" +
            "<input type='number' id='primitiveAngle' style='width: 70px' value='90'>" +
            "</div>"


        tdiv.appendChild(tdiv_mark)

        container.appendChild(tdiv)
    }


    let trange = document.getElementById("strokewidth")

    trange.onchange = function (e) {
        // console.log(e.target);
        const val = parseInt(document.getElementById("strokewidth").value);
        stWidth = val
    }

    document.getElementById('strokecolor').onchange = function () {

        stColor = this.value
    }
}


function editPalette(e) {
    // console.log(this);
    let el = this
    let num = el.getAttribute("number")
    let key = el.getAttribute("key")

    selectedPalette = [key, num]

    let can = document.getElementById("paletteEdit")
    let cont = can.getContext("2d")

    let trec = can.getBoundingClientRect() //TODO: THIS DOES NOT GIVE CORRECT VALUES ?!

    can.width = trec.width;
    can.height = trec.height;
    // console.log(trec);
    let w = trec.width
    let h = trec.height
    // corners[1][0] - corners[0][0]
    let tw = marks[key][num].proto.corners[1][0] - marks[key][num].proto.corners[0][0]
    let th = marks[key][num].proto.corners[1][1] - marks[key][num].proto.corners[0][1]


    cont.clearRect(0, 0, 900, 900)
    cont.drawImage(marks[key][num].proto.canvas,
        0,
        0,
        marks[key][num].proto.canvas.width,
        marks[key][num].proto.canvas.height,
        can.width / 2 - tw / 2,
        can.height / 2 - th / 2,
        tw,
        th
    );


    can.onpointerdown = onMouseDownPalette
    can.onpointermove = onMouseMovePalette
    can.onpointerup = onMouseUpPalette
    can.onclick = onClickPalette


    let control = document.getElementById('editControl')

    control.onclick = function (e) {

        let el = e.target

        if (el.matches('img')) {
            el = el.parentNode
            if (el.classList.contains('selectablePallete')) {
                document.getElementById("selectedButton2").removeAttribute("id")
                el.setAttribute("id", "selectedButton2")

            }
        }

    }
    // can.onwheel = paletteZoom

    paletteTempCan = document.createElement("canvas");
    paletteTempCan.width = can.width;
    paletteTempCan.height = can.height;

    let tcon = paletteTempCan.getContext('2d')

    tcon.drawImage(can, 0, 0)

    can.addEventListener("mousewheel", paletteZoom, false);
    can.addEventListener("DOMMouseScroll", paletteZoom, false);
    // can.addEventListener("mousewheel", zoom, false);
    // can.addEventListener("DOMMouseScroll", zoom, false);

}

function onClickPalette(e) {
    if (mode === "anchor") {
        let xy = getMousePos(e);
        xy = toWorld(xy, paletteOrigin, paletteScale)


        let selProto = marks[selectedPalette[0]][selectedPalette[1]].proto


        let tw = selProto.corners[1][0] - selProto.corners[0][0]
        let th = selProto.corners[1][1] - selProto.corners[0][1]


        let tp = {
            x: (paletteTempCan.width / 2 - tw / 2) / paletteScale,
            y: (paletteTempCan.height / 2 - th / 2) / paletteScale
        }

        if (selProto.anchors) {
            selProto.anchors[0] = {
                x: xy.x,
                y: xy.y,
                color: catColors[0],
                rx: xy.x / paletteTempCan.width,
                ry: xy.y / paletteTempCan.height,

                px: (xy.x - paletteTempCan.width / 2 - tw / 2),
                py: (xy.y - paletteTempCan.height / 2 - th / 2),
                prx: (xy.x - paletteTempCan.width / 2 - tw / 2) / paletteTempCan.width,
                pry: (xy.y - paletteTempCan.height / 2 - th / 2) / paletteTempCan.height,
            }
        } else {

            selProto.anchors = {
                0: {
                    x: xy.x,
                    y: xy.y,
                    color: catColors[0],
                    rx: xy.x / paletteTempCan.width,
                    ry: xy.y / paletteTempCan.height,
                    px: (xy.x - paletteTempCan.width / 2 - tw / 2),
                    py: (xy.y - paletteTempCan.height / 2 - th / 2),
                    prx: (xy.x - paletteTempCan.width / 2 - tw / 2) / paletteTempCan.width,
                    pry: (xy.y - paletteTempCan.height / 2 - th / 2) / paletteTempCan.height,
                },
            };

        }

        // mode = "stroke"

        // document.getElementById("selectedButton2").removeAttribute("id")
        // doc
        // el.setAttribute("id", "selectedButton2")
    }
}

function displayCircle(xy) {


    let can = document.getElementById('paletteEdit');
    let cont = can.getContext('2d');
    cont.save()
    cont.beginPath();
    cont.lineWidth = 1
    cont.arc(xy.x, xy.y, stWidth, 0, 2 * Math.PI);
    cont.stroke();
    cont.closePath();
    cont.restore()
}


function paletteResetZoom() {
    let can = document.getElementById('paletteEdit');
    let cont = can.getContext('2d');
    cont.setTransform(1, 0, 0, 1, 0, 0);
    paletteScale = 1
    paletteOrigin.x = 0
    paletteOrigin.y = 0
    //
    // paletteTempCan = document.createElement("canvas");
    // paletteTempCan.width = can.width;
    // paletteTempCan.height = can.height;


    cont.drawImage(paletteTempCan, paletteInitCoords.x, paletteInitCoords.y);
    // resetCan()
}

function onMouseUpPalette() {
    mouseDown = 0
    // addFreeSample(stroke)
    // console.log(stroke);
    stroke = []
    // drawImage()


}

function drawPalette(cont, x, y, w, type, can) {
    cont.save()
    if (type === "erase")
        cont.globalCompositeOperation = 'destination-out';

    cont.lineCap = 'round';
    cont.lineJoin = 'round';
    cont.beginPath();
    // cont.strokeStyle = "#333"
    cont.strokeStyle = stColor
    cont.lineWidth = w
    cont.moveTo(...strokePoint);
    cont.lineTo(x, y);
    cont.stroke()
    cont.closePath();
    cont.restore()

    let tcon = can.getContext('2d')
    tcon.clearRect(0, 0, 900, 900);
    tcon.drawImage(cont.canvas, 0, 0)
}

function onMouseDownPalette(e) {
    let xy = getMousePos(e);
    xy = toWorld(xy, paletteOrigin, paletteScale)
    strokePoint = [xy.x, xy.y];
    mouseDown = 1;
}


function onMouseMovePalette(e) {
    let xy = getMousePos(e);

    xy = toWorld(xy, paletteOrigin, paletteScale)
    let can = document.getElementById("paletteEdit")
    if (mouseDown === 1) {

        // let cont = can.getContext('2d');
        e.preventDefault()

        let cont = paletteTempCan.getContext('2d')
        drawPalette(cont, xy.x, xy.y, stWidth, mode, can);
        stroke.push([...strokePoint])
        strokePoint = [xy.x, xy.y];
    }
    let tcon = can.getContext('2d')
    tcon.clearRect(0, 0, 9000, 9000);
    tcon.drawImage(paletteTempCan, 0, 0)
    displayCircle(xy)

}

function getClosestPrev() {
    let ind = selectedPalette[1]
    let keys = Object.keys(marks[selectedPalette[0]])

    let bg

    for (let i = ind; i > 0; i--) {
        if (marks[selectedPalette[0]][keys[i]].type !== "fake") {
            bg = marks[selectedPalette[0]][keys[i]]
            break
        }
    }
    loadbg(bg)
}

function loadbg(bg) {
    if (bg) {

        let can = document.getElementById("paletteEdit")
        let cont = can.getContext("2d")

        let tw = bg.proto.corners[1][0] - bg.proto.corners[0][0]
        let th = bg.proto.corners[1][1] - bg.proto.corners[0][1]


        cont.clearRect(0, 0, 900, 900)
        cont.drawImage(bg.proto.canvas,
            0,
            0,
            bg.proto.canvas.width,
            bg.proto.canvas.height,
            can.width / 2 - tw / 2,
            can.height / 2 - th / 2,
            tw,
            th
        );

        paletteTempCan = document.createElement("canvas");
        paletteTempCan.width = can.width;
        paletteTempCan.height = can.height;

        let pcont = paletteTempCan.getContext("2d");

        pcont.drawImage(can, 0, 0, can.width, can.height)
    }

}


function getClosestNext() {
    let ind = selectedPalette[1]
    let keys = Object.keys(marks[selectedPalette[0]])

    let bg

    for (let i = ind; i < keys.length; i++) {
        if (marks[selectedPalette[0]][keys[i]].type !== "fake") {
            bg = marks[selectedPalette[0]][keys[i]]
            break
        }
    }

    loadbg(bg)
}

function switchmod(val) {
    mode = val
}


function paletteZoom(e) {
    let can = document.getElementById('paletteEdit');
    let cont = can.getContext('2d');

    // paletteTempCan = document.createElement("canvas");
    // paletteTempCan.width = can.width;
    // paletteTempCan.height = can.height;

    // let pcont = paletteTempCan.getContext("2d");
    //
    // pcont.drawImage(can, 0, 0, can.width, can.height, 0, 0, 0, 0)
    e.preventDefault();
    let zoomStep = 1.1


    let x = e.offsetX;
    let y = e.offsetY;
    const delta = e.type === "mousewheel" ? e.wheelDelta : -e.detail;

    if (delta > 0) {
        paletteScaleAt(x, y, zoomStep);
    } else {
        paletteScaleAt(x, y, 1 / zoomStep);
    }

    cont.clearRect(0, 0, can.width, can.height);
    cont.setTransform(paletteScale, 0, 0, paletteScale, paletteOrigin.x, paletteOrigin.y);
    cont.drawImage(paletteTempCan, paletteInitCoords.x, paletteInitCoords.y);
}


function paletteScaleAt(x, y, scaleBy) {  // at pixel coords x, y scale by scaleBy
    paletteScale *= scaleBy;
    paletteOrigin.x = x - (x - paletteOrigin.x) * scaleBy;
    paletteOrigin.y = y - (y - paletteOrigin.y) * scaleBy;
}


function savePalette() {
    const corn = getBBox()

    const resCan = marks[selectedPalette[0]][selectedPalette[1]].proto.canvas

    resCan.width = corn[1][0] - corn[0][0]
    resCan.height = corn[1][1] - corn[0][1]

    const resCont = resCan.getContext('2d')

    resCont.drawImage(paletteTempCan,
        corn[0][0],
        corn[0][1],
        resCan.width,
        resCan.height,
        0,
        0,
        resCan.width,
        resCan.height,
    )
    marks[selectedPalette[0]][selectedPalette[1]].proto.corners = corn;

}


function getBBox() {
    let src = opencv.imread(paletteTempCan);

    let dst = opencv.Mat.zeros(src.rows, src.cols, opencv.CV_8UC3);
    let temp = opencv.Mat.zeros(src.rows, src.cols, opencv.CV_8UC3);
    opencv.cvtColor(src, src, opencv.COLOR_RGBA2GRAY, 0);
    let ksize = new opencv.Size(5, 5);

    opencv.GaussianBlur(src, src, ksize, 0, 0, opencv.BORDER_DEFAULT);

    opencv.adaptiveThreshold(src, src, 200, opencv.ADAPTIVE_THRESH_GAUSSIAN_C, opencv.THRESH_BINARY, 17, 16);

    let contours = new opencv.MatVector();
    let hierarchy = new opencv.Mat();

    let contours2 = new opencv.MatVector();
    let hierarchy2 = new opencv.Mat();

// You can try more different parameters
    opencv.findContours(src, contours, hierarchy, opencv.RETR_TREE, opencv.CHAIN_APPROX_SIMPLE);


    for (let i = 0; i < contours.size(); ++i) {

        // let color = new opencv.Scalar(Math.round(Math.random() * 255), Math.round(Math.random() * 255),
        //     Math.round(Math.random() * 255));

        let color = new opencv.Scalar(255, 255, 255);

        opencv.drawContours(temp, contours, i, color, 14, opencv.LINE_8, hierarchy, 100);
    }
    opencv.cvtColor(temp, temp, opencv.COLOR_RGBA2GRAY, 0);
    opencv.findContours(temp, contours2, hierarchy2, opencv.RETR_TREE, opencv.CHAIN_APPROX_SIMPLE);

    const points = []
    for (let i = 0; i < contours2.size(); ++i) {
        hierarchy2
        if (hierarchy2.intPtr(0, i)[3] > 0) {
            console.log(hierarchy2.intPtr(0, i)[3])
            let tt = opencv.contourArea(contours.get(i), false)
            // console.log(tt)
            if (tt > 1) {
                const ci = contours2.get(i)
                let temp = []

                for (let j = 0; j < ci.data32S.length; j += 2) {
                    let p = {}
                    p.x = ci.data32S[j]
                    p.y = ci.data32S[j + 1]
                    temp.push(p)
                }
                points.push([...temp])


                // let color = new opencv.Scalar(255, 255, 255);
                let color = new opencv.Scalar(Math.round(Math.random() * 255), Math.round(Math.random() * 255),
                    Math.round(Math.random() * 255));
                opencv.drawContours(dst, contours2, i, color, 1, opencv.LINE_8, hierarchy2, 100);
            }

        }

    }

    src.delete();
    dst.delete();
    temp.delete();

    contours.delete();
    hierarchy.delete();
    contours2.delete();
    hierarchy2.delete();

    // If there is multiple contours we mix to make the biggest BBox
    let corners = [[undefined, undefined], [undefined, undefined]]
    for (let i = 0; i < points.length; i++) {
        const tpoints = points[i].map(d => ([d.x, d.y]))
        const tcorners = getRect(tpoints)

        for (let j = 0; j < corners.length; j++) {
            for (let k = 0; k < corners.length; k++) {

                if (corners[j][k] === undefined) {
                    corners[j][k] = tcorners[j][k]
                } else if (j === 0) {
                    if (corners[j][k] > tcorners[j][k]) {
                        corners[j][k] = tcorners[j][k]
                    }
                    if (corners[j][k] > tcorners[j][k]) {
                        corners[j][k] = tcorners[j][k]
                    }
                } else if (j === 1) {
                    if (corners[j][k] < tcorners[j][k]) {
                        corners[j][k] = tcorners[j][k]
                    }
                    if (corners[j][k] < tcorners[j][k]) {
                        corners[j][k] = tcorners[j][k]
                    }
                }
            }
        }

    }
    return corners
}


function toBW() {
    let src = opencv.imread(paletteTempCan);

    // paletteTempCan.style.filter = 'grayscale(1)';

    let temp = new opencv.MatVector();
    let temp2 = new opencv.MatVector();
    opencv.split(src, temp)


    let dst = opencv.Mat.zeros(src.rows, src.cols, opencv.CV_8UC3);

    // dst = opencv.merge(src, temp.get(3))

    let mergedPlanes = new opencv.MatVector();


    opencv.cvtColor(src, src, opencv.COLOR_RGBA2GRAY, 1);

    opencv.split(src, temp2)

    mergedPlanes.push_back(temp2.get(0))
    mergedPlanes.push_back(temp2.get(0))
    mergedPlanes.push_back(temp2.get(0))
    mergedPlanes.push_back(temp.get(3))

    // opencv.merge(src, mergedPlanes)
    opencv.merge(mergedPlanes, src)

    opencv.imshow(paletteTempCan, src);


    let can = document.getElementById("paletteEdit")

    let tcon = can.getContext('2d')
    tcon.clearRect(0, 0, 900, 900);
    tcon.drawImage(paletteTempCan, 0, 0)

    src.delete();
    dst.delete();
    mergedPlanes.delete();
    temp.delete();
    temp2.delete();
}


function setAnchor() {

    mode = 'anchor';
}