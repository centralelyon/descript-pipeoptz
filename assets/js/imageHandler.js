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


        const drawImage = () => {
            cont.drawImage(currImg, 0, 0, rate[0], rate[1]);
        }

        const drawSelection = (e) => {
            cont.strokeStyle = "#000";
            cont.beginPath();
            cont.rect(origin.x, origin.y, e.offsetX - origin.x, e.offsetY - origin.y);
            cont.stroke();
        };

        const clear = () => {
            cont.strokeStyle = "#fff";
            cont.clearRect(0, 0, rate[0], rate[1]);
        };

        const render = (e) => {
            clear();
            drawImage();

            if (origin) drawSelection(e);
        }
        can.onmousedown = e => {
            origin = {x: e.offsetX, y: e.offsetY};
        };
        can.onmouseup = e => {
            addRectSample(origin.x, origin.y, e.offsetX - origin.x, e.offsetY - origin.y);
            origin = null;

            render(e);
        };
        can.onmousemove = render;

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






