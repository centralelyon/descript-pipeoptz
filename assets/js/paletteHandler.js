let selectedPalette;
let marks = {}
let primitive = {}
let palette_cat = {}

let stWidth = 1
let mode = "stroke"

let paletteScale = 1
let paletteOrigin = {x: 0, y: 0};
const paletteInitCoords = {x: 0, y: 0};
let paletteTempCan

let stColor = '#333'
let primRot

let global_anchors = {}
let currAnchor = 0

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
                        angle: 90,
                        stroke_width: 1
                    }
                }
            }
        }
    }


    const mess = getOptions()

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

            // "<div class='primitiveData'>" +
            // "<p class='primitiveLabel'> Growth </p>" +
            // "<select id='" + key + "_primitiveGrowth'>" +
            // "<option>start</option>" +
            // "<option>middle</option>" +
            // "<option selected>end</option>" +
            // "</select>" +
            // "</div>" +

            "<div class='primitiveData'>" +
            "<p class='primitiveLabel'> Anchor </p>" +
            "<select id='" + key + "_primitiveAnchor'>" +
            "<option selected>start</option>" +
            "<option>middle</option>" +
            "<option >end</option>" +
            "</select>" +
            "</div>" +

            "<div class='primitiveData'>" +
            "<p class='primitiveLabel'> Link to Anchor </p>" +
            "<select id='" + key + "_primitivelinkedTo' class='primitiveLinkTo'>" +
            +mess +
            "</select>" +
            "</div>" +

            "<div class='primitiveData'>" +
            "<p class='primitiveLabel'> Angle </p>" +
            "<input type='number' id='" + key + "_primitiveAngle' style='width: 70px' value='90'>" +
            "</div>" +

            "<div class='primitiveData'>" +
            "<p class='primitiveLabel'> Color </p>" +
            "<input type='color' id='" + key + "_primitiveColor'>" +
            "</div>" +

            "<div class='primitiveData'>" +
            "<p class='primitiveLabel'> Stroke Width </p>" +
            "<input type='range' id='" + key + "_primitiveWidth' style='width: 70px' min='1' max='10' value='1'>" +
            "</div>"


        tdiv.appendChild(tdiv_mark)

        container.appendChild(tdiv)

        setPrimitveEvents("", key)
    }

    for (const [key, value] of Object.entries(categories)) {
        if (key !== "default") {
            const tdiv = document.createElement("div")
            tdiv.id = "palette_" + key
            tdiv.className = "paletteMarks"
            tdiv.innerHTML = "<h4 class='paletteData'>" + key + ":</h4>"

            const tdiv_mark = document.createElement("div")
            tdiv_mark.id = "mark_" + key
            tdiv_mark.className = "paletteMark"
            tdiv_mark.setAttribute("key", key)
            let mess = getMarks()


            if (value.prototype) {
                palette_cat[key] = {
                    type: "sample",
                    apply: "none",
                    color: value.color,
                    name: key,
                    proto: value.prototype,
                }


                let mess = getOptions()

                tdiv_mark.innerHTML =
                    "<div class='primitiveData'>" +
                    "<p class='primitiveLabel'> Link to Anchor </p>" +
                    "<select id='" + key + "_catlinkedTo' class='catLinkTo'>" +
                    "<option selected>None</option>" +
                    +"" + mess +
                    "</select>" +
                    "</div>" +

                    "<div class='primitiveData'>" +
                    "<canvas id='canvas_" + key + "' style='width: 60px;height: 60px'>'" +
                    "</div>" +

                    "<div class='primitiveData'>" +
                    "<p class='primitiveLabel'> Color </p>" +
                    "<input type='color' value='" + categories[key].color + "' id='" + key + "_catColor'>" +
                    "</div>"


                /*            "<div class='primitiveData'>" +
                            "<p class='primitiveLabel'> Color </p>" +
                            "<input type='color' value='" + categories[key].color + "' id='" + key + "_catColor'>" +
                            "</div>"*/

            } else {

                palette_cat[key] = {
                    type: "attribute",
                    apply: "none",
                    color: value.color,
                    name: key
                }

                tdiv_mark.innerHTML =
                    "<div class='primitiveData'>" +
                    "<p class='primitiveLabel'> Link to Mark </p>" +
                    "<select id='" + key + "_catlinkedTo' class='catLinkTo'>" +
                    "<option selected>None</option>" +
                    +"" + mess +
                    "</select>" +
                    "</div>" +

                    "<div class='primitiveData'>" +
                    "<p class='primitiveLabel'> Color </p>" +
                    "<input type='color' value='" + categories[key].color + "' id='" + key + "_catColor'>" +
                    "</div>"
            }

            tdiv.appendChild(tdiv_mark)
            container.appendChild(tdiv)

            setCatEvents("", key)

            if (value.prototype) {
                let can = document.getElementById("canvas_" + key);

                let cont = can.getContext("2d")
                if (value.prototype.canvas.width < 60) {
                    can.width = value.prototype.canvas.width
                }
                if (value.prototype.canvas.height < 60) {
                    can.height = value.prototype.canvas.height
                }


                cont.drawImage(value.prototype.canvas, 0, 0)
            }
        }
    }


    let trange = document.getElementById("strokewidth")

    trange.onchange = function (e) {

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

    document.getElementById("paletteContainer").style.display = "block";
    primRot = undefined
    let num = el.getAttribute("number")
    let key = el.getAttribute("key")

    selectedPalette = [key, num]

    paletteResetZoom()

    let can = document.getElementById("paletteEdit")
    let cont = can.getContext("2d")

    let trec = can.getBoundingClientRect()

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

    document.getElementById("paletteEditRotate").oninput = function (e) {
        primRot = +this.value
        paletteRotate(primRot)

    }
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


        if (selProto.anchors) {
            selProto.anchors[currAnchor] = {
                x: xy.x,
                y: xy.y,
                color: catColors[currAnchor],
                rx: xy.x / paletteTempCan.width,
                ry: xy.y / paletteTempCan.height,
                px: (xy.x - paletteTempCan.width / 2 + tw / 2),
                py: (xy.y - paletteTempCan.height / 2 + th / 2),
                prx: (xy.x - paletteTempCan.width / 2 + tw / 2) / paletteTempCan.width,
                pry: (xy.y - paletteTempCan.height / 2 + th / 2) / paletteTempCan.height,
            }
        } else {

            selProto.anchors = {
                currAnchor: {
                    x: xy.x,
                    y: xy.y,
                    color: catColors[currAnchor],
                    rx: xy.x / paletteTempCan.width,
                    ry: xy.y / paletteTempCan.height,
                    px: (xy.x - paletteTempCan.width / 2 + tw / 2),
                    py: (xy.y - paletteTempCan.height / 2 + th / 2),
                    prx: (xy.x - paletteTempCan.width / 2 + tw / 2) / paletteTempCan.width,
                    pry: (xy.y - paletteTempCan.height / 2 + th / 2) / paletteTempCan.height,
                },
            }
            ;

        }

        global_anchors[currAnchor] = {
            from: selectedPalette[0],
            data_from: selProto.anchors[currAnchor]
        }

        updateAnchorCont()

        updateLinkTo()

        // mode = "stroke"

        // document.getElementById("selectedButton2").removeAttribute("id")
        // doc
        // el.setAttribute("id", "selectedButton2")
    }
}


function updateAnchorCont() {

    let container = document.getElementById('anchorsContainer')

    container.innerHTML = ''

    for (const [key, value] of Object.entries(global_anchors)) {

        const tdiv = document.createElement('div')

        let sel = ""

        if (key == currAnchor) {
            sel = " selectedAnchor"
            console.log("dsadas");
        }

        tdiv.setAttribute('id', 'currAnchor_' + key)
        tdiv.setAttribute('class', 'currAnchor' + sel)

        tdiv.innerHTML = key
        tdiv.onclick = function (e) {
            document.querySelector(".selectedAnchor").classList.remove("selectedAnchor")
            this.classList.add("selectedAnchor")
            const id = this.getAttribute('id')
            currAnchor = id.split("_")[1]
        }
        container.appendChild(tdiv)
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


    // cont.drawImage(paletteTempCan, paletteInitCoords.x, paletteInitCoords.y);
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

    if (primRot) {
        cont.translate(paletteTempCan.width / 2, paletteTempCan.height / 2);
        cont.rotate(toRad(-primRot));
        strokePoint[0] = -paletteTempCan.width / 2 + strokePoint[0]
        strokePoint[1] = -paletteTempCan.height / 2 + strokePoint[1]
        x = -paletteTempCan.width / 2 + x
        y = -paletteTempCan.height / 2 + y
    }


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
    tcon.clearRect(0, 0, 9000, 9000);

    // if (primRot) {
    //     tcon.save()
    //     tcon.translate(paletteTempCan.width / 2, paletteTempCan.height / 2);
    //     tcon.rotate(toRad(primRot));
    //     tcon.drawImage(paletteTempCan, -paletteTempCan.width / 2, -paletteTempCan.height / 2, paletteTempCan.width, paletteTempCan.height);
    //     tcon.restore();
    // } else {
    tcon.drawImage(cont.canvas, 0, 0)
    // }

    //
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

    if (primRot) {
        tcon.save()
        tcon.translate(paletteTempCan.width / 2, paletteTempCan.height / 2);
        tcon.rotate(toRad(primRot));
        tcon.drawImage(paletteTempCan, -paletteTempCan.width / 2, -paletteTempCan.height / 2, paletteTempCan.width, paletteTempCan.height);
        tcon.restore();
    } else {
        tcon.drawImage(paletteTempCan, 0, 0)
    }

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

function paletteRotate(angle) {
    let tcan = document.getElementById('paletteEdit');
    let tcont = tcan.getContext('2d');


    tcont.clearRect(0, 0, 9000, 9000)

    tcont.save()
    tcont.translate(paletteTempCan.width / 2, paletteTempCan.height / 2);
    tcont.rotate(toRad(angle));
    tcont.drawImage(paletteTempCan, -paletteTempCan.width / 2, -paletteTempCan.height / 2, paletteTempCan.width, paletteTempCan.height);
    tcont.restore();

    // paletteTempCan = can


    // tcont.drawImage(paletteTempCan, paletteInitCoords.x, paletteInitCoords.y);
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


    cont.save()
    cont.translate(paletteTempCan.width / 2, paletteTempCan.height / 2);
    cont.rotate(toRad(primRot));
    cont.drawImage(paletteTempCan, -paletteTempCan.width / 2, -paletteTempCan.height / 2, paletteTempCan.width, paletteTempCan.height);
    cont.restore();
    // cont.drawImage(paletteTempCan, paletteInitCoords.x, paletteInitCoords.y);
}


function paletteScaleAt(x, y, scaleBy) {  // at pixel coords x, y scale by scaleBy
    paletteScale *= scaleBy;
    paletteOrigin.x = x - (x - paletteOrigin.x) * scaleBy;
    paletteOrigin.y = y - (y - paletteOrigin.y) * scaleBy;
}


function savePalette() {
    const corn = getBBox(paletteTempCan)

    const resCan = marks[selectedPalette[0]][selectedPalette[1]].proto.canvas

    resCan.width = corn[1][0] - corn[0][0]
    resCan.height = corn[1][1] - corn[0][1]

    const resCont = resCan.getContext('2d')

    resCont.save()
    resCont.translate(resCan.width / 2, resCan.width / 2);
    resCont.rotate(toRad(primRot));
    // resCont.drawImage(paletteTempCan, -paletteTempCan.width / 2, -paletteTempCan.height / 2, paletteTempCan.width, paletteTempCan.height);


    resCont.drawImage(paletteTempCan,
        corn[0][0],
        corn[0][1],
        resCan.width,
        resCan.height,
        -resCan.width / 2,
        -resCan.height / 2,
        resCan.width,
        resCan.height,
    )
    resCont.restore();
    marks[selectedPalette[0]][selectedPalette[1]].proto.corners = corn;

    document.getElementById("paletteContainer").style.display = "none";

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


function setPrimitveEvents(type, key) { //TODO: key is out of scope

    document.getElementById(key + "_primitiveAngle").onchange = function () {
        const key = this.getAttribute("id").split("_")[0];
        primitive[key].angle = this.value
    }

    document.getElementById(key + "_primitiveWidth").onchange = function () {
        const key = this.getAttribute("id").split("_")[0];
        primitive[key].stroke_width = this.value
    }

    document.getElementById(key + "_primitiveColor").oninput = function () {
        const key = this.getAttribute("id").split("_")[0];
        primitive[key].color = this.value
    }

    document.getElementById(key + "_primitiveAnchor").onchange = function () {
        const key = this.getAttribute("id").split("_")[0];
        primitive[key].anchor_type = this.value
    }

    /*    document.getElementById(key + "_primitiveGrowth").onchange = function () {
            const key = this.getAttribute("id").split("_")[0];
            primitive[key].growth = this.value
        }*/
}


function setCatEvents(type, key) {

    document.getElementById(key + "_catColor").oninput = function () {
        const key = this.getAttribute("id").split("_")[0];
        palette_cat[key].color = this.value
    }


    document.getElementById(key + "_catlinkedTo").onchange = function () {
        const key = this.getAttribute("id").split("_")[0];
        palette_cat[key].apply = this.value
    }

}

function hidePaletteContainer() {

    document.getElementById("paletteContainer").style.display = "none";
}

function updateLinkTo() {

    const mess = getOptions()

    const selects = document.querySelectorAll(".primitiveLinkTo")

    selects.forEach(select => {

        select.innerHTML = mess
    })

}

function getOptions() {
    let ancres = Object.keys(global_anchors)

    let mess = ""


    for (let i = 0; i < ancres.length; i++) {

        mess += "<option id ='anchor_" + ancres[i] + "'>" + ancres[i] + "</option>"
    }

    return mess

}


function getMarks() {
    let tmarks = Object.keys(marks)
    let prim = Object.keys(primitive)


    let mess = ""

    for (let i = 0; i < tmarks.length; i++) {
        mess += "<option type='mark' id ='apply2_" + tmarks[i] + "'>" + tmarks[i] + "</option>"
    }
    for (let i = 0; i < prim.length; i++) {
        mess += "<option type='prim' id ='apply2_" + prim[i] + "'>" + prim[i] + "</option>"
    }

    return mess
}

function addAnchor() {

    let nb = Object.keys(global_anchors).length

    global_anchors[nb] = {}

    currAnchor = nb

    updateAnchorCont()

}