let metaOperations = {}

let operations = [
    {
        name: "orientation",
    },
    {
        name: "dominant_color",
    },
    {
        name: "area",
    }

]


function addNode(name, description) {


    if (!metaOperations[name]) {
        metaOperations[name] = {name: name, description: description}
    }
    // fillFakeMeta()
    makeOpGraph()
}


function fillFakeMeta() {

    const container = document.getElementById("fakeOpList")

    container.innerHTML = ""

    for (const [k, v] of Object.entries(metaOperations)) {

        const tdiv = document.createElement("div")

        tdiv.innerHTML = `<p>${v.name}</p> <p>${(k.description ? k.description : "")}</p>`
        container.appendChild(tdiv)
    }
}


function fillOperations() {


    const container = document.getElementById("OperationList")

    for (const operation of operations) {

        const tdiv = document.createElement("div")
        tdiv.classList.add("operation")

        tdiv.innerHTML = `<p>${operation.name}</p> `

        tdiv.onclick = function () {
            metaOperations[operation.name] = operation
            // fillFakeMeta()
            makeOpGraph()
        }

        container.appendChild(tdiv)
    }
}


function fakeDot() {

    let root = "samples"

    let diagram = `digraph {\n`

    for (const [k, v] of Object.entries(metaOperations)) {
        diagram += `${root} -> ${v.name};\n`
    }

    diagram += `}`

    return diagram;
}


function makeOpGraph() {

    const dot = fakeDot()


    const svg = document.getElementById("singlePipeLineGraph");
    const vbox = svg.getBoundingClientRect()

    let t = d3.transition()
        .duration(750)
        .ease(d3.easeLinear);

    d3.select(svg)
        .graphviz()
        .width(vbox.width)
        .height(vbox.height)
        .transition(t)
        .fit(true)
        .dot(dot)
        .render();

}