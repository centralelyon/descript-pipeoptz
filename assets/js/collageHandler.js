let options_type = {}
let displayedMarks = {}
let dataList = {}


function populateSelect() {
    let select = document.getElementById("collageSel")

    let data = Object.keys(marks).concat(Object.keys(primitive)).concat(Object.keys(palette_cat))
    // let cats =

    let mess = ""

    for (let j = 0; j < data.length; j++) {
        mess += "<option value='" + data[j] + "'>" + data[j] + "</option>"
        options_type[data[j]] = "data"
    }
    // for (let j = 0; j < cats.length; j++) {
    //     if (categories[cats[j]].prototype)
    //         mess += "<option value='" + cats[j] + "'>" + cats[j] + "</option>"
    //     options_type[cats[j]] = "cat"
    // }
    select.innerHTML = mess

    select.oninput = function (e) {


    }
}

function addCollage() {

    const cont = document.getElementById("collageList")
    const div = document.createElement("div")

    div.classList.add("collageListDisplay")
    const key = document.getElementById('collageSel').value
    let val = document.getElementById('dataVal').value


    if (Object.keys(palette_cat).indexOf(key) > -1) {
        val = ""
    }


    div.setAttribute("id", "dataList_" + key)

    addProto2Collage(key, val)

    div.innerHTML = '<p>' + key + '</p> <p>' + val + '</p>' +
        '<img class="primitiveDataButton" src="assets/images/buttons/del.png" onclick="deleteDataList(\'collage_' + key + '\')">'
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
        //TODO connect to another anchor
        d3Svg.append("svg:image")
            .attr("xlink:href", can.toDataURL())
            .attr("x", corners.width / 2 - tw / 2)
            .attr("y", corners.height / 2 - th / 2)
            .attr("width", tw)
            .attr("height", th)
            .attr("id", "collage_" + key)
            .attr("num", val)
            .attr("class", "rotate")
        // .attr("transform", "translate(" + (corners.width / 2 - tw / 2) + ", " + (corners.height / 2 - th / 2) + ") rotate(" + 10 + ")")

        dataList[key] = +val
        displayedMarks[key] = marks[key][val].proto

    } else if (primitive[key]) {

        if (primitive[key].linkTo === undefined || primitive[key].linkTo === "None") {
            primitive[key].linkTo = currAnchor
        }

        let anch = primitive[key].linkTo

        let tempProto // displayed mark used to get anchor

        let applyTo = primitive[key].apply

        let ttype = ""
        let fr

        console.log(applyTo);

        let cont = document.getElementById("collage_" + applyTo)

        let x = +cont.getAttribute("x")
        let y = +cont.getAttribute("y")

        let tw = cont.getAttribute("width")
        let th = cont.getAttribute("height")

        let num = +cont.getAttribute("num")


        if (marks[applyTo]) {
            ttype = "mark"
            if (num !== undefined) {
                fr = marks[applyTo][num].proto.anchors[anch]
                fr.type = "mark"
            } else {
                //TODO: CONTINUOUS DATA HERE
            }

        } else if (primitive[applyTo]) {
            ttype = "primitive"
        } else if (palette_cat[applyTo]) {
            ttype = "cat"
            fr = palette_cat[applyTo].proto.anchors[anch]
            fr.type = "cat"
        }


        if (fr.type === "mark") {
            tempProto = marks[applyTo][num].proto
        } else if (fr.type === "cat") {
            tempProto = palette_cat[applyTo].proto
        }

        const prim = primitive[key]


        let pt1;
        let pt2;
        prim.angle = +prim.angle
        if (prim.anchor_type === "start") {

            pt1 = {x: (x + tempProto.anchors[anch].rx * tw), y: (y + tempProto.anchors[anch].ry * th)}

            const pt = getPoint(+prim.angle, +val, {
                    x: pt1.x, y: pt1.y
                }
            )
            pt2 = {x: pt.x, y: pt.y}
        }

        if (prim.anchor_type === "middle") {

            let tpt1 = {x: (x + tempProto.anchors[anch].rx * tw), y: (y + tempProto.anchors[anch].ry * th)}

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
            pt1 = {x: (x + tempProto.anchors[anch].rx * tw), y: (y + tempProto.anchors[anch].ry * th)}


            pt2 = getPoint((180 + prim.angle) % 360, +val, {
                    x: pt1.x, y: pt1.y
                }
            )
        }

        d3Svg.append("line")
            .attr("x1", pt1.x)
            .attr("y1", pt1.y)
            .attr("x2", pt2.x)
            .attr("y2", pt2.y)
            .attr("id", "collage_" + key)
            .attr("stroke", prim.color)
            .attr("stroke-width", prim.stroke_width)
            .attr("stroke-linecap", "round")

        // d3Svg.append("circle")
        //     .attr("cx", (x + tempProto.anchors[0].px))
        //     .attr("cy", (y + tempProto.anchors[0].py))
        //     .attr("r", 3)

        dataList[key] = +val


    } else if (palette_cat[key]) {
        let cl = 1
        dataList[key] = ""
        if (palette_cat[key].proto === undefined) { //ATTRIBUTE CATEGORY
            const el = document.getElementById("collage_" + palette_cat[key].apply)

            if (palette_cat[key].colorOn) {
                if (marks[palette_cat[key].apply]) {

                    const tval = +el.getAttribute("num")

                    const can = marks[palette_cat[key].apply][tval].proto.canvas

                    const tcol = hexToRgb(palette_cat[key].color)
                    const res = toColor(can, tcol.r * cl, tcol.g * cl, tcol.b * cl, 210)

                    el.setAttribute("href", res.toDataURL())

                } else if (primitive[palette_cat[key].apply]) {
                    el.setAttribute("stroke", palette_cat[key].color)
                }
            }

            if (palette_cat[key].styleText !== "") {
                el.style = palette_cat[key].styleText
            }

        } else { //PROTO CATEGORY

            let applyTo = palette_cat[key].apply
            let anch = palette_cat[key].linkTo

            const can = palette_cat[key].proto.canvas //TODO: Test if in range

            const tcorners = palette_cat[key].proto.corners

            const tw = tcorners[1][0] - tcorners[0][0]
            const th = tcorners[1][1] - tcorners[0][1]

            // let anch = getAnchorFromTo(key)

            let cont = document.getElementById("collage_" + applyTo)
            let num = +cont.getAttribute("num")

            let fr
            let to = palette_cat[key].proto.anchors[anch]
            let ttype


            console.log(applyTo);
            if (marks[applyTo]) {
                ttype = "mark"
                if (num !== undefined) {
                    fr = marks[applyTo][num].proto.anchors[anch]
                    fr.type = "mark"
                } else {
                    //TODO: CONTINUOUS DATA HERE
                }
            } else if (primitive[applyTo]) {
                ttype = "primitive"
                fr = primitive[applyTo].anchors[anch]
            } else if (palette_cat[applyTo]) {
                ttype = "cat"
                fr = palette_cat[applyTo].proto.anchors[anch]
                fr.type = "cat"
            }

            if (ttype === "mark") {

                let x = +cont.getAttribute("x")
                let y = +cont.getAttribute("y")

                let tw2 = cont.getAttribute("width")
                let th2 = cont.getAttribute("height")


                d3Svg.append("svg:image")
                    .attr("xlink:href", can.toDataURL())
                    .attr("x", x + (fr.rx * tw2) - (to.rx * tw))
                    .attr("y", y + (fr.ry * th2) - (to.ry * th))
                    .attr("width", tw)
                    .attr("height", th)
                    .attr("id", "collage_" + key)
                    .attr("class", "rotate")

            } else if (ttype === "primitive") {
                let cont = document.getElementById("collage_" + applyTo) //TODO: change w.r.t. a anchor from select

                if (primitive[applyTo].shape === "line") {
                    let x1 = +cont.getAttribute("x1")
                    let y1 = +cont.getAttribute("y1")

                    let x2 = +cont.getAttribute("x2")
                    let y2 = +cont.getAttribute("y2")

                    let pt = getPointat({x: x1, y: y1}, {x: x2, y: y2}, 100 - fr.percent)

                    /*  ------------------ Debug Stuff
                                        d3Svg.append("circle")
                                        .attr("cx", pt.x)
                                        .attr("cy", pt.y)
                                        .attr("r", 3)

                                        d3Svg.append("circle")
                                            .attr("cx", pt.x+(to.data.rx * tw))
                                            .attr("cy", pt.y)
                                            .attr("r", 3)
                    */

                    d3Svg.append("svg:image")
                        .attr("xlink:href", can.toDataURL())
                        .attr("x", pt.x - (to.rx * tw))
                        .attr("y", pt.y - (to.ry * th))
                        .attr("width", tw)
                        .attr("height", th)
                        .attr("id", "collage_" + key)
                        .attr("class", "rotate")
                }

            } else if (ttype === "cat") {

                let x = +cont.getAttribute("x")
                let y = +cont.getAttribute("y")

                let tw2 = cont.getAttribute("width")
                let th2 = cont.getAttribute("height")

                d3Svg.append("svg:image")
                    .attr("xlink:href", can.toDataURL())
                    .attr("x", x + (fr.rx * tw2) - (to.rx * tw))
                    .attr("y", y + (fr.ry * th2) - (to.ry * th))
                    .attr("width", tw)
                    .attr("height", th)
                    .attr("id", "collage_" + key)
                    .attr("class", "rotate")

            }
        }
    }
}


function getAnchorFromTo(name) {

    for (const [key, value] of Object.entries(global_anchors)) {
        if (value.to) {
            if (value.to.key === name) {
                return value
            }
        }
    }

    return undefined
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
        let tcat = {}

        for (const [key, value] of Object.entries(dataList)) {
            if (categories[key] !== undefined) {
                tcat[key] = categories[key]
            } else {
                tdat[key] = {value: value}
            }
        }

        let tres = {
            x: 10,
            y: 10,
            width: can.width,
            height: can.height,
            type: "made",
            canvas: can,
            rx: 10 / tx,
            ry: 10 / ty,
            rWidth: can.width / tx,
            rHeight: can.height / ty,
            data: tdat,
            categories: tcat
        }

        sampleData.push(tres)
        fillSvg(sampleData)
        document.getElementById("collageList").innerHTML = ""
        svg.innerHTML = ""
    }
}

function deleteDataList(id) {
    let key = id.split("_")[1]

    document.getElementById("dataList_" + key).remove()
    document.getElementById("collage_" + key).remove()
}

function getCollageOrder(drawingData) {

    let order = []
    /*
        let tdat = {
            0: {from: {key: "stem"}, to: {key: "co-worker"}},
            1: {from: {key: "anxiety"}}
        }*/


    let tdat = {
        anxiety: "",
        stem: "",
        wrong: "",
        francis: ""
    }

    drawingData = tdat

    let links = getRelationships(drawingData)

    let graph = pairsToIndex(links)
    let res = listNode(graph[""])

    return res
}

function getFromTo(key, data, value) {
    if (data.hasOwnProperty(key)) {
        if (value.apply) {
            if (typeof value.apply !== "string") //Shameless stuff to avoid to fix cat apply to mark issue
                value.apply = value.apply.key
            // return [key, value.apply]
            return [value.apply, key]
        } else {
            return ["", key]
            // return [key, ""]
        }
    }
    return false
}

function getRelationships(drawingData) {
    let res = []
    for (const [key, value] of Object.entries(marks)) {
        let t = getFromTo(key, drawingData, value)
        if (t) {
            res.push(t)
        }
    }

    for (const [key, value] of Object.entries(primitive)) {
        let t = getFromTo(key, drawingData, value)
        if (t) {
            res.push(t)
        }
    }

    for (const [key, value] of Object.entries(palette_cat)) {
        let t = getFromTo(key, drawingData, value)
        if (t) {
            res.push(t)
        }
    }

    return res
}

function pairsToIndex(pairs) {
    return pairs.reduce((index, pair, i, list) => {
        let [parent, child] = pair;

        let parent_exists = index.hasOwnProperty(parent);
        let child_exists = index.hasOwnProperty(child);

        if (!parent_exists) {
            index[parent] = {key: parent, children: []};
        }

        if (!child_exists) {
            index[child] = {key: child, children: []};
        }

        let rel_captured = Boolean(index[parent].children.find((c) => c.key === child));

        if (!rel_captured) {
            index[parent].children.push(index[child]);
        }

        return index;
    }, {});
}

function listNode(node) {
    return Array.prototype.concat.apply([node.key], node.children.map(listNode));
}