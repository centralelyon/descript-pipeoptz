let options_type = {}
let selectedPalette;
let marks = {}
let stWidth = 1
let mode = "stroke"

let paletteScale = 1
let paletteOrigin = {x: 0, y: 0};
const paletteInitCoords = {x: 0, y: 0};
let paletteTempCan

function populateSelect() {
    let select = document.getElementById("collageSel")

    let data = Object.keys(dataEncoding)


    let cats = Object.keys(categories)

    let mess = ""

    for (let j = 0; j < data.length; j++) {
        mess += "<option value='" + data[j] + "'>" + data[j] + "</option>"
        options_type[data[j]] = "data"
    }
    for (let j = 0; j < cats.length; j++) {
        if (categories[cats[j]].prototype)
            mess += "<option value='" + cats[j] + "'>" + cats[j] + "</option>"
        options_type[cats[j]] = "cat"
    }
    select.innerHTML = mess

    select.oninput = function (e) {
        console.log(e.target.value);

        const val = e.target.value

        if (options_type[val] === "data") {
            document.getElementById("dataVal").disabled = false
        }


    }


}


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

    let trange = document.getElementById("strokewidth")

    trange.onchange = function (e) {
        // console.log(e.target);
        const val = parseInt(document.getElementById("strokewidth").value);
        stWidth = val
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
    console.log(trec.width);
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


    can.onpointerdown = onMouseDown
    can.onpointermove = onMouseMovePalette
    can.onpointerup = onMouseUpPalette
    // can.onwheel = paletteZoom

    can.addEventListener("mousewheel", paletteZoom, false);
    can.addEventListener("DOMMouseScroll", paletteZoom, false);
    // can.addEventListener("mousewheel", zoom, false);
    // can.addEventListener("DOMMouseScroll", zoom, false);

}


function paletteResetZoom() {
    let can = document.getElementById('paletteEdit');
    let cont = can.getContext('2d');
    cont.setTransform(1, 0, 0, 1, 0, 0);
    paletteScale = 1
    paletteOrigin.x = 0
    paletteOrigin.y = 0

    paletteTempCan = document.createElement("canvas");
    paletteTempCan.width = can.width;
    paletteTempCan.height = can.height;

    let pcont = paletteTempCan.getContext("2d");

    pcont.drawImage(can, 0, 0)


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

function drawPalette(cont, x, y, w, type) {
    cont.save()
    if (type === "erase")
        cont.globalCompositeOperation = 'destination-out';
    cont.beginPath();
    cont.strokeStyle = "#333"
    cont.lineWidth = w
    cont.moveTo(...strokePoint);
    cont.lineTo(x, y);
    cont.stroke()
    cont.closePath();
    cont.restore()
}

function onMouseMovePalette(e) {
    if (mouseDown === 1) {
        let can = document.getElementById("paletteEdit")
        let cont = can.getContext('2d');
        e.preventDefault()
        let xy = getMousePos(e);
        drawPalette(cont, xy.x, xy.y, stWidth, mode);
        stroke.push([...strokePoint])
        strokePoint = [xy.x, xy.y];
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
    }
}

function switchmod(val) {
    mode = val
}


function paletteZoom(e) {
    let can = document.getElementById('paletteEdit');
    let cont = can.getContext('2d');

    paletteTempCan = document.createElement("canvas");
    paletteTempCan.width = can.width;
    paletteTempCan.height = can.height;

    let pcont = paletteTempCan.getContext("2d");

    pcont.drawImage(can, 0, 0,can.width,can.height,0,0,0,0)
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
