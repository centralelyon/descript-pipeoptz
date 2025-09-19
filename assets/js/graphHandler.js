function iniGraph(pipeline) {
    const dot = curateDot(globalPipelines["graphs"][pipeline])

    let t = d3.transition()
        .duration(750)
        .ease(d3.easeLinear);

    const svg = document.getElementById("pipelineGraph");
    const vbox = svg.getBoundingClientRect()

    const th = document.getElementById("inVis").height

    d3.select(svg)
        .graphviz(false)
        .width(vbox.width)
        .height(th)
        .transition(t)
        .fit(true)
        .dot(dot)
        .render();

    d3.select(svg).on("click", function (e) {

        const el = e.target.parentElement;

        if (el.matches(".node")) {
            handleNodeClick(el)
        }
    })

}


function switchGraph() {
    const pipe = document.getElementById("pipeSelect").value

    iniGraph(pipe)
}

function curateDot(dot) {
    const regex = /<BR\/><FONT POINT-SIZE="10">[0-9_.A-Za-z]*<\/FONT>/gm
    const found = dot.match(regex);

    for (let i = 0; i < found.length; i++) {
        dot = dot.replace(found[i], "")
    }

    return dot
}


function handleNodeClick(node) {

    let nodeData = getParams(node)
    loadGraphModal(nodeData.key, nodeData.params)
}


function getParams(node) {
    let res = []
    const nodeName = node.__data__.key.replace("_", " ")
    const currPipe = document.getElementById("pipeSelect").value

    // d3.select(node).selectAll("text[font-size=\"8.00\"]").each(function (d, i) { // Parse graph to get params
    //     const t = d.children[0].text.replace("(", '').replace(")", '').replace(" ", "").split(",")
    //     res.push(t.replace(" ",""));
    // })

    if (globalPipelines.fixedParams[currPipe][nodeName]) {
        res = Object.keys(globalPipelines.fixedParams[currPipe][nodeName])
    }
    return {key: nodeName, params: res} //temp stuff might change due to graph structure and representation
}


function loadGraphModal(nodeName, params) {
    const dialog = document.getElementById("graphParamNode");
    dialog.showModal();

    document.getElementById("closeGraphMod").onclick = function () {
        dialog.close();
    }

    document.getElementById("modalGraphTitle").innerHTML = nodeName;

    const container = document.getElementById("modalGraphParamsBody");

    container.innerHTML = ""

    const currPipe = document.getElementById("pipeSelect").value

    const desc = []

    if (nodeOuputs?.[nodeName]) {
        const img = document.getElementById("nodeOutputImg")
        const cont = document.getElementById("nodeOutputContainer")
        img.style.display = "inline-block";
        cont.style.display = "inline-block";
        img.src = "data:image/png;base64," + nodeOuputs[nodeName];
    } else {
        const img = document.getElementById("nodeOutputImg")
        const cont = document.getElementById("nodeOutputContainer")
        img.style.display = "none";
        cont.style.display = "none";
    }

    for (let i = 0; i < params.length; i++) {
        const desc = getDescription(currPipe, nodeName, params[i])

        let tdiv = document.createElement("div");
        let paramLabel = document.createElement("p");
        let paramInput = document.createElement("input");

        paramLabel.innerHTML = params[i];
        paramLabel.setAttribute("class", "graphParamLabel");
        if (customPipelineParam[currPipe][nodeName]) {
            if (customPipelineParam[currPipe][nodeName][params[i]]) {
                paramInput.value = customPipelineParam[currPipe][nodeName][params[i]]
            } else {
                paramInput.value = globalPipelines.fixedParams[currPipe][nodeName][params[i]]
            }
        } else {
            paramInput.value = globalPipelines.fixedParams[currPipe][nodeName][params[i]]
        }

        tdiv.appendChild(paramLabel);

        let input = makeSlider(nodeName, params[i], desc, globalPipelines.fixedParams[currPipe][nodeName][params[i]])
        tdiv.appendChild(input);

        container.appendChild(tdiv);
    }

    const save = document.getElementById("modalGraphSaveParams");
    const test = document.getElementById("modalGraphTestParams");

    save.onclick = function () {
        let values = []

        container.querySelectorAll("input").forEach(function (d, i) {
            values.push(d.value)
        })


        for (let i = 0; i < values.length; i++) {

            if (values[i] !== 0 && values[i] !== undefined && values[i] !== null)
                if (!customPipelineParam[currPipe][nodeName]) {
                    customPipelineParam[currPipe][nodeName] = {[params[i]]: values[i]};
                } else {
                    customPipelineParam[currPipe][nodeName][params[i]] = values[i]
                }
        }

        setPipelinesParams(currPipe, nodeName).then(r => "")

        dialog.close();

    }

    test.onclick = function () {
        let values = {}

        const tkeys = Object.keys(globalPipelines.fixedParams[currPipe][nodeName])

        container.querySelectorAll("input").forEach(function (d, i) {
            values[tkeys[i]] = d.value
        })

        testNode(currPipe, nodeName, values).then(r => "")
    }
}


function getNodeGroup(nodeName) {

    const svg = d3.select("#pipelineGraph")


    let t = svg.selectAll("g").filter(function (d, i) {
        let id = d.id.split(".");
        id = id[id.length - 1];
        return id === nodeName

    })

    return t._groups[0][0]
}


function changeNodeColor(nodeName, params, newParams) {

    let changed = false
    for (const [k, v] of Object.entries(newParams)) {
        if (params[k] !== v) {
            changed = true
        }
    }
    let g = getNodeGroup(nodeName)
    if (g !== undefined) {
        g = d3.select(g)
    }
    const poly = g.select("polygon")
    console.log(poly);
    if (changed) {
        poly.style("fill", "red");

    } else {
        poly.style("fill", "green");
    }
}


function getDescription(pipeline, nodeName, param) {

    if (!param.startsWith("[optz]")) {
        return globalPipelines.description[pipeline][nodeName + "." + param];
    } else {
        return globalPipelines.description[pipeline][param + ".n"];
    }
}


function makeSlider(nodeName, param, desc, value) {


    let container = document.createElement("div");

    container.classList.add("sliderContainer");

    let output = document.createElement("output");
    output.classList.add("sliderTooltip");
    output.innerText = value;

    let ratio = (180 * (value - desc["min"])) / (desc["max"] - desc["min"])

    output.style.left = ratio + "px";

    let sliderInput = document.createElement("input");
    sliderInput.setAttribute("type", "range");
    sliderInput.setAttribute("min", desc["min"]);
    sliderInput.setAttribute("max", desc["max"]);
    sliderInput.setAttribute("step", desc["step"]);
    sliderInput.setAttribute("value", value);

    sliderInput.classList.add("paramValueSlider");
    let min = document.createElement("p");
    let max = document.createElement("p");

    min.innerHTML = desc["min"];
    max.innerHTML = desc["max"];
    container.appendChild(output)
    container.appendChild(min)
    container.appendChild(sliderInput)
    container.appendChild(max)

    sliderInput.oninput = function () {

        const tval = this.value

        let ratio = (180 * (tval - desc["min"])) / (desc["max"] - desc["min"]+1)

        output.style.left = ratio + "px";
        output.innerHTML = tval

    }

    return container

}