let options_type = {}
let displayedMarks = {}
let dataList = {}


function populateSelect() {
    let select = document.getElementById("collageSel")

    let data = Object.keys(marks).concat(Object.keys(primitive))
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


    }
}

function addCollage() {

    const cont = document.getElementById("collageList")
    const div = document.createElement("div")

    div.classList.add("collageListDisplay")
    const key = document.getElementById('collageSel').value
    const val = document.getElementById('dataVal').value


    addProto2Collage(key, val)


    div.innerHTML = '<p>' + key + '</p> <p>' + val + '</p>'
    cont.appendChild(div)

}

function addProto2Collage(key, val) {

    const svg = document.getElementById("collageSvg")
    const corners = svg.getBoundingClientRect();


    const d3Svg = d3.select(svg)

    if (marks[key]) {

        const can = marks[key][val].proto.canvas //TODO: Test if in range

        const tcorners = marks[key][val].proto.corners

        const tw = tcorners[1][0] - tcorners[0][0]
        const th = tcorners[1][1] - tcorners[0][1]

        d3Svg.append("svg:image")
            .attr("xlink:href", can.toDataURL())
            .attr("x", corners.width / 2 - tw / 2)
            .attr("y", corners.height / 2 - th / 2)
            .attr("width", tw)
            .attr("height", th)
            .attr("id", "collage_" + key)
            .attr("class", "rotate")
        // .attr("transform", "translate(" + (corners.width / 2 - tw / 2) + ", " + (corners.height / 2 - th / 2) + ") rotate(" + 10 + ")")

        dataList[key] = +val
        displayedMarks[key] = marks[key][val].proto

    } else if (primitive[key]) {
        let tempProto // displayed mark used to get anchor
        for (const [_, value] of Object.entries(displayedMarks)) { //TODO: FILTER TO GET CORRECT ANCHOR
            tempProto = value

            // const tw = tcorners[1][0] - tcorners[0][0]
            // const th = tcorners[1][1] - tcorners[0][1]
        }

        const prim = primitive[key]
        let cont = document.getElementById("collage_anxiety") //TODO: SET LINKEDTO in ANCHORS and use them here

        let x = +cont.getAttribute("x")
        let y = +cont.getAttribute("y")


        let pt1;
        let pt2;
        prim.angle = +prim.angle
        if (prim.anchor_type === "start") {

            pt1 = {x: (x + tempProto.anchors[0].px), y: (y + tempProto.anchors[0].py)}

            const pt = getPoint(+prim.angle, +val, {
                    x: pt1.x, y: pt1.y
                }
            )
            pt2 = {x: pt.x, y: pt.y}
        }

        if (prim.anchor_type === "middle") {

            let tpt1 = {x: (x + tempProto.anchors[0].px), y: (y + tempProto.anchors[0].py)}

            pt1 = getPoint(+prim.angle, +val / 2, {
                    x: tpt1.x, y: tpt1.y
                }
            )
            pt2 = getPoint((180 + prim.angle) % 360, +val / 2, {
                    x: tpt1.x, y: tpt1.y
                }
            )
        }

        if (prim.anchor_type === "end") {
            pt1 = {x: (x + tempProto.anchors[0].px), y: (y + tempProto.anchors[0].py)}


            pt2 = getPoint((180 + prim.angle) % 360, +val / 2, {
                    x: pt1.x, y: pt1.y
                }
            )
        }

        d3Svg.append("line")
            .attr("x1", pt1.x)
            .attr("y1", pt1.y)
            .attr("x2", pt2.x)
            .attr("y2", pt2.y)
            .attr("stroke", prim.color)
            .attr("stroke-width", prim.stroke_width)
            .attr("stroke-linecap", "round")

        // d3Svg.append("circle")
        //     .attr("cx", (x + tempProto.anchors[0].px))
        //     .attr("cy", (y + tempProto.anchors[0].py))
        //     .attr("r", 3)

        dataList[key] = +val
    }
}


function saveCollage() {

    const tcan = document.createElement("canvas")
    const tcon = tcan.getContext("2d")
    const svg = document.getElementById("collageSvg")

    const corners = svg.getBoundingClientRect();

    const tw = corners.width
    const th = corners.height

    tcan.width = tw
    tcan.height = th

    // tcon.drawImage(svg, 0, 0)

    let img = new Image()
    let xml = new XMLSerializer().serializeToString(svg);

    let svg64 = btoa(xml);
    let b64Start = 'data:image/svg+xml;base64,';
    let image64 = b64Start + svg64;

    img.src = image64;


    img.onload = function () {


        tcon.drawImage(img, 0, 0);


        let bbox = getBBox(tcan)

        const can = document.createElement("canvas")
        const con = can.getContext("2d")

        can.width = bbox[1][0] - bbox[0][0]
        can.height = bbox[1][1] - bbox[0][1]

        con.drawImage(img, bbox[0][0], bbox[0][1], can.width, can.height, 0, 0, can.width, can.height)

        const invis = document.getElementById("inVis")

        let tx = invis.width
        let ty = invis.height


        let tdat = {}

        for (const [key, value] of Object.entries(dataList)) {
            tdat[key] = {value: value}
        }
        
        let tres = {
            x: 10,
            y: 10,
            width: can.width,
            height: can.height,
            type: "made",
            canvas: can,
            // img: tcan.toDataURL("image/png"), //use of imgs for furture works -> load from json ?
            rx: 10 / tx,
            ry: 10 / ty,
            rWidth: can.width / tx,
            rHeight: can.height / ty,
            data: tdat
        }

        sampleData.push(tres)
        fillSvg(sampleData)
        document.getElementById("collageList").innerHTML = ""
        svg.innerHTML = ""
    }
}