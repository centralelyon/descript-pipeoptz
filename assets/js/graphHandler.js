function iniGraph(pipeline) {
    const dot = curateDot(globalPipelines["graphs"][pipeline])

    let t = d3.transition()
        .duration(750)
        .ease(d3.easeLinear);

    const svg = document.getElementById("pipelineGraph");
    const vbox =svg.getBoundingClientRect()

    d3.select("#pipelineGraph")
        .graphviz()
        .width(vbox.width)
        .height(vbox.height)
        .transition(t)
        .fit(true)
        .dot(dot)
        .render();

}

function switchGraph() {
    const pipe = document.getElementById("pipeSelect").value

    iniGraph(pipe)
}

function curateDot(dot){
    const regex = /<BR\/><FONT POINT-SIZE="10">[0-9_.A-Za-z]*<\/FONT>/gm
    const found = dot.match(regex);

    for (let i = 0; i < found.length; i++) {
        dot = dot.replace(found[i],"")

    }

    return dot
}