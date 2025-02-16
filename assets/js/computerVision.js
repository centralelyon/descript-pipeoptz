function testEdge() {
    let src = opencv.imread('inVis');

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
                orientation: Math.round(angle * 100) / 100
            }
        }


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