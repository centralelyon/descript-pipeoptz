const duration = 900

const mods = ['grid', "scatter", 'default']


let coords = [];
let curr_mod = "default"
let lineGenerator;

let over_on = true

function fillSvg(marks) {

    const tsvg = document.getElementById("inVis")


    const rect = tsvg.getBoundingClientRect()

    const svg = d3.select('#svgDisplay');


    svg.selectAll("image").remove();

    const w = rect.width
    const h = rect.height

    svg.attr("width", w);
    svg.attr("height", h);


    lineGenerator = d3.line();

    svg.attr('viewBox', '0 0 ' + w + ' ' + h);


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
        .on("mouseenter", (e) => {
            if (over_on)
                drawSamples([e.originalTarget.__data__])
        })
        .on("mouseout", (e) => {
            if (over_on)
                drawImage()
        })
    // .attr('transform', (d) => `translate(${d.rx * w -(d.rWidth*w)/2},${d.ry * y-(d.rHeight*y)/2}) rotate(${d.data.orientation})` )

    // loopViews()

    const drag = d3
        .drag()
        .on("start", dragStart)
        .on("drag", dragMove)
        .on("end", dragEnd);

    svg.call(drag);
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


function switchSvg(marks, style) {

    const svg = d3.select('#svgDisplay')
    const tsvg = document.getElementById("inVis")
    const w = tsvg.offsetWidth
    const h = tsvg.offsetHeight


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

    } else if (style === 'scatter') { // -------------------------Scatter

        curr_mod = "scatter"
        let mw = Math.max(...marks.map(d => d.width))
        let mh = Math.max(...marks.map(d => d.height))


        const area = d3.extent(marks, (d) => d.width * d.height)
        const ratio = d3.extent(marks, (d) => d.width / d.height)

        let xrange = d3.scaleLinear().range([0, w - mw]).domain(area)
        let yrange = d3.scaleLinear().range([h - mh, 0]).domain(ratio)

        svg.selectAll("image")
            .transition().duration(duration)
            .attr("x", (d) => {
                return xrange(d.width * d.height)

            })
            .attr("y", (d) => {
                return yrange(d.width / d.height)
            })
            .attr("width", (d) => d.rWidth * w)
            .attr("height", (d) => d.rHeight * h)

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
};


function drawPath() {
    d3.select("#lasso")
        .style("stroke", "black")
        .style("stroke-width", 2)
        .style("fill", "#00000054")
        .attr("d", lineGenerator(coords));
}

function dragStart() {
    coords = [];
    const svg = d3.select('#svgDisplay');
    over_on = false
    svg.selectAll("image").transition().duration(250).style("opacity", 0.5);
    // svg.selectAll("images").attr("fill", "steelblue");
    d3.select("#lasso").remove();
    svg.append("path")
        .attr("id", "lasso");
}

function dragMove(event) {
    let mouseX = Math.max(event.sourceEvent.offsetX, 0);
    let mouseY = Math.max(event.sourceEvent.offsetY, 0);


    coords.push([mouseX, mouseY]);
    drawPath();
}

function dragEnd() {
    let selectedDots = [];
    const svg = d3.select('#svgDisplay');

    const tsvg = document.getElementById("marksDisplay")

    const w = tsvg.offsetWidth
    const h = tsvg.offsetHeight

    svg.selectAll("image").each((d, i) => {
        // console.log(d);
        let point = [
            d.rx * w + (d.rWidth * w) / 2, //TODO set points w.r.t. rect
            d.ry * h + (d.rHeight * h) / 2,
        ];

        // let rect = [
        //     d.rx * w,
        //     d.ry * h,
        //     d.rWidth * w + d.rx * w,
        //     d.ry * h +
        //     d.rHeight * h,
        // ];
                if (pointInPolygon(point, coords)) {
                    d3.select("image[num='" + i + "'").transition().duration(250).style("opacity", 0.5);
                    selectedDots.push(d);
                }
        svg.selectAll("image").transition().duration(50).style("opacity", 1);
        // if (rectInPolygon(rect, coords))
        //     selectedDots.push(d);

    });

    over_on = true

    drawSamples(selectedDots);
    // console.log(`select: ${selectedDots}`);
}

