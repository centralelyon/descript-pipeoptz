let currImg;

let sampleData = []

let categories = {
    default: {
        name: "default",
        color: "414141FF"
    }
}
let selectedCategory = "default";
//use of Tableau10
let catColors = ["#4e79a7", "#f28e2c", "#e15759", "#76b7b2", "#59a14f", "#edc949", "#af7aa1", "#ff9da7", "#9c755f", "#bab0ab"]


let mouseDown = 0
let origin = null;
let keymap = {}
let strokePoint = [];
let stroke = [];

let selectedMark = null


docReady(init)


async function init() {
    // loadImg("assets/images/tempLoad/dearDat.png")

    let json = await getData()

    importData(json);

    switchMode("rect")
    document.getElementById("jsonLoader").addEventListener("change", importFromJson);

}

async function getData() {
    const url = "assets/images/tempLoad/bluesandblacks.json";
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Response status: ${response.status}`);
        }

        return await response.json();

    } catch (error) {
        return error
    }
}


function getSamplesFromCategory(category) {
    return sampleData.filter(sample => {
        return sample.category.name === category;
    })
}

function addRectSample(x, y, width, height) {


    let coords = curateCoordinates(x, y, width, height);


    let can = document.getElementById("inVis")
    let trec = can.getBoundingClientRect()
    let tx = trec.width
    let ty = trec.height


    let tcan = document.createElement('canvas');
    let tcont = tcan.getContext('2d');


    tcan.width = coords[2]
    tcan.height = coords[3]

    tcan.style.border = "solid " + categories[selectedCategory].color + " 2px"
    tcont.drawImage(can, ...coords, 0, 0, coords[2], coords[3])


    let tres = {
        x: coords[0],
        y: coords[1],
        width: coords[2],
        height: coords[3],
        type: "rect",
        canvas: tcan,
        // img: tcan.toDataURL("image/png"), //use of imgs for furture works -> load from json ?
        rx: coords[0] / tx,
        ry: coords[1] / ty,
        rWidth: coords[2] / tx,
        rHeight: coords[3] / ty,
        category: categories[selectedCategory],
        data: {}
    }


    let marks = document.getElementById("marks")

    marks.append(tcan)

    sampleData.push(tres)
}


function curateCoordinates(x, y, width, height) {

    if (width < 0) {
        width = Math.abs(width)
        x = Math.max(x - width, 0)
    }

    if (height < 0) {
        height = Math.abs(height)
        y = Math.max(y - height, 0)
    }

    return [x, y, width, height]
}


function switchSampleSelect(e, type) {
    document.getElementById("selectedButton").removeAttribute("id")

    e.setAttribute("id", "selectedButton")
    switchMode(type)

}

function addCategory() {

    let name = document.getElementById("textCat").value

    if (name !== "") {
        document.getElementById("textCat").value = ""

        name = name.replace(/ /g, "_")
        categories[name] = {
            name: name,
            color: catColors[Object.keys(categories).length % catColors.length], //TODO: computational heavy
        }

        drawCat(name, categories[name].color, true)
    }
}

function docReady(fn) {
    // see if DOM is already available
    if (document.readyState === "complete" || document.readyState === "interactive") {
        // call on next available tick
        setTimeout(fn, 1);
    } else {
        document.addEventListener("DOMContentLoaded", fn);
    }
}


docReady(function () {
    document.getElementById("catContainer").addEventListener('click', (e) => {

        const el = e.target;
        let parent = null;

        if (el.matches(".category")) {
            parent = el
        } else if (el.matches(".category p, .category div")) {
            parent = el.parentNode;
        }

        if (parent !== null) {
            document.getElementById("selectedCat").removeAttribute("id")
            parent.setAttribute("id", "selectedCat");
            selectedCategory = parent.getAttribute("value");
        }

    });


    document.getElementById("catContainer").addEventListener('mouseover', (e) => {

        const el = e.target;
        let parent = null;

        if (el.matches(".category")) {
            parent = el
        } else if (el.matches(".category p, .category div")) {
            parent = el.parentNode;
        }

        if (parent !== null) {
            drawSamples(getSamplesFromCategory(parent.getAttribute("value")));
        }

    });

    document.getElementById("catContainer").addEventListener('mouseout', (e) => {

        const el = e.target;
        let parent = null;

        if (el.matches(".category")) {
            parent = el
        } else if (el.matches(".category p, .category div")) {
            parent = el.parentNode;
        }

        if (parent !== null) {
            // drawSamples([])
            resetImg()
        }
    });
});


//-----------------------------------------------------------

onkeyup = function (e) {
    if (e.keyCode in keymap) {
        keymap[e.keyCode] = false;
    }
};

onkeydown = function (e) {
    e = e || event;
    keymap[e.keyCode] = e.type === 'keydown';

    if (keymap[13]) {
        if (document.activeElement === document.getElementById("textCat")) {
            addCategory()
        }

        if (document.activeElement === document.getElementById("dataInp")) {
            let tkey = document.getElementById("dataInp").value

            const tsel = document.getElementById("dataInp").getAttribute("key")

            if (tkey === null) {
                tkey = tsel
            }

            tkey.replace(/ /g, "_")
            const tval = selectedMark.data[tsel]


            delete selectedMark.data[tsel]
            selectedMark.data[tkey] = tval

            if (selectedInfo === tsel)
                selectedInfo = tkey

            fillInfos(selectedMark)
        }

        if (document.activeElement === document.getElementById("dataInpVal")) {
            let tval = document.getElementById("dataInpVal").value
            const tsel = document.getElementById("dataInpVal").getAttribute("key")

            if (tval === null)
                tval = ""

            tval = tval.replace(/[^0-9]/g, '')

            if (tval !== "") {

                selectedMark.data[tsel] = tval
                fillInfos(selectedMark)
            }


        }
    }

    if (keymap[27]) {

        if (document.activeElement === document.getElementById("dataInp")) {
            e.preventDefault()
            fillInfos(selectedMark)

        }

        if (document.activeElement === document.getElementById("dataInpVal")) {
            e.preventDefault()
            fillInfos(selectedMark)
        }
    }
}


function sortMarks(marks, type) {

    if (type === "category") {

        let t = Object.groupBy(marks, ({category}) => category.name)
        let temp = []

        for (const [key, value] of Object.entries(t)) {
            temp = temp.concat(value)
        }

        return temp

    } else if (type === "size") {

        return marks.sort((a, b) => (a.width * a.height) - (b.width * b.height));
    }

}

function updateMarks(type) {

    let container = document.getElementById("marks");
    let marks = sortMarks([...sampleData], type)

    container.innerHTML = "";
    for (let i = 0; i < marks.length; i++) {
        marks[i].canvas.style.border = "solid " + marks[i].category.color + " 2px"
        container.appendChild(marks[i].canvas);
    }
}


function updateCategories() {
    document.querySelector(".category").remove();

    let first = true
    for (const [key, value] of Object.entries(categories)) {
        drawCat(key, value.color, first)
        first = false
    }
}


function export2json() {

    // let tdat = [...sampleData]; //TODO: Copy without reference

    // let tdat = sampleData.map(d => window.structuredClone(d))

    let tdat = []

    for (let i = 0; i < sampleData.length; i++) {
        const tobj = {...sampleData[i]}
        tobj.canvas = tobj.canvas.toDataURL("image/png")

    }

    const canvas = document.createElement('canvas');

    canvas.width = currImg.width;
    canvas.height = currImg.height;

    let t = document.getElementById("inVis")
    let cont = canvas.getContext("2d")

    cont.drawImage(currImg, 0, 0);

    //todo: FIX WHY USING CURRIMG IS NOT WORKING ?!
    const tempData = {
        categories: categories,
        // background: canvas.toDataURL("image/png"),
        background: t.toDataURL("image/png"),
        marks: tdat
    }
    download(JSON.stringify(tempData), "descript.json", "text/json");
}

function importFromJson(e) {

    const reader = new FileReader();

    reader.onload = function (e) {
        let jsonObj = JSON.parse(e.target.result);
        importData(jsonObj);
        // console.log(jsonObj)
    }
    reader.readAsText(e.target.files[0]);
}


function fakeFile() {
    document.getElementById("jsonLoader").click()
}


async function importData(data) {

    const tempData = data;

    for (let i = 0; i < tempData["marks"].length; i++) {
        tempData["marks"][i].canvas = await convertToCanvas(tempData["marks"][i].canvas)
    }

    sampleData = tempData["marks"];
    categories = tempData["categories"];

    loadImg(tempData.background)

    // let im = document.getElementById("tester")
    // im.src = tempData.background

    updateCategories()
    updateMarks("category")
}

function drawCat(name, color, selected = false) {
    let newCat = document.createElement("div");
    if (selected) {
        selectedCategory = name
        let t = document.getElementById("selectedCat")
        if (t !== null) {
            t.removeAttribute("id")
        }

        newCat.setAttribute("id", "selectedCat");

    }
    newCat.className = "category";
    newCat.setAttribute("value", name);

    newCat.innerHTML = "<div class='lightBorder catColor' style='background-color: " + color + "'> </div> <p>" + name + "</p>"
    document.getElementById("catContainer").insertBefore(newCat, document.getElementById("addCat"))

}

function download(content, fileName, contentType) {
    const a = document.createElement("a");
    const file = new Blob([content], {type: contentType});
    a.href = URL.createObjectURL(file);
    a.download = fileName;
    a.click();
    URL.revokeObjectURL(a)
}

async function convertToCanvas(url) {
    const can = document.createElement('canvas');
    const cont = can.getContext('2d');
    const img = new Image;

    await new Promise(r => img.onload = r, img.src = url);

    can.width = img.naturalWidth;
    can.height = img.naturalHeight;
    cont.drawImage(img, 0, 0);

    return can
}