function testEdge() {
    let src = opencv.imread('inVis');

    let dst = opencv.Mat.zeros(src.rows, src.cols, opencv.CV_8UC3);
    let temp = opencv.Mat.zeros(src.rows, src.cols, opencv.CV_8UC3);
    opencv.cvtColor(src, src, opencv.COLOR_RGBA2GRAY, 0);
    let ksize = new opencv.Size(5, 5);

    opencv.GaussianBlur(src, src, ksize, 0, 0, opencv.BORDER_DEFAULT);
//17, 16
    opencv.adaptiveThreshold(src, src, 200, opencv.ADAPTIVE_THRESH_GAUSSIAN_C, opencv.THRESH_BINARY, 17, 16);

    let contours = new opencv.MatVector();
    let hierarchy = new opencv.Mat();

    let contours2 = new opencv.MatVector();
    let hierarchy2 = new opencv.Mat();

// You can try more different parameters
    opencv.findContours(src, contours, hierarchy, opencv.RETR_TREE, opencv.CHAIN_APPROX_SIMPLE);


    for (let i = 0; i < contours.size(); ++i) {

        // let color = new opencv.Scalar(Math.round(Math.random() * 255), Math.round(Math.random() * 255),
        //     Math.round(Math.random() * 255));

        let color = new opencv.Scalar(255, 255, 255);

        opencv.drawContours(temp, contours, i, color, 5, opencv.LINE_8, hierarchy, 100);
    }
    opencv.cvtColor(temp, temp, opencv.COLOR_RGBA2GRAY, 0);
    opencv.findContours(temp, contours2, hierarchy2, opencv.RETR_TREE, opencv.CHAIN_APPROX_SIMPLE);

    const points = []
    for (let i = 0; i < contours2.size(); ++i) {

        if ((hierarchy2.intPtr(0, i)[0] !== -1 || hierarchy2.intPtr(0, i)[1] !== -1) && hierarchy2.intPtr(0, i)[3] == 1) {
            // if (hierarchy2.intPtr(0, i)[3] == 1) {
            // console.log(hierarchy2.intPtr(0, i));
            let tt = opencv.contourArea(contours.get(i), false)
            // console.log(tt)
            if (tt > 1) {
                const ci = contours2.get(i)
                let temp = []

                for (let j = 0; j < ci.data32S.length; j += 2) {
                    let p = {}
                    p.x = ci.data32S[j]
                    p.y = ci.data32S[j + 1]
                    temp.push(p)
                }
                points.push([...temp])


                // let color = new opencv.Scalar(255, 255, 255);
                let color = new opencv.Scalar(Math.round(Math.random() * 255), Math.round(Math.random() * 255),
                    Math.round(Math.random() * 255));
                // opencv.drawContours(dst, contours2, i, color, 1, opencv.LINE_8, hierarchy2, 100);
            }

        }

    }
    contours2Marks(points)


    /*    let square_point_data = new Int32Array(contours.get(0));
        let npts = x_arr.length
        let square_points = opencv.matFromArray(npts, 1, opencv.CV_32SC2, square_point_data);
        let pts = new opencv.MatVector()
        pts.push_back (square_points);
        let color = [160, 32, 240, 0.7]
        opencv.fillPoly(tmp_mat, pts, color)

        const markersVector = new opencv.MatVector();
        markersVector.push_back(contours.get(0));

        for (let i = 0; i < contours.size(); ++i) {
            opencv.fillPoly(dst, pts=markersVector, color=0)
        }*/
    // opencv.imshow('inVis', dst);
    src.delete();
    dst.delete();
    temp.delete();

    contours.delete();
    hierarchy.delete();
    contours2.delete();
    hierarchy2.delete();

}


function contours2Marks(conts) {


    let can = document.getElementById("inVis")
    let trec = can.getBoundingClientRect()
    let tx = trec.width
    let ty = trec.height

    let tpoints = conts[0].map(d => ([d.x, d.y]))
    const tcorners = getRect(tpoints)

    // console.log(tcorners);
    // console.log(tpoints);

    for (let i = 0; i < conts.length; i++) {

        let tcan = document.createElement('canvas');
        let tcont = tcan.getContext('2d');
        const points = conts[i].map(d => ([d.x, d.y]))
        const corners = getRect(points)


        // console.log(points);

        tcan.width = corners[1][0] - corners[0][0]
        tcan.height = corners[1][1] - corners[0][1]

        tcan.style.border = "solid " + categories[selectedCategory].color + " 2px"


        let tw = corners[1][0] - corners[0][0]
        let th = corners[1][1] - corners[0][1]
        let tcat = {}

        tcat[selectedCategory] = categories[selectedCategory]

        const vectors = PCA.getEigenVectors(points)

        const angle = get_orr(vectors[0].vector, vectors[1].vector)


        let tres = {
            x: corners[0][0],
            y: corners[0][1],
            width: tw,
            height: th,
            type: "contour",
            // orr: angle,
            perimeter: [...points],
            canvas: tcan,
            // img: tcan.toDataURL("image/png"), //use of imgs for furture works -> load from json ?
            rx: corners[0][0] / tx,
            ry: corners[0][1] / ty,
            rWidth: tw / tx,
            rHeight: th / ty,
            categories: tcat,
            data: {
                orientation: {value: Math.round(angle * 100) / 100}
            }
        }

        tcont.strokeStyle = "rgba(255,255,255,0)"

        tcont.beginPath();
        tcont.moveTo(points[0][0] - corners[0][0], points[0][1] - corners[0][1]);
        for (let i = 1; i < points.length; i++) {
            tcont.lineTo(points[i][0] - corners[0][0], points[i][1] - corners[0][1]);
        }
        tcont.stroke()
        tcont.closePath();
        tcont.clip()


        tcont.drawImage(currImg,
            tres.rx * currImg.width,
            tres.ry * currImg.height,
            tres.rWidth * currImg.width,
            tres.rHeight * currImg.height,
            0,
            0,
            tw,
            th
        )


        let marks = document.getElementById("marks")

        marks.append(tcan)

        sampleData.push(tres)
    }
    fillSvg(sampleData)
}

function morphCountours(src, counts) {
    for (let i = 0; i < counts.size(); ++i) {
        opencv.fillPoly(src, pts = [counts.get(i)], color = 0)

    }
}

async function onOpenCvReady(e) {
    opencv = await cv
    // console.log(t);
}

function testClean() {
    let src = opencv.imread('modalCanvas');
    let dst = opencv.Mat.zeros(src.rows, src.cols, opencv.CV_8UC3);
    let temp = opencv.Mat.zeros(src.rows, src.cols, opencv.CV_8UC3);
    let ksize = new opencv.Size(5, 5);

    opencv.GaussianBlur(src, src, ksize, 0, 0, opencv.BORDER_DEFAULT);
    opencv.cvtColor(src, src, opencv.COLOR_RGBA2GRAY, 0);


    opencv.GaussianBlur(src, src, ksize, 0, 0, opencv.BORDER_DEFAULT);
    opencv.adaptiveThreshold(src, src, 120, opencv.ADAPTIVE_THRESH_GAUSSIAN_C, opencv.THRESH_BINARY, 13, 12);
    let contours = new opencv.MatVector();
    let hierarchy = new opencv.Mat();


    opencv.findContours(src, contours, hierarchy, opencv.RETR_TREE, opencv.CHAIN_APPROX_SIMPLE);

    for (let i = 0; i < contours.size(); ++i) {

        let color = new opencv.Scalar(Math.round(Math.random() * 255), Math.round(Math.random() * 255),
            Math.round(Math.random() * 255));

        if (hierarchy.intPtr(0, i)[0] < 1) {
            opencv.drawContours(temp, contours, i, color, 1, opencv.LINE_8, hierarchy, 100);
        }
    }

    opencv.imshow('modalCanvas', temp);


    src.delete();
    dst.delete();
    temp.delete();

    contours.delete();
    hierarchy.delete();

}

function removeColor(r, g, b, can, range = 15) {
    let lower = [inBound(b - range), inBound(g - range), inBound(r - range), 0];
    let higher = [inBound(b + range), inBound(g + range), inBound(r + range), 255];
    let src = opencv.imread(can);
    let dst = new opencv.Mat();
    let temp = opencv.Mat.zeros(src.rows, src.cols, opencv.CV_8UC3);
    let low = new opencv.Mat(src.rows, src.cols, src.type(), lower);
    let high = new opencv.Mat(src.rows, src.cols, src.type(), higher);
    opencv.inRange(src, low, high, temp);

    opencv.bitwise_not(temp, temp)
    opencv.bitwise_and(src, src, dst, mask = temp)

    // opencv.imshow('modalCanvas', src);
    opencv.imshow(can, dst);


    src.delete();
    dst.delete();
    low.delete();
    temp.delete();
    high.delete();
}

function inBound(pixel) {
    return Math.max(Math.min(pixel, 255), 0)
}

function getnDominant(n = 5) {
    let src = opencv.imread('modalCanvas');
    let criteria = (opencv.TERM_CRITERIA_EPS + opencv.TERM_CRITERIA_MAX_ITER, n, 1.0)
    opencv.KMEANS_RANDOM_CENTERS
    var labels = new opencv.Mat();
    var centers = new opencv.Mat();

    let t = opencv.kmeans(src, n, labels, criteria, n, centers)

    console.log(t);
}

//Use of  Brensenham line Algo
function getPixelsOnLine(ctx, startX, startY, endX, endY) {
    const imageData = ctx.getImageData(0, 0, ctx.canvas.width, ctx.canvas.height);
    const data = imageData.data;
    const pixelCols = [];

    const getPixel = (x, y) => {
        if (x < 0 || x >= imageData.width || y < 0 || y >= imageData.height) {
            return "rgba(0,0,0,0)";
        }
        let ind = (x + y * imageData.width) * 4;
        return [data[ind++], data[ind++], data[ind++], data[ind++] / 255];
    }

    var x = Math.floor(startX);
    var y = Math.floor(startY);
    const xx = Math.floor(endX);
    const yy = Math.floor(endY);
    const dx = Math.abs(xx - x);
    const sx = x < xx ? 1 : -1;
    const dy = -Math.abs(yy - y);
    const sy = y < yy ? 1 : -1;
    var err = dx + dy;
    var e2;
    var end = false;
    while (!end) {
        pixelCols.push(getPixel(x, y));
        if ((x === xx && y === yy)) {
            end = true;
        } else {
            e2 = 2 * err;
            if (e2 >= dy) {
                err += dy;
                x += sx;
            }
            if (e2 <= dx) {
                err += dx;
                y += sy;
            }
        }
    }
    return pixelCols;
}

function testCount() {
    let can = marks["anxiety"][6].proto.canvas

    let cont = can.getContext("2d")

    let pixels = getPixelsOnLine(cont, 0, can.height, can.width, 0)


    let colors = []
    let range = 20

    let taboo = [[0, 0, 0, 0], [250, 250, 250, 1]]

    console.log(pixels.length);

    let setcol = {}
    pixels = pixels.map(pixel => {
        if (typeof pixel === 'string') {
            let r = parseInt(pixel[5]);
            let g = parseInt(pixel[7]);
            let b = parseInt(pixel[9]);

            return [r, g, b]
        } else {
            return pixel;
        }
    }).splice(1, pixels.length - 1)

    if (pixels.length > 0) {

        setcol[pixels[0].join()] = 0
        colors.push(pixels[0]);
    }

    let tkeys = Object.keys(setcol);

    for (let i = 1; i < pixels.length; i++) {

        // if (!taboo.includes(pixels[i])) {

        if (!tkeys.includes(pixels[i].join())) {
            let breaked = false
            for (let j = 0; j < colors.length; j++) {
                if (deltaE(pixels[i], colors[j]) < 12) {

                    setcol[colors[j].join()]++
                    tkeys = Object.keys(setcol);
                    breaked = true
                    break
                }
            }
            if (!breaked) {
                setcol[pixels[i].join()] = 0
                tkeys = Object.keys(setcol);
                colors.push(pixels[i]);
            }
        } else {
            setcol[pixels[i].join()]++
        }


    }

    delete setcol["0,0,0,0"]
    delete setcol["0,0,0"]

    console.log(colors);
    console.log(setcol);

}


function deltaE(rgbA, rgbB) {
    let labA = rgb2lab(rgbA);
    let labB = rgb2lab(rgbB);

    let deltaL = labA[0] - labB[0];
    let deltaA = labA[1] - labB[1];
    let deltaB = labA[2] - labB[2];
    let c1 = Math.sqrt(labA[1] * labA[1] + labA[2] * labA[2]);
    let c2 = Math.sqrt(labB[1] * labB[1] + labB[2] * labB[2]);
    let deltaC = c1 - c2;
    let deltaH = deltaA * deltaA + deltaB * deltaB - deltaC * deltaC;
    deltaH = deltaH < 0 ? 0 : Math.sqrt(deltaH);
    let sc = 1.0 + 0.045 * c1;
    let sh = 1.0 + 0.015 * c1;
    let deltaLKlsl = deltaL / (1.0);
    let deltaCkcsc = deltaC / (sc);
    let deltaHkhsh = deltaH / (sh);
    let i = deltaLKlsl * deltaLKlsl + deltaCkcsc * deltaCkcsc + deltaHkhsh * deltaHkhsh;
    return i < 0 ? 0 : Math.sqrt(i);
}

function rgb2lab(rgb) {
    let r = rgb[0] / 255, g = rgb[1] / 255, b = rgb[2] / 255, x, y, z;
    r = (r > 0.04045) ? Math.pow((r + 0.055) / 1.055, 2.4) : r / 12.92;
    g = (g > 0.04045) ? Math.pow((g + 0.055) / 1.055, 2.4) : g / 12.92;
    b = (b > 0.04045) ? Math.pow((b + 0.055) / 1.055, 2.4) : b / 12.92;
    x = (r * 0.4124 + g * 0.3576 + b * 0.1805) / 0.95047;
    y = (r * 0.2126 + g * 0.7152 + b * 0.0722) / 1.00000;
    z = (r * 0.0193 + g * 0.1192 + b * 0.9505) / 1.08883;
    x = (x > 0.008856) ? Math.pow(x, 1 / 3) : (7.787 * x) + 16 / 116;
    y = (y > 0.008856) ? Math.pow(y, 1 / 3) : (7.787 * y) + 16 / 116;
    z = (z > 0.008856) ? Math.pow(z, 1 / 3) : (7.787 * z) + 16 / 116;
    return [(116 * y) - 16, 500 * (x - y), 200 * (y - z)]
}

// c1 in c2+range
function pixelInRange(c1, c2, range) {

    let res = [false, false, false]
    //skip alpha stuff
    for (let i = 0; i < c1.length - 1; i++) {
        if (c1[i] > c2[i] - range && c1[i] < c2[i] + range) {
            res[i] = true;
        } else {
            return false;
        }

    }
    return true
}


function getBBox(canvas) {
    let src = opencv.imread(canvas);

    let dst = opencv.Mat.zeros(src.rows, src.cols, opencv.CV_8UC3);
    let temp = opencv.Mat.zeros(src.rows, src.cols, opencv.CV_8UC3);
    opencv.cvtColor(src, src, opencv.COLOR_RGBA2GRAY, 0);
    let ksize = new opencv.Size(5, 5);

    opencv.GaussianBlur(src, src, ksize, 0, 0, opencv.BORDER_DEFAULT);

    opencv.adaptiveThreshold(src, src, 200, opencv.ADAPTIVE_THRESH_GAUSSIAN_C, opencv.THRESH_BINARY, 17, 16);

    let contours = new opencv.MatVector();
    let hierarchy = new opencv.Mat();

    let contours2 = new opencv.MatVector();
    let hierarchy2 = new opencv.Mat();

// You can try more different parameters
    opencv.findContours(src, contours, hierarchy, opencv.RETR_TREE, opencv.CHAIN_APPROX_SIMPLE);


    for (let i = 0; i < contours.size(); ++i) {

        // let color = new opencv.Scalar(Math.round(Math.random() * 255), Math.round(Math.random() * 255),
        //     Math.round(Math.random() * 255));

        let color = new opencv.Scalar(255, 255, 255);

        opencv.drawContours(temp, contours, i, color, 14, opencv.LINE_8, hierarchy, 100);
    }
    opencv.cvtColor(temp, temp, opencv.COLOR_RGBA2GRAY, 0);
    opencv.findContours(temp, contours2, hierarchy2, opencv.RETR_TREE, opencv.CHAIN_APPROX_SIMPLE);

    const points = []
    for (let i = 0; i < contours2.size(); ++i) {
        hierarchy2
        if (hierarchy2.intPtr(0, i)[3] > 0) {

            let tt = opencv.contourArea(contours.get(i), false)

            if (tt > 1) {
                const ci = contours2.get(i)
                let temp = []

                for (let j = 0; j < ci.data32S.length; j += 2) {
                    let p = {}
                    p.x = ci.data32S[j]
                    p.y = ci.data32S[j + 1]
                    temp.push(p)
                }
                points.push([...temp])


                // let color = new opencv.Scalar(255, 255, 255);
                let color = new opencv.Scalar(Math.round(Math.random() * 255), Math.round(Math.random() * 255),
                    Math.round(Math.random() * 255));
                opencv.drawContours(dst, contours2, i, color, 1, opencv.LINE_8, hierarchy2, 100);
            }

        }

    }

    src.delete();
    dst.delete();
    temp.delete();

    contours.delete();
    hierarchy.delete();
    contours2.delete();
    hierarchy2.delete();

    // If there is multiple contours we mix to make the biggest BBox
    let corners = [[undefined, undefined], [undefined, undefined]]
    for (let i = 0; i < points.length; i++) {
        const tpoints = points[i].map(d => ([d.x, d.y]))
        const tcorners = getRect(tpoints)

        for (let j = 0; j < corners.length; j++) {
            for (let k = 0; k < corners.length; k++) {

                if (corners[j][k] === undefined) {
                    corners[j][k] = tcorners[j][k]
                } else if (j === 0) {
                    if (corners[j][k] > tcorners[j][k]) {
                        corners[j][k] = tcorners[j][k]
                    }
                    if (corners[j][k] > tcorners[j][k]) {
                        corners[j][k] = tcorners[j][k]
                    }
                } else if (j === 1) {
                    if (corners[j][k] < tcorners[j][k]) {
                        corners[j][k] = tcorners[j][k]
                    }
                    if (corners[j][k] < tcorners[j][k]) {
                        corners[j][k] = tcorners[j][k]
                    }
                }
            }
        }
    }
    return corners
}

function toColor(canvas, r, g, b, threshold) {

    let src = opencv.imread(canvas);
    let temp2 = opencv.Mat.ones(src.rows, src.cols, opencv.CV_8UC3);

    let res = document.createElement("canvas")
    res.width = canvas.width
    res.height = canvas.height


    let color = new opencv.Scalar(r, g, b, 255)
    let white = new opencv.Scalar(255, 255, 255, 255)


    temp2.setTo(white)

    let lower = [10, 10, 10, 255]
    let higher = [threshold, threshold, threshold, threshold]

    opencv.cvtColor(src, src, opencv.COLOR_RGBA2RGB, 3);
    opencv.cvtColor(src, src, opencv.COLOR_RGB2GRAY, 3);


    let low = new opencv.Mat(src.rows, src.cols, src.type(), lower);
    let high = new opencv.Mat(src.rows, src.cols, src.type(), higher);

    opencv.inRange(src, low, high, src);

    opencv.cvtColor(temp2, temp2, opencv.COLOR_RGB2RGBA, 4);

    // let M = opencv.Mat.ones(2, 2, cv.CV_8U);
    // let p = new opencv.Point(-1, -1)
    // opencv.dilate(src, src, M, p, 1, opencv.BORDER_CONSTANT, opencv.morphologyDefaultBorderValue());

    temp2.setTo(color, src)

    opencv.imshow(res, temp2);

    src.delete();
    // M.delete();
    temp2.delete();
    // color.delete();
    // low.delete();
    // high.delete();

    return res

}