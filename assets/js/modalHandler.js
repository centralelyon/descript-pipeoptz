let modalScale = 1
let modalOrigin = {x: 0, y: 0};
const initCoords = {x: 0, y: 0};

let clickMod = 'rule';

let clickOrigin = {x: 0, y: 0};

let nbClik = 0
let displayed = false;


docReady(function () {
    document.getElementById("marks").addEventListener('click', (e) => {

        const el = e.target;
        let parent = null;

        if (el.matches("canvas")) {
            const dialog = document.getElementById("markMod");
            dialog.showModal();
            const container = document.getElementById("modalCore");

            selectedMark = sampleData.find((d) => d.canvas === el)

            let can = document.getElementById('modalCanvas');
            let cont = can.getContext('2d');

            // can.width = cont.width;
            can.width = container.clientWidth * 0.9
            can.height = dialog.clientHeight * 0.9

            initCoords.x = can.width / 2 - selectedMark.canvas.width / 2
            initCoords.y = can.height / 2 - selectedMark.canvas.height / 2
            cont.drawImage(selectedMark.canvas, initCoords.x, initCoords.y);

            can.addEventListener("mousewheel", zoom, false);
            can.addEventListener("DOMMouseScroll", zoom, false);
            can.addEventListener("pointerdown", mouseDownModal, false);
            can.addEventListener("pointermove", mouseMoveModal, false);
            can.addEventListener("pointerup", mouseUpModal, false);
        }
    });

    document.getElementById("marks").addEventListener('mouseover', (e) => {
        const el = e.target;

        const sample = sampleData.find((d) => d.canvas === el)
        if (el.matches("canvas")) {
            drawSamples([sample])
            displayed = true
        }


    });

    document.getElementById("marks").addEventListener('mouseleave', (e) => {
        const el = e.target;
        if (displayed) {
            render();
            displayed = false;
        }

    });

});

docReady(function () {
    document.getElementById("closeMod").addEventListener('click', (e) => {
        const dialog = document.getElementById("markMod");
        dialog.close();
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
    clickOrigin = {x: xy.x, y: xy.y};
    nbClik += 1
}

function mouseMoveModal(e) {
    let xy = getMousePos(e);
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
    }
}

function mouseUpModal(e) {
    let xy = getMousePos(e);

    let val = euclidian_dist([clickOrigin.x, clickOrigin.y], [xy.x, xy.y]) / modalScale;
    nbClik = 0

    let tval = document.getElementById('modalVal');
    tval.innerHTML = ""

    if (selectedMark["data"]) {
        selectedMark.data["rule"] = val
    } else {
        selectedMark.data = {rule: val}
    }
    resetCan();

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

    const dialog = document.getElementById("markMod");
    dialog.close()
    updateMarks("size") //TODO: keep same order

}

