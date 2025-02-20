function loadImg(src) {

    let im = new Image();
    im.crossOrigin = "Anonymous";

    im.onload = function () {
        currImg = im
        im.crossOrigin = "anonymous";
        let can = document.getElementById("inVis")

        let cont = can.getContext('2d');

        // let rate = fixRatio2([im.width, im.height], [can.getBoundingClientRect().width, 9999])

        let t = Math.round((im.height * can.getBoundingClientRect().width) / im.width)
        viewDim = [can.getBoundingClientRect().width, t]
        can.width = viewDim[0]
        can.style.width = viewDim[0] + 'px';
        can.style.height = viewDim[1] + "px"
        can.height = viewDim[1]


        // cont.drawImage(im, 0, 0, rate[0], rate[1])
        cont.drawImage(im, 0, 0, viewDim[0], viewDim[1]);

        fillSvg(sampleData)
    };

    im.src = src

}


function fixRatio2(im, sv) {

    //size based
    let aspr = im[0] / im[1];
    let svAspr = sv[0] / sv[1];

    if (im[0] < sv[0] && im[1] < sv[1]) {
        // Image plus petite
        return [im[0], im[1], aspr];
    }

    if (im[0] > sv[0] || im[1] > sv[1]) {
        // Image plus grande
        let vr = sv[1] / im[1];
        let hr = sv[0] / im[0];

        if (vr < hr) {
            // Image Horizontale
            return [(sv[1] * im[0]) / im[1], sv[1]];
        } else if (vr > hr) {
            // Image Verticale
            return [sv[0], (sv[0] * im[1]) / im[0]];
        } else {
            return [sv[0], (sv[0] * im[1]) / im[0]];
        }
    }
}


function drawSamples(samples) {

    let can = document.getElementById("inVis")
    let cont = can.getContext('2d');

    // cont.strokeStyle = "#fff";
    cont.clearRect(0, 0, can.width, can.height);
    cont.rect(0, 0, can.width, can.height);
    cont.fillStyle = "#000";
    cont.fill()
    cont.globalAlpha = 0.6
    cont.drawImage(currImg, 0, 0, can.width, can.height);
    cont.globalAlpha = 1

    for (let i = 0; i < samples.length; i++) {

        const sample = samples[i];

        // if (sample["data"]) {
        //     if (sample.data["orientation"]) {
        //         const tx = sample.rx * can.width
        //         const ty = sample.ry * can.height;
        //         const tw = sample.rWidth * can.width
        //         const th = sample.rHeight * can.height
        //
        //         cont.save()
        //         cont.translate(tx, ty);
        //         cont.rotate(sample.orientation * Math.PI / 180);
        //
        //         cont.drawImage(sample.canvas, -tw/ 2, -th / 2, tw, th);
        //         cont.restore();
        //     } else {
                cont.drawImage(
                    sample.canvas,
                    sample.rx * can.width,
                    sample.ry * can.height,
                    sample.rWidth * can.width,
                    sample.rHeight * can.height
                );
            // }
        // }


    }

}


function resetImg() {

    let can = document.getElementById("inVis")
    let cont = can.getContext('2d');


    cont.drawImage(currImg, 0, 0, ...viewDim);
}

function importImg(e) {
    const reader = new FileReader();

    clearExamples()
    reader.onload = function (e) {

        // currImg = e.target.result;

        purge()
        loadImg(e.target.result);
        // console.log(currImg);
        switchMode("rect")

    }
    reader.readAsDataURL(e.target.files[0]);
}

