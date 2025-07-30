function forwardPipeline(pipeline, img=null) {
    img = getImgBase64(currImg)
    img = dataURLtoFile(img, "temp.png")
    let form = new FormData();
    form.append("pipeline", pipeline);
    form.append("image", img);

    console.log(img);

    fetch("http://localhost:5000/ask",
        {
            mode: 'no-cors',
            method: "POST",
            body: form
        })
        .then(function (res) {
            console.log(res);
            return res.json();
        })
        .then(function (data) {
            alert(JSON.stringify(data))
        })

}