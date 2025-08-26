async function forwardPipeline(pipeline, img = null) {
    img = getImgBase64(currImg)
    img = dataURLtoFile(img, "temp.png")

    let form = new FormData();
    form.append("pipeline", pipeline);
    form.append("image", img);

    let imgs = await fetch("http://localhost:5000/ask",
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
            return data
        })

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
    fillSvg(sampleData)

    // for (let i = 0; i < sampleData.length; i++) {
        drawSamples(sampleData)

    // }

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


async function getPipelines() {
    let pipelines = await fetch("http://localhost:5000/pipes",
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
            iniGraph(data["pipelines"][0])
            return data["pipelines"]
        })


    const sel = document.getElementById("pipeSelect")


    for (let i = 0; i < pipelines.length; i++) {
        sel.innerHTML += `<option value="${pipelines[i]}">${pipelines[i]}</option>`
    }
}