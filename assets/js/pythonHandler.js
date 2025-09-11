let nodeOuputs
let forwardAllowed = false
let debug = false
let base_url = "http://localhost:5000"

if (debug) {
    base_url = "http://156.18.36.227:5000/"
}


function saveManualAnnotated() {

    manualAnnotated = sampleData.filter(d => {
        return d.type === "manual"
    })

}

async function forwardPipeline(pipeline, img = null) {
    if (forwardAllowed) {
        const gif = document.getElementById("pipeLoaderGif");
        toggleForward()
        gif.style.display = "inline-block";

        img = getImgBase64(currImg)
        img = dataURLtoFile(img, "temp.png")

        let form = new FormData();
        form.append("pipeline", pipeline);
        form.append("image", img);


        let imgs = await fetch(base_url + "/ask",
            {
                mode: 'cors',
                headers: {},
                method: "POST",
                body: form
            })
            .then(function (res) {
                if (!res.ok) {
                    throw new Error(`HTTP error! Status: ${res.status}`);
                }
                return res.json();
            })
            .then(function (data) {
                let key = `Forward pipeline (${pipeline}) to yield ${data.images.length} elements`;
                megalog.push({[key]: data})
                updateLog()
                return data
            })

        nodeOuputs = imgs["outputs"]
        sampleData = [...manualAnnotated]
        for (let i = 0; i < imgs["images"].length; i++) {
            const tcan = await convertToCanvas("data:image/png;base64," + imgs["images"][i][0])
            const rpos = imgs["images"][i][1]

            let tw = tcan.width
            let th = tcan.height

            let tres = {
                width: tw,
                height: th,
                type: "rect",
                canvas: tcan,
                // categories: "default",
                rx: rpos[0],
                ry: rpos[1],
                rWidth: rpos[2] - rpos[0],
                rHeight: rpos[3] - rpos[1],
            }

            sampleData.push(tres)


        }

        if (!checkExist("Extraction")) {
            globalMeta.push({
                name: 'Extraction',
                parent: ['image'],
                children: []
            })

            if (!checkExist("Samples")) {
                globalMeta.push({
                    name: 'Samples',
                    parent: ['Extraction'],
                    children: []
                })
            }  else {
                let t = globalMeta.filter(d => d.name === "Samples")[0]
                console.log(t);
                t.parent.push("Extraction")
            }

            fakeSideGraph()
            globalMeta[0].children.push('Extraction')
        }

        fillSvg(sampleData)

        // for (let i = 0; i < sampleData.length; i++) {
        drawSamples(sampleData)

        // }

        gif.style.display = "none";
        toggleForward()
    }
}


function fakeCoords(n) {
    let coords = [];
    let cols = Math.ceil(Math.sqrt(n));
    let rows = Math.ceil(n / cols);
    let imgW = currImg.width;
    let imgH = currImg.height;
    let cellW = imgW / cols;
    let cellH = imgH / rows;

    for (let i = 0; i < n; i++) {
        let row = Math.floor(i / cols);
        let col = i % cols;
        let x = col * cellW;
        let y = row * cellH;
        coords.push([x, y]);
    }
    return coords;
}

function toggleForward() {
    forwardAllowed = !forwardAllowed;
    document.getElementById("forwardButton").classList.toggle("disabledButton");
    document.getElementById("optiButton").classList.toggle("disabledButton");
}

async function setPipelinesParams(pipeline, node) {


    let form = new FormData();
    form.append("pipeline", pipeline);
    form.append("nodes", JSON.stringify(customPipelineParam[pipeline]));
    let pipelines = await fetch(base_url + "/setPipeParams",
        {
            mode: 'cors',
            headers: {},
            method: "POST",
            body: form
        })
        .then(function (res) {
            // console.log(res);
            if (!res.ok) {
                throw new Error(`HTTP error! Status: ${res.status}`);
            }

            let key = `Edited node (${node})  of (${pipeline})`;
            megalog.push({[key]: res})
            updateLog()
            return res
        })
}


async function testNode(pipeline, node, params) {


    let form = new FormData();
    form.append("pipeline", pipeline);
    form.append("node", node);
    form.append("params", JSON.stringify(params));

    let img = await fetch(base_url + "/testNode",
        {
            mode: 'cors',
            headers: {},
            method: "POST",
            body: form
        })
        .then(function (res) {
            // console.log(res);
            if (!res.ok) {
                throw new Error(`HTTP error! Status: ${res.status}`);
            }


            return res.json();
        }).then(function (data) {
            const img = document.getElementById("nodeOutputImg")

            img.style.display = "inline-block";
            img.src = "data:image/png;base64," + data.result;
            return data
        })
}


async function getPipelines() {
    let pipelines = await fetch(base_url + "/pipes",
        {
            mode: 'cors',
            headers: {},
            method: "GET"
        })
        .then(function (res) {
            // console.log(res);
            if (!res.ok) {
                throw new Error(`HTTP error! Status: ${res.status}`);
            }
            return res.json();
        })
        .then(function (data) {
            globalPipelines = data

            globalPipelines.fixedParams = curateFixedParams(globalPipelines.fixedParams)

            iniGraph(data["pipelines"][0])


            return data["pipelines"]
        })


    const sel = document.getElementById("pipeSelect")


    for (let i = 0; i < pipelines.length; i++) {
        sel.innerHTML += `<option value="${pipelines[i]}">${pipelines[i]}</option>`
        customPipelineParam[pipelines[i]] = {}
    }
}

async function optimizePipelineParams(pipeline) {

    let imgs = sampleData.filter(d => {
        return d.type === "manual"
    })

    if (forwardAllowed && imgs.length > 0) {

        toggleForward()
        const gif = document.getElementById("pipeLoaderGif");
        gif.style.display = "inline-block";


        let img = getImgBase64(currImg)
        img = dataURLtoFile(img, "temp.png")


        if (imgs.length > 0) {

            let control = []
            let coords = []
            let counter = []
            let counterCoords = []
            for (let i = 0; i < imgs.length; i++) {
                if (imgs[i].canvas.width > 10) {
                    control.push(imgs[i].canvas.toDataURL()); // we can't send multiple files in a single request without multi-parts.. Hence, we use b64
                    coords.push([imgs[i].rx, imgs[i].ry, imgs[i].rWidth, imgs[i].rHeight]);
                }
            }
            ;

            for (let i = 0; i < counterExamples.length; i++) {
                counter.push(counterExamples[i].canvas.toDataURL());

                counterCoords.push([counterExamples[i].rx, counterExamples[i].ry, counterExamples[i].rWidth, counterExamples[i].rHeight]);
            }

            let form = new FormData();

            form.append("pipeline", pipeline);
            form.append("images", JSON.stringify(control));
            form.append("counter", JSON.stringify(counter));
            form.append("coords", JSON.stringify(coords));
            form.append("counterCoords", JSON.stringify(counterCoords));
            form.append("input", img);

            let params = await fetch(base_url + "/optimizePipeline",
                {
                    mode: 'cors',
                    headers: {},
                    method: 'POST',
                    body: form
                })
                .then(function (res) {
                    // console.log(res);
                    if (!res.ok) {
                        throw new Error(`HTTP error! Status: ${res.status}`);
                    }
                    return res.json();
                })
                .then(function (data) {

                    console.log(data);

                    let tparams = curateFixedParams(data["best_params"])

                    for (const [k, v] of Object.entries(tparams)) {
                        const t = k.split(".")

                        const node = t[0];
                        const param = t[1];

                        // globalPipelines.fixedParams[pipeline][node][param] = v

                        const diff = Math.abs(globalPipelines.fixedParams[pipeline][node][param] - v)



                    }


                    toggleForward()
                    gif.style.display = "none";
                    return tparams
                })
        }
    }
}


function curateFixedParams(data) {
    let res = {}

    for (const [key, value] of Object.entries(data)) {
        if (!key.startsWith("[optz]")) {

            res[key] = {}

            for (const [k, v] of Object.entries(value)) {
                let name = k.split(".")

                if (res[key][name[0]]) {
                    res[key][name[0]][name[1]] = v
                } else {
                    res[key][name[0]] = {[name[1]]: v}
                }
            }
        }
    }

    return res
}