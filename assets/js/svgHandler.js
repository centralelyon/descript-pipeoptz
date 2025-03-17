const duration = 900

const mods = ['grid', "scatter", 'default']


let coords = [];
let curr_mod = "default"
let lineGenerator;

let over_on = true

let bounds = []
let seldots
let offset
let selectedImg
let tx

function fillSvg(marks) {

    const tsvg = document.getElementById("inVis")


    const rect = tsvg.getBoundingClientRect()

    const svg = d3.select('#svgDisplay');

    svg.style("width", rect.width + "px")
    svg.style("height", rect.height + "px")


    svg.selectAll("image").remove();

    const w = rect.width
    const h = rect.height
    bounds = [w, h]

    lineGenerator = d3.line();

    svg.attr('viewBox', '0 0 ' + w + ' ' + h);
    svg.on("pointerup", (e) => {
        drawImage()
        d3.selectAll("image").style("opacity", 1)
        // console.log("saucisse");
    })

    svg.selectAll("dot")
        .data(marks)
        .enter()
        .append("svg:image")
        .attr("xlink:href", (d) => d.canvas.toDataURL())
        .attr('num', (d, i) => i)
        .attr("x", (d) => d.rx * w)
        .attr("y", (d) => d.ry * h)
        .attr("width", (d) => d.rWidth * w)
        .attr("height", (d) => d.rHeight * h)
        .attr("class", "rotate")
        .on("mouseenter", (e) => {
            if (over_on)
                drawSamples([e.target.__data__])
        })
        .on("mouseout", (e) => {
            if (over_on) {
                drawImage()
                d3.selectAll("image").style("opacity", 1)
            }
        })
        .on("click", (e) => {

            d3.selectAll("image").style("opacity", 1)
            const el = e.target
            loadModal(sampleData.find((d) => d === el.__data__))
        })
    // .attr('transform', (d) => `translate(${d.rx * w -(d.rWidth*w)/2},${d.ry * y-(d.rHeight*y)/2}) rotate(${d.data.orientation})` )

    // loopViews()

    const drag = d3
        .drag()
        .on("start", dragStart)
        .on("drag", dragMove)
        .on("end", dragEnd);

    const drag2 = d3
        .drag()
        .on("start", imgDragStart)
        .on("drag", imgDragMove)
        .on("end", imgDragEnd);

    svg.call(drag)


    svg.selectAll("image").call(drag2)


}

function loopViews(timer = 3000) {
    let marks = sampleData

    for (let i = 0; i < mods.length + 1; i++) {
        if (i == mods.length) {
            setTimeout(function () {
                loopViews(timer)
            }, timer * i);

        } else {
            setTimeout(function () {
                switchSvg(marks, mods[i]);
            }, timer * i);
        }

    }
}


function purgeAxis(container) {
    container.selectAll("g").remove()
    container.selectAll("text").remove()
    container.selectAll("image").style("opacity", 1);
    const cont = document.getElementById("secondControl")
    cont.innerHTML = ''


    cont.removeEventListener("change", sortGrid, false);
    cont.removeEventListener("change", displayScat, false);
}

function switchSvg(marks, style) {

    const svg = d3.select('#svgDisplay')
    const tsvg = document.getElementById("inVis")
    const w = tsvg.offsetWidth
    const h = tsvg.offsetHeight

    purgeAxis(svg)
    svg.selectAll("image").style("opacity", 1);


    if (style === 'grid') { // ------------------------- Grid
        curr_mod = "grid"

        const averageW = marks.map(d => d.width).reduce((a, b) => a + b) / marks.length;
        const averageH = marks.map(d => d.height).reduce((a, b) => a + b) / marks.length;


        // let mw = Math.max(...marks.map(d => d.width))
        // let mh = Math.max(...marks.map(d => d.height))

        const rowRatio = Math.floor(w / averageW)

        svg.selectAll("image")
            .transition().duration(duration)
            .attr("x", (d, i) => {
                return (i % rowRatio) * averageW
            })
            .attr("y", (d, i) => {
                let row = Math.floor(i / rowRatio)
                return row * averageH;
            })
            .attr("width", averageW)
            .attr("height", averageH)

        // updateGrid(marks, svg, w)

        const cont = document.getElementById("secondControl")

        cont.innerHTML = "<div style='display: inline-block' > Sort by:"


        let optKeys = {}
        for (const [key, value] of Object.entries(sampleData)) {

            if (value.data) {

                for (const [key2, value2] of Object.entries(value.data)) {
                    optKeys[key2] = key2
                }
                // options += "<option>" + key + "</option>";
            }
        }

        let dataOpt = ""

        for (const [key, value] of Object.entries(optKeys)) {
            dataOpt += "<option>" + key + "</option>"
        }


        let mess = "<div class='buttonImg'>" +
            "<select id='gridSort'>" +
            "<option>None</option>" +
            "<option>Area</option>" +
            "<option>Aspect ratio</option>" +
            "<option>Categories</option>" +
            dataOpt +
            "</select>" +
            "</div>"

        cont.innerHTML += mess + `</div>`

        cont.addEventListener("change", sortGrid)

    } else if (style === 'scatter') { // -------------------------Scatter

        curr_mod = "scatter"
        let mw = Math.max(...marks.map(d => d.width))
        let mh = Math.max(...marks.map(d => d.height))


        const area = d3.extent(marks, (d) => d.width * d.height)
        const ratio = d3.extent(marks, (d) => d.width / d.height)

        let xrange = d3.scaleLinear().range([35, w - mw]).domain(area)
        let yrange = d3.scaleLinear().range([h - 20, 0]).domain(ratio)


        svg.selectAll("image")
            .transition().duration(duration)
            .attr("x", (d) => {
                return xrange(d.width * d.height) //+ (d.rWidth * w)/2,

            })
            .attr("y", (d) => {
                return Math.max(yrange(d.width / d.height) - (d.rHeight * w) / 2, 20)
            })
            .attr("width", (d) => d.rWidth * w)
            .attr("height", (d) => d.rHeight * h)


        svg
            .append("g")
            .attr("transform", "translate(" + 0 + "," + (h - 25) + ")")      // This controls the vertical position of the Axis
            .call(d3.axisBottom(xrange));

        svg
            .append("g")
            .attr("transform", "translate(35,0)")      // This controls the vertical position of the Axis
            .call(d3.axisLeft(yrange));

        svg.append("text")
            .attr("text-anchor", "end")
            .attr("transform", "rotate(-90)")
            .attr("y", 10)
            .attr("x", 0)
            .style("font-size", "10pt")
            .text("Aspect Ratio")

        svg.append("text")
            .attr("text-anchor", "end")
            // .attr("transform", "rotate(-90)")
            .attr("y", h)
            .attr("x", w - mw)
            .style("font-size", "10pt")
            .text("Area")


        const cont = document.getElementById("secondControl")

        cont.innerHTML = "<div style='display: inline-block' > "


        let optKeys = {}
        for (const [key, value] of Object.entries(sampleData)) {

            if (value.data) {

                for (const [key2, value2] of Object.entries(value.data)) {
                    optKeys[key2] = key2
                }
                // options += "<option>" + key + "</option>";
            }
        }

        let dataOpt = ""

        for (const [key, value] of Object.entries(optKeys)) {
            dataOpt += "<option>" + key + "</option>"
        }


        let mess = "<div style='display: inline-block' class=''>" +
            "<select id='scatterField1'>" +
            "<option>Area</option>" +
            "<option selected>Aspect ratio</option>" +
            "<option>n Categories</option>" +
            dataOpt +
            "</select>" +
            "</div>"

        mess += " <div style='display: inline-block'> by </div> "

        mess += "<div style='display: inline-block' class=''>" +
            "<select id='scatterField2'>" +
            "<option>Area</option>" +
            "<option>Aspect ratio</option>" +
            "<option>n Categories</option>" +
            dataOpt +
            "</select>" +
            "</div>"

        cont.innerHTML += mess + `</div>`

        cont.addEventListener("change", displayScat)

    } else if (style === 'default') {   // ------------------------- Default
        curr_mod = "default"
        svg.selectAll("image")
            .transition().duration(duration)
            .attr("x", (d) => d.rx * w)
            .attr("y", (d) => d.ry * h)
            .attr("width", (d) => d.rWidth * w)
            .attr("height", (d) => d.rHeight * h)


    } else if (style === 'categories') {     // ------------------------- Categories
        curr_mod = "categories"
    }
}


const pointInPolygon = function (point, vs) {
    let x = point[0],
        y = point[1];

    let inside = false;
    for (let i = 0, j = vs.length - 1; i < vs.length; j = i++) {
        let xi = vs[i][0],
            yi = vs[i][1];
        let xj = vs[j][0],
            yj = vs[j][1];

        let intersect =
            yi > y != yj > y &&
            x < ((xj - xi) * (y - yi)) / (yj - yi) + xi;
        if (intersect) inside = !inside;
    }

    return inside;
};


function rectInPolygon(rect, vs) {
    let x = rect[0],
        y = rect[1],
        w = rect[2],
        h = rect[3];

    let inside = false;
    for (let i = 0, j = vs.length - 1; i < vs.length; j = i++) {
        let xi = vs[i][0],
            yi = vs[i][1];
        let xj = vs[j][0],
            yj = vs[j][1];

        /*   let intersect =
               yi > y != yj > y &&
               x < ((xj - xi) * (y - yi)) / (yj - yi) + xi;*/
        // if (intersect) inside = !inside;

        let overlap = !(
            w < xi ||
            x > xj ||
            h < yi ||
            y > yj)

        if (overlap) inside = !inside;
    }


    return inside;
}


function drawPath() {
    d3.select("#lasso")
        .style("stroke", "black")
        .style("stroke-width", 2)
        .style("fill", "rgba(0,0,0,0.2)")
        // .style("fill", "rgba(255,255,255,0.65)")
        .attr("d", lineGenerator(coords));


}

function dragStart() {
    if (!dragMod) {
        coords = [];
        offset = undefined
        const svg = d3.select('#svgDisplay');
        over_on = false
        // svg.selectAll("image").transition().duration(250).style("opacity", 0.2);
        // svg.selectAll("images").attr("fill", "steelblue");
        // svg.style("background-color", "rgba(0,0,0,0.65)");
        d3.select("#lasso").remove();
        svg.append("path")
            .attr("id", "lasso");
    }
}

function fixBounds(point) {
    // console.log("----");
    // console.log(point);
    if (point[0] < 0) {
        point[0] = 0;
    } else if (point[0] > bounds[0]) {
        point[0] = bounds[0];
    }

    if (point[1] < 0) {
        point[1] = 0;
    } else if (point[1] > bounds[1]) {
        point[1] = bounds[1];
    }

    // console.log(point);
    return point;
}

function dragMove(event) {
    if (!dragMod) {
        let mouseX = event.x;
        let mouseY = event.y

        if (offset === undefined) {
            offset = [event.sourceEvent.offsetX - event.x, event.sourceEvent.offsetY - event.y];

        }

        mouseX += offset[0];
        mouseY += offset[1];

        const svg = d3.select('#svgDisplay');

        const pt = fixBounds([mouseX, mouseY])
        coords.push(pt);

        svg.selectAll("image").style("opacity", 0.3);
        drawPath();
        svg.selectAll("image").each((d, i, e) => {

            const elem = d3.select(e[i])

            let point = [
                parseFloat(elem.attr('x')) + parseFloat(elem.attr('width')) / 2,
                parseFloat(elem.attr('y')) + parseFloat(elem.attr('height')) / 2,
            ];

            if (pointInPolygon(point, coords)) {
                elem.style("opacity", 1)
            }
        })

    }
}

function dragEnd() {

    if (!dragMod) {
        let selectedDots = [];
        const svg = d3.select('#svgDisplay');

        const tsvg = document.getElementById("marksDisplay")

        const w = tsvg.offsetWidth
        const h = tsvg.offsetHeight

        svg.selectAll("image").each((d, i, e) => {
            // console.log(d);

            const elem = d3.select(e[i])

            /*        let point = [
                        d.rx * w + (d.rWidth * w) / 2,
                        d.ry * h + (d.rHeight * h) / 2,
                    ];*/

            let point = [
                parseFloat(elem.attr('x')) + parseFloat(elem.attr('width')) / 2,
                parseFloat(elem.attr('y')) + parseFloat(elem.attr('height')) / 2,
            ];


            // let rect = [
            //     d.rx * w,
            //     d.ry * h,
            //     d.rWidth * w + d.rx * w,
            //     d.ry * h +
            //     d.rHeight * h,
            // ];
            if (pointInPolygon(point, coords)) {
                // d3.select("image[num='" + i + "'").transition().duration(250).style("opacity", 0.5);
                selectedDots.push(d);
                // this.style("opacity", 0);
                // console.log(e[i]);
                // d3.select(e[i]).style("opacity", 0)
                // e[i]
            }


            // if (rectInPolygon(rect, coords))
            //     selectedDots.push(d);


        });
        seldots = [...selectedDots]
        svg.selectAll("image").style("opacity", 1);
        // over_on = true

        drawSamples(selectedDots);


    }
}

function sortGrid(e) {
    let sel = document.getElementById("gridSort")
    let type = sel.value
    let tdat = [...sampleData]
    let indices = new Array(tdat.length);

    const svg = d3.select('#svgDisplay')
    const tsvg = document.getElementById("inVis")
    const w = tsvg.offsetWidth

    for (let i = 0; i < tdat.length; ++i) indices[i] = i;


    if (type === "Area") {


        indices.sort(function (a, b) {

            let aArea = (tdat[a].width * tdat[a].height)
            let bArea = (tdat[b].width * tdat[b].height)

            if (aArea > bArea) return -1;
            if (aArea < bArea) return 1;
            return 0
        });


    } else if (type === "Aspect ratio") {

        indices.sort(function (a, b) {

            let aRatio = (tdat[a].width / tdat[a].height)
            let bRatio = (tdat[b].width / tdat[b].height)

            if (aRatio > bRatio) return -1;
            if (aRatio < bRatio) return 1;
            return 0
        });


    } else if (type === "Categories") {

        for (let i = 0; i < tdat.length; i++) {

            let mes = ""
            for (const [key, value] of Object.entries(tdat[i].categories)) {
                mes += key + ","
            }

            tdat[i]["catGroup"] = mes.slice(0, -1)
            tdat[i]["tid"] = i

        }

        let t = Object.groupBy(tdat, ({catGroup}) => catGroup)

        let ti = 0

        for (const [key, value] of Object.entries(t)) {

            for (let i = 0; i < value.length; i++) {

                indices[ti] = value[i].tid
                ++ti
            }
        }

    } else if (type === "None") {


    } else {
        indices.sort(function (a, b) {

            if (tdat[a].data && tdat[b].data) {
                let aData = tdat[a].data[type].value
                let bData = tdat[b].data[type].value

                if (aData === undefined && bData) return 1;
                if (aData && bData === undefined) return -1;

                if (aData > bData) return -1;
                if (aData < bData) return 1;

            } else if (tdat[a].data && tdat[b].data === undefined) return -1;
            else if (tdat[a].data === undefined && tdat[b].data) return 1;

            return 0
        });
    }
    /**/

    updateGrid(indices, svg, w);
}

function updateGrid(data, svg, w) {
    const averageW = sampleData.map(d => d.width).reduce((a, b) => a + b) / sampleData.length;
    const averageH = sampleData.map(d => d.height).reduce((a, b) => a + b) / sampleData.length;


    // let mw = Math.max(...marks.map(d => d.width))
    // let mh = Math.max(...marks.map(d => d.height))

    const rowRatio = Math.floor(w / averageW)

    svg.selectAll("image")
        .transition().duration(duration)
        .attr("x", (d, i) => {
            return (data.indexOf(i) % rowRatio) * averageW
        })
        .attr("y", (d, i) => {
            let row = Math.floor(data.indexOf(i) / rowRatio)
            return row * averageH;
        })

}

function displayScat() {
    const sel1 = document.getElementById("scatterField1")
    const sel2 = document.getElementById("scatterField2")

    const svg = d3.select('#svgDisplay')
    const tsvg = document.getElementById("inVis")
    const w = tsvg.offsetWidth
    const h = tsvg.offsetHeight

    let mw = Math.max(...sampleData.map(d => d.width))
    let mh = Math.max(...sampleData.map(d => d.height))


    let domain1 = getDomainFromName(sampleData, sel1.value)
    let domain2 = getDomainFromName(sampleData, sel2.value)

    let xrange = d3.scaleLinear().range([35, w - mw]).domain(domain1)
    let yrange = d3.scaleLinear().range([h - 20, 0]).domain(domain2)

    svg.selectAll("image")
        .transition().duration(duration)
        .attr("x", (d) => {
            return xrange(getDataFromName(d, sel1.value)) //+ (d.rWidth * w)/2,

        })
        .attr("y", (d) => {
            return Math.max(yrange(getDataFromName(d, sel2.value)) - (d.rHeight * w) / 2, 20
            )
        })

    svg.selectAll("g").remove()
    svg.selectAll("text").remove()

    svg
        .append("g")
        .attr("transform", "translate(" + 0 + "," + (h - 25) + ")")      // This controls the vertical position of the Axis
        .call(d3.axisBottom(xrange));

    svg
        .append("g")
        .attr("transform", "translate(35,0)")      // This controls the vertical position of the Axis
        .call(d3.axisLeft(yrange));

    svg.append("text")
        .attr("text-anchor", "end")
        .attr("transform", "rotate(-90)")
        .attr("y", 10)
        .attr("x", 0)
        .style("font-size", "10pt")
        .text(sel2.value)

    svg.append("text")
        .attr("text-anchor", "end")
        // .attr("transform", "rotate(-90)")
        .attr("y", h)
        .attr("x", w - mw)
        .style("font-size", "10pt")
        .text(sel1.value)
}

function getDomainFromName(data, type) {

    return d3.extent(data, (d) => getDataFromName(d, type))
}

function getDataFromName(d, type) {
    if (type === "Area") {
        return d.width * d.height
    } else if (type === "Aspect ratio") {
        return d.width / d.height
    } else if (type === "n Categories") {
        return Object.keys(d.categories).length
    } else {
        return d.data[type] ? d.data[type].value : 0
    }
}

function updateChart(type, data) {
    // fillSvg(sampleData)

    const svg = d3.select('#svgDisplay')
    svg.selectAll("image").filter((d =>
        data.includes(d))
    ).remove()
    if (type === "grid") {
        sortGrid()
    } else if (type === "area") {
        displayScat()
    } else {

    }

    svg.select("#lasso").remove()
}

function rotaTest() {
    let imgs = d3.selectAll("image")
    imgs.style("transform-box", "fill-box")
    imgs.style("transform-origin", "center")
    imgs.transition().duration(500).style("transform", (d) => {
        let t = parseFloat(d.data.orientation.value) //-90
        console.log(t);
        return "rotate(" + t + "deg)"
    })
}

function imgDragStart(event) {
    if (dragMod) {

        selectedImg = d3.select(this)

        if (offset === undefined) {
            offset = [event.x - selectedImg.attr("x"), event.y - selectedImg.attr("y")];
        }


    } else if (rotateMod) {

        selectedImg = d3.select(this)
        if (offset === undefined) {
            offset = [event.x - selectedImg.attr("x"), event.y - selectedImg.attr("y")];
        }
    }
}

function imgDragMove(event) {
    if (dragMod) {
        let mouseX = event.x;
        let mouseY = event.y

        /*        if (offset === undefined) {
                    offset = [event.sourceEvent.offsetX - event.x, event.sourceEvent.offsetY - event.y];
                }

         */
        mouseX -= offset[0];
        mouseY -= offset[1];

        const pt = fixBounds([mouseX, mouseY])

        selectedImg.attr("x", pt[0])
        selectedImg.attr("y", pt[1])

    } else if (rotateMod) {
        let mouseX = event.x;
        let mouseY = event.y
        mouseX -= offset[0];
        mouseY -= offset[1];

        let orx = selectedImg.attr("x");
        let ory = selectedImg.attr("y");

        let deg = get_orr([orx, ory], [mouseX, mouseY]);

        selectedImg.style("transform", "rotate(" + deg + "deg)");
    }
}


function imgDragEnd(event) {
    if (dragMod) {
        let mouseX = event.x;
        let mouseY = event.y

        mouseX -= offset[0];
        mouseY -= offset[1];

        const pt = fixBounds([mouseX, mouseY])

        selectedImg.attr("x", pt[0])
        selectedImg.attr("y", pt[1])


        let num = +selectedImg.attr("num")

        let svg = document.getElementById("svgDisplay")
        let bbox = svg.getBoundingClientRect()

        sampleData[num].rx = pt[0] / bbox.width
        sampleData[num].ry = pt[1] / bbox.height

        selectedImg = undefined
        offset = undefined
        dragMod = false

    }
}