let currImg;
let origin = null;

let sampleData = []

loadImg("assets/images/tempLoad/dearDat.png")


function addRectSample(x, y, width, height) {


    let coords = curateCoordinates(x, y, width, height);


    let can = document.getElementById("inVis")
    let trec = can.getBoundingClientRect()
    let tx = trec.width
    let ty = trec.height


    let tcan = document.createElement('canvas');
    let tcont = tcan.getContext('2d');


    tcan.width = coords[2]
    tcan.height = coords[3]

    tcont.drawImage(can, ...coords, 0, 0, coords[2], coords[3])


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
        rwidth: coords[2] / tx,
        rHeight: coords[3] / ty
    }


    let marks = document.getElementById("marks")

    marks.append(tcan)

    sampleData.push(tres)
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


function switchSampleSelect(e) {
    document.getElementById("selectedButton").removeAttribute("id")

    e.setAttribute("id", "selectedButton")
}