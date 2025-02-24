let options_type = {}
let displayedMarks = {}

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

    console.log(corners);

    const d3Svg = d3.select(svg)
    console.log(marks[key]);
    if (marks[key]) {

        const can = marks[key][val].proto.canvas //TODO: Test if in range

        d3Svg.append("svg:image")
            .attr("xlink:href", can.toDataURL())
            .attr("x", corners.width / 2 - can.width / 2)
            .attr("y", corners.height / 2 - can.height / 2)
            .attr("width", can.width)
            .attr("height", can.height)
            .attr("id", "collage_" + key)

        displayedMarks[key] = marks[key][val].proto

    } else if (primitive[key]) {
        let tempProto
        for (const [_, value] of Object.entries(displayedMarks)) {
            tempProto = value
        }


        let cont = document.getElementById("collage_anxiety") //TODO: SET LINKEDTO in ANCHORS and use them here

        console.log(cont);
        let x = +cont.getAttribute("x")
        let y = +cont.getAttribute("y")
        /*
                d3Svg.append("line")
                    .attr("x1", tempProto.anchors[0].rx * corners.width)
                    .attr("y1", tempProto.anchors[0].ry * corners.height)
                    .attr("x2", 300)
                    .attr("y2", 300)
        */
        console.log(tempProto.anchors[0]);

        d3Svg.append("circle")
            .attr("cx", (x + tempProto.anchors[0].prx * corners.width))
            .attr("cy", (y + tempProto.anchors[0].pry * corners.height))
            .attr("r", 10)


    }
}