function loadImg(src) {

    let im = new Image();


    im.onload = function () {

        let can = document.getElementById("inVis")

        let cont = can.getContext('2d');

        let rate = fixRatio2([im.width, im.height], [can.getBoundingClientRect().width, 9999])

        can.width = rate[0]
        can.height = rate[1]

        cont.drawImage(im, 0, 0, rate[0], rate[1])
        currImg = im


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

        cont.drawImage(
            sample.canvas,
            sample.x,
            sample.y,
            sample.width,
            sample.height
        );

    }

}


function resetImg() {

    let can = document.getElementById("inVis")
    let cont = can.getContext('2d');

    cont.drawImage(currImg, 0, 0, can.width, can.height);
}



