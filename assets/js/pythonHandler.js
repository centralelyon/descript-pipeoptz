async function forwardPipeline(pipeline, img = null) {
    img = getImgBase64(currImg)
    img = dataURLtoFile(img, "temp.png")

    let form = new FormData();
    form.append("pipeline", pipeline);
    form.append("image", img);

    let imgs = await fetch("http://localhost:5000/ask",
        {
            mode: 'cors',
            headers: {
                // "Access-Control-Allow-Origin":"*",
                // "Access-Control-Allow-Methods": "GET, PUT, POST, DELETE, HEAD, OPTIONS"
            },
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
            // console.log(JSON.stringify(data))
            return data
        })

    // console.log(imgs["images"]);

    let cans = []
    for (let i = 0; i < imgs["images"].length; i++) {
        cans.push( await convertToCanvas("data:image/png;base64,"+imgs["images"][i]));
    }
    console.log(cans);
}