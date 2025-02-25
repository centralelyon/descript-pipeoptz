let modalScale = 1
let modalOrigin = {x: 0, y: 0};
const initCoords = {x: 0, y: 0};

let clickMod = 'rule';

let clickOrigin = {x: 0, y: 0};

let nbClik = 0
let displayed = false;
let selectedInfo = 'data0'

let deltaZoom = {x: 0, y: 0};
let tempcat
let tempDat

function switchSelectMod(el, type) {
    document.getElementById("selectModBut").removeAttribute("id")
    el.setAttribute("id", "selectModBut");
    clickMod = type
    clickOrigin = {x: 0, y: 0};
    nbClik = 0
    let can = document.getElementById("modalCanvas");

    if (type == "rule") {
        can.style.cursor = "crosshair";
    } else {
        can.style.cursor = "resize";
    }
}


function loadModal(data) {
    const dialog = document.getElementById("markMod");
    dialog.showModal();
    const container = document.getElementById("modalCore");

    selectedMark = sampleData.find((d) => d === data)
    fillInfos(selectedMark)
    fillCatas(selectedMark)

    let can = document.getElementById('modalCanvas');
    let cont = can.getContext('2d');

    // can.width = cont.width;
    can.width = container.clientWidth * 0.9
    can.height = dialog.clientHeight * 0.9

    initCoords.x = can.width / 2 - selectedMark.canvas.width / 2
    initCoords.y = can.height / 2 - selectedMark.canvas.height / 2
    cont.drawImage(selectedMark.canvas, initCoords.x, initCoords.y);

    cont.setTransform(1, 0, 0, 1, 0, 0);
    modalScale = 1
    modalOrigin.x = 0
    modalOrigin.y = 0


    can.addEventListener("mousewheel", zoom, false);
    can.addEventListener("DOMMouseScroll", zoom, false);
    can.addEventListener("pointerdown", mouseDownModal, false);
    can.addEventListener("pointermove", mouseMoveModal, false);
    can.addEventListener("pointerup", mouseUpModal, false);
}

docReady(function () {

    document.getElementById("markInfos").addEventListener('click', (e) => {
        const el = e.target;

        const tid = el.getAttribute('id');
        if (tid === "modalAddData") {
            addInfo()
        } else if (el.matches(".modalInfo")) {

            selectedInfo = el.getAttribute('value');
            fillInfos(selectedMark)

        } else if (el.matches("p")) {
            const parent = el.parentNode;
            const key = parent.getAttribute('value');
            el.outerHTML = '<input style="width: 85px" type="text" id="dataInp" key="' + key + '" value="' + el.innerHTML.replace(/ /g, "") + '" />'
            let t = document.getElementById("dataInp")
            t.focus()
            t.setSelectionRange(0, t.value.length);

        } else if (el.matches(".modalInfoShare")) {
            let type = el.getAttribute('type')
            const key = el.getAttribute('value');
            if (type === 'share') {
                shareInfo(key)
            } else if (type === 'data') {
                tempDat = key
                clickMod = 'data'
            }
        } else if (el.matches("span")) {
            const parent = el.parentNode;
            const key = parent.getAttribute('value');
            el.outerHTML = '<input style="width: 85px;" type="number" id="dataInpVal" key="' + key + '" value="' + el.innerHTML.replace(/ /g, "") + '" />'

            let t = document.getElementById("dataInpVal")
            t.focus()
            // t.setSelectionRange(0, t.value.length);

        }
    });


    document.getElementById("markCategories").addEventListener('click', (e) => {
        const el = e.target;

        const tid = el.getAttribute('id');

        if (tid === "modalAddCat") {
            const val = document.getElementById('catSelect').value;

            addCata(val)
        } else if (el.matches(".modalCatDel")) {
            if (el.getAttribute("type") === "del") {
                const val = el.getAttribute('value');
                deleteCat(val)
            }
            if (el.getAttribute("type") === "sel") {
                clickMod = 'proto'
                tempcat = el.getAttribute('value');
            }
        }


    })


    document.getElementById("modalCanvas").addEventListener('click', (e) => {
        if (clickMod == 'color') {

            const can = document.getElementById("modalCanvas")
            const cont = can.getContext('2d');

            const bb = can.getBoundingClientRect();
            const x = Math.floor((e.clientX - bb.left) / bb.width * can.width);
            const y = Math.floor((e.clientY - bb.top) / bb.height * can.height);
            const [r, g, b, a] = cont.getImageData(x, y, 1, 1).data;
            const color = `rgb(${r},${g},${b})`;

            // console.log({ color, r, g, b, a })

            removeColor(r, g, b, selectedMark.canvas, 20)
            cont.clearRect(0, 0, can.width, can.height);
            cont.drawImage(selectedMark.canvas, initCoords.x, initCoords.y);
            clickMod = 'rule'
            fillSvg(sampleData)

            document.getElementById("selectModBut").removeAttribute("id")
            const rul = document.querySelector('#modalSideButtons img')
            rul.setAttribute("id", "selectModBut");

        }


    })
});

function deleteCat(val) {

    delete selectedMark.categories[val]
    fillCatas(selectedMark)
}


docReady(function () {
    document.getElementById("closeMod").addEventListener('click', (e) => {
        const dialog = document.getElementById("markMod");
        dialog.close();
        selectedMark = undefined
    })
})


function zoom(e) {
    let can = document.getElementById('modalCanvas');
    let cont = can.getContext('2d');
    e.preventDefault();
    let zoomStep = 1.1


    let x = e.offsetX;
    let y = e.offsetY;
    const delta = e.type === "mousewheel" ? e.wheelDelta : -e.detail;

    if (delta > 0) {
        scaleAt(x, y, zoomStep);
    } else {
        scaleAt(x, y, 1 / zoomStep);
    }

    cont.clearRect(0, 0, can.width, can.height);
    cont.setTransform(modalScale, 0, 0, modalScale, modalOrigin.x, modalOrigin.y);
    cont.drawImage(selectedMark.canvas, initCoords.x, initCoords.y);
}


function scaleAt(x, y, scaleBy) {  // at pixel coords x, y scale by scaleBy
    modalScale *= scaleBy;
    modalOrigin.x = x - (x - modalOrigin.x) * scaleBy;
    modalOrigin.y = y - (y - modalOrigin.y) * scaleBy;
}


function resetZoom() {
    let can = document.getElementById('modalCanvas');
    let cont = can.getContext('2d');
    cont.setTransform(1, 0, 0, 1, 0, 0);
    modalScale = 1
    modalOrigin.x = 0
    modalOrigin.y = 0

    resetCan()
}


function rotation(e) {
    let x = e.offsetX;
    let y = e.offsetY;
}


function rule(e) {
    let x = e.offsetX;
    let y = e.offsetY;
}

function mouseDownModal(e) {
    let xy = getMousePos(e);
    if (clickMod === 'rule') {
        clickOrigin = {x: xy.x, y: xy.y};
        nbClik += 1
    } else if (clickMod === 'rotation') {
        clickOrigin = {x: xy.x, y: xy.y};
        nbClik += 1
    } else if (clickMod === 'proto') {
        xy = toWorld(xy, modalOrigin, modalScale)
        strokePoint = [xy.x, xy.y];
        mouseDown = 1;
    } else if (clickMod === 'data') {
        xy = toWorld(xy, modalOrigin, modalScale)
        strokePoint = [xy.x, xy.y];
        mouseDown = 1;
    }
}

function mouseMoveModal(e) {
    let xy = getMousePos(e);
    e.preventDefault()
    let can = document.getElementById('modalCanvas');
    let cont = can.getContext('2d');


    if (clickMod === 'rule') {
        if (nbClik === 1) {

            let val = document.getElementById('modalVal');

            val.innerHTML = Math.round(euclidian_dist([clickOrigin.x, clickOrigin.y], [xy.x, xy.y]) / modalScale) + " px"


            cont.strokeStyle = "#000"
            cont.clearRect(0, 0, can.width, can.height);
            cont.drawImage(selectedMark.canvas, initCoords.x, initCoords.y);

            let tor = toWorld(clickOrigin, modalOrigin, modalScale)
            let tres = toWorld(xy, modalOrigin, modalScale)

            cont.beginPath();
            cont.moveTo(tor.x, tor.y);
            cont.lineTo(tres.x, tres.y);
            cont.stroke()
            cont.closePath();
        }
    } else if (clickMod === 'rotation') {

        if (nbClik === 1) {


            let angle = get_orr([clickOrigin.x, clickOrigin.y], [xy.x, xy.y]);

            let val = document.getElementById('modalVal');

            val.innerHTML = Math.round(angle * 100) / 100 + " Deg"


            // cont.rotate(angle * Math.PI / 180);

            tiltCan(angle)
        }
    } else if (clickMod === 'proto') {
        if (mouseDown === 1) {
            let can = document.getElementById("modalCanvas")
            let cont = can.getContext('2d');

            e.preventDefault()
            let xy = getMousePos(e);

            // let tor = toWorld(clickOrigin, modalOrigin, modalScale)
            xy = toWorld(xy, modalOrigin, modalScale)

            cont.beginPath();
            cont.strokeStyle = "#333"
            cont.moveTo(...strokePoint);
            cont.lineTo(xy.x, xy.y);
            cont.stroke()
            cont.closePath();

            stroke.push([...strokePoint])
            strokePoint = [xy.x, xy.y];
        }
    } else if (clickMod === 'data') {
        if (mouseDown === 1) {
            let can = document.getElementById("modalCanvas")
            let cont = can.getContext('2d');

            e.preventDefault()
            let xy = getMousePos(e);

            // let tor = toWorld(clickOrigin, modalOrigin, modalScale)
            xy = toWorld(xy, modalOrigin, modalScale)

            cont.beginPath();
            cont.strokeStyle = "#333"
            cont.moveTo(...strokePoint);
            cont.lineTo(xy.x, xy.y);
            cont.stroke()
            cont.closePath();

            stroke.push([...strokePoint])
            strokePoint = [xy.x, xy.y];
        }
    }
}

function mouseUpModal(e) {
    let xy = getMousePos(e);
    if (clickMod === 'rule') {
        let val = euclidian_dist([clickOrigin.x, clickOrigin.y], [xy.x, xy.y]) / modalScale;
        nbClik = 0

        let tval = document.getElementById('modalVal');
        tval.innerHTML = ""

        if (selectedMark["data"]) {

            selectedMark.data[selectedInfo].value = Math.round(val)

        } else {
            selectedMark.data = {data0: {value: Math.round(val)}}
        }
    } else if (clickMod === 'rotation') {
        let angle = get_orr([clickOrigin.x, clickOrigin.y], [xy.x, xy.y]);
        tiltCan(angle)

        if (selectedMark["data"]) {
            if (selectedMark.data["orientation"]) {
                selectedMark.data["orientation"].value = Math.round(angle * 100) / 100
            } else {
                selectedMark.data["orientation"] = {value: Math.round(angle * 100) / 100}
            }
        } else {
            selectedMark.data = {orientation: {value: Math.round(angle * 100) / 100}}
        }


    } else if (clickMod === 'proto') {
        mouseDown = 0
        // addFreeSample(stroke)
        let can = document.createElement('canvas');
        let cont = can.getContext('2d');
        let tstroke = [...stroke].map((d) => {
            return [...d]
        });
        let pts = stroke.map((d => toScreen({x: d[0], y: d[1]}, modalOrigin, modalScale)))
        pts = pts.map((d) => [d.x, d.y]);
        // let pts = stroke
        let corners = getRect(pts)


        let tw = corners[1][0] - corners[0][0]
        let th = corners[1][1] - corners[0][1]

        can.width = tw
        can.height = th

        let tcan = document.getElementById('modalCanvas');
        // let tcont = tcan.getContext('2d');

        cont.beginPath();
        cont.moveTo(pts[0][0] - corners[0][0], pts[0][1] - corners[0][1]);

        for (let i = 1; i < pts.length; i++) {
            cont.lineTo(pts[i][0] - corners[0][0], pts[i][1] - corners[0][1]);
        }
        // tcont.stroke()
        cont.closePath();
        cont.clip()

        resetCan();

        cont.drawImage(tcan,
            corners[0][0],
            corners[0][1],
            tw,
            th,
            0,
            0,
            tw,
            th
        )


        categories[tempcat]["prototype"] = {
            canvas: can,
            contour: tstroke,
            corners: getRect(tstroke)
        }

        // xy = toWorld(xy, modalOrigin, modalScale)
        stroke = []
        tempcat = ""
        clickMod = "rule"

    } else if (clickMod === 'data') {
        mouseDown = 0
        // addFreeSample(stroke)
        let can = document.createElement('canvas');
        let cont = can.getContext('2d');

        let tstroke = [...stroke].map((d) => {
            return [...d]
        });
        let pts = stroke.map((d => toScreen({x: d[0], y: d[1]}, modalOrigin, modalScale)))
        pts = pts.map((d) => [d.x, d.y]);
        // let pts = stroke
        let corners = getRect(pts)


        let tw = corners[1][0] - corners[0][0]
        let th = corners[1][1] - corners[0][1]

        can.width = tw
        can.height = th

        let tcan = document.getElementById('modalCanvas');
        // let tcont = tcan.getContext('2d');

        cont.beginPath();
        cont.moveTo(pts[0][0] - corners[0][0], pts[0][1] - corners[0][1]);

        for (let i = 1; i < pts.length; i++) {
            cont.lineTo(pts[i][0] - corners[0][0], pts[i][1] - corners[0][1]);
        }
        // tcont.stroke()
        cont.closePath();
        cont.clip()

        resetCan();

        cont.drawImage(tcan,
            corners[0][0],
            corners[0][1],
            tw,
            th,
            0,
            0,
            tw,
            th
        )

        selectedMark.data[tempDat].proto = {
            canvas: can,
            contour: tstroke,
            corners: getRect(tstroke)
        }
        dataEncoding[tempDat] = {
            canvas: can,
            contour: tstroke,
            corners: getRect(tstroke),
            value: selectedMark.data[tempDat],
        }
        // xy = toWorld(xy, modalOrigin, modalScale)
        stroke = []
        tempDat = ""
        clickMod = "rule"
        fillPalette()
    }


    nbClik = 0


    fillInfos(selectedMark)
    resetCan();
    clickOrigin = {x: 0, y: 0};

}


function resetCan() {
    let can = document.getElementById('modalCanvas');
    let cont = can.getContext('2d');
    cont.clearRect(0, 0, can.width, can.height);
    cont.drawImage(selectedMark.canvas, initCoords.x, initCoords.y);
}


function deleteMark() {
    const i = sampleData.findIndex(d => d === selectedMark);
    sampleData.splice(i, 1);
    fillSvg(sampleData)

    const dialog = document.getElementById("markMod");
    dialog.close()
    updateMarks("size") //TODO: keep same order

}

function fillInfos(mark) {


    const container = document.getElementById("markInfos");
    let mess = ""

    // if (mark["orientation"]) {
    //     mess += "<div class='modalInfo'><p style='display: contents;color:#333;font-weight: 600'>Orientation:</p>" + mark["orientation"] + "deg</div>"
    // }

    if (mark["data"]) {
        let tsel = false;
        for (const [key, value] of Object.entries(mark.data)) {
            if (key === selectedInfo) {
                tsel = true;
            }
            mess += "<div class='modalInfo' value ='" + key + "'  id='" + (tsel ? 'selectedModalInfo' : '') + "'>" +
                "<p style='display: contents;color:#333;font-weight: 600'>" + key + " </p> : <span> " + value.value + " </span>" +
                "<div style='display: inline-block;float: right'>" +
                "<img class='modalInfoShare' type='data' style='margin-right: 5px' value ='" + key + "' src='assets/images/buttons/lasso.png'>" +
                "<img class='modalInfoShare' type='share' value ='" + key + "' src='assets/images/buttons/share.png'>" +
                "</div>" +
                "</div>";
            tsel = false;
        }
    }

    mess += "<img  id='modalAddData' src='assets/images/buttons/plus.png'>"

    container.innerHTML = mess;

}

function fillCatas(mark) {


    const container = document.getElementById("markCategories");
    let mess = ""

    // if (mark["orientation"]) {
    //     mess += "<div class='modalInfo'><p style='display: contents;color:#333;font-weight: 600'>Orientation:</p>" + mark["orientation"] + "deg</div>"
    // }


    if (mark["categories"]) {
        for (const [key, value] of Object.entries(mark.categories)) {

            mess += "<div class='modalInfo' value ='" + key + "'>" +
                "<p style='display: contents;color:#333;font-weight: 600'>" + key + " </p> : <div class='catColor' style='background: " + value.color + "'></div>" +
                "<div style='display: inline-block;float: right'>" +
                "<img class='modalCatDel' type='sel' value ='" + key + "' src='assets/images/buttons/lasso.png'>" +
                "<img class='modalCatDel' type='del' value ='" + key + "' src='assets/images/buttons/del.png'>" +

                "</div>" +
                "</div>";


        }


    }
    let options = ""
    for (const [key, value] of Object.entries(categories)) {
        options += "<option>" + key + "</option>";
    }


    mess += "<div style='margin-top:15px;text-align: center'>" +
        "<select id='catSelect'>" + options + "</select>" +
        "<img  id='modalAddCat' src='assets/images/buttons/plus.png'>" +
        "</div>"

    container.innerHTML = mess;

}

function addInfo() {
    if (selectedMark["data"]) {
        let index = Object.keys(selectedMark.data).length
        selectedMark.data["data" + index] = {value: 0}
    } else {
        selectedMark["data"] = {data0: {value: 0}}
    }
    fillInfos(selectedMark)
}

function addCata(val) {
    selectedMark.categories[val] = categories[val]
    fillCatas(selectedMark)
}

function shareInfo(key, defaultVal = 0) {

    for (let i = 0; i < sampleData.length; i++) {
        if (sampleData[i]["data"]) {
            if (!sampleData[i]["data"][key]) {
                sampleData[i]["data"][key] = {value: defaultVal}
            }
        } else {
            sampleData[i]["data"] = {}
            sampleData[i]["data"][key] = {value: defaultVal}
        }
    }
}


function tiltCan(angle) {
    let can = document.getElementById('modalCanvas');
    let cont = can.getContext('2d');
    cont.clearRect(0, 0, can.width, can.height);
    drawGuides()

    cont.save()
    cont.globalAlpha = 0.9
    cont.translate(initCoords.x + selectedMark.canvas.width / 2, initCoords.y + selectedMark.canvas.height / 2);
    cont.rotate(toRad(angle));
    cont.drawImage(selectedMark.canvas, -selectedMark.canvas.width / 2, -selectedMark.canvas.height / 2, selectedMark.canvas.width, selectedMark.canvas.height);
    cont.restore();

    // cont.drawImage(selectedMark.canvas, initCoords.x, initCoords.y);
}


function drawGuides() {
    let can = document.getElementById('modalCanvas');
    let cont = can.getContext('2d');

    let center = {x: can.width / 2, y: can.height / 2};
    let size = can.width;
    const x = size / 2
    const y = -size

    cont.save()
    cont.strokeStyle = "#333"
    cont.moveTo(center.x, center.y);
    cont.lineTo(x, y);
    cont.stroke()

    const steps = 8
    const result = []

    const ang = Math.PI * 2 / steps;
    // result.push({x,y});                      // Add first point
    for (let rot = 1; rot < steps; rot++) {  // Add remaining points

        let tres = rotatePt({x, y}, center, rot * ang);
        cont.moveTo(center.x, center.y);
        cont.lineTo(tres.x, tres.y);
        cont.stroke()
    }
    cont.restore()
}

function rotatePt(point, center, rotate, result = {}) {
    const vx = point.x - center.x;
    const vy = point.y - center.y;
    const xAx = Math.cos(rotate);
    const xAy = Math.sin(rotate);
    result.x = vx * xAx - vy * xAy + center.x;
    result.y = vx * xAy + vy * xAx + center.y;
    return result;
}

function getModalNext() {
    const id = sampleData.indexOf(selectedMark)

    if (id < sampleData.length - 1) {
        return id + 1
    }
    return id
}

function getModalPrev() {
    const id = sampleData.indexOf(selectedMark)

    if (id > 1) {
        return id - 1
    }
    return id
}

function switchMark(type) {

    if (type === "next") {
        const id = getModalNext()
        loadModal(sampleData[id])
    } else if (type === "prev") {
        const id = getModalPrev()
        loadModal(sampleData[id])
    }

}

function initColor(el) {

    clickMod = 'color'
    document.getElementById("selectModBut").removeAttribute("id")
    el.setAttribute("id", "selectModBut");
}