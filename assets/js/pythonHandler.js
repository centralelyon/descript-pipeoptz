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
            console.log(res);
            if (!res.ok) {
                throw new Error(`HTTP error! Status: ${res.status}`);
            }
            return res.json();
        })
        .then(function (data) {
            return data
        })

    let allCorners = fakeCoords()

    let tx = currImg.width
    let ty = currImg.height


    for (let i = 0; i < imgs["images"].length; i++) {
        const tcan = await convertToCanvas("data:image/png;base64," + imgs["images"][i])

        let corners = allCorners[i]
        let tw = tcan.width
        let th = tcan.height

        let tres = {
            x: corners[0],
            y: corners[1],
            width: tw,
            height: th,
            type: "rect",
            canvas: tcan,
            // categories: "default",
            rx: corners[0] / tx,
            ry: corners[1] / ty,
            rWidth: tw / tx,
            rHeight: th / ty,

        }

        sampleData.push(tres)


    }
    fillSvg(sampleData)

}


function fakeCoords() {

    let xs = [0, currImg.width / 2, 0, currImg.width / 2]
    let ys = [0, currImg.height / 2, 0, currImg.height / 2]


    return [[xs[0], ys[0]], [xs[1], ys[0]], [xs[0], ys[1]], [xs[1], ys[1]]];
}



async function getPipelines() {
    let pipelines = await fetch("http://localhost:5000/pipes",
        {
            mode: 'cors',
            headers: {},
            method: "GET"
        })
        .then(function (res) {
            console.log(res);
            if (!res.ok) {
                throw new Error(`HTTP error! Status: ${res.status}`);
            }
            return res.json();
        })
        .then(function (data) {
            return data["pipelines"]
        })


    const sel = document.getElementById("pipeSelect")


    for (let i = 0; i < pipelines.length; i++) {
        sel.innerHTML += `<option value="${pipelines[i]}">${pipelines[i]}</option>`
    }
}