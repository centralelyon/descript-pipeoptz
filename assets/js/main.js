let currImg;
let tsaveim
let viewDim = []
let sampleData = []
const totalExamples = 52
let categories = {
    default: {
        name: "default",
        color: "#504545"
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
const urlParams = new URLSearchParams(window.location.search);
let opencv = null

let selectedMark = null
let dragMod = false
let rotateMod = false
let dataEncoding = {}
let examples = [
    "assets/images/tempExamples/cholera.png",
    "assets/images/tempExamples/xrousse.png",
    // "assets/images/tempExamples/goodbye.png",
    // "assets/images/tempExamples/buy.png",
    // "assets/images/tempExamples/laugh.png",
    // "assets/images/tempExamples/doors.jpg",
]
const url_templates = [["https://dataroom.liris.cnrs.fr/vizvid/dear_data_images/Giorgia_DearData_", "_Front.jpg"],
    ["https://dataroom.liris.cnrs.fr/vizvid/dear_data_images/Stefanie_DearData_", "+front.jpg"]]

// https://dataroom.liris.cnrs.fr/vizvid/dear_data_images/Stefanie_DearData_19%2Bfront.jpg
let globalPalettes = {}
const fakePalettesBase = "assets/tempData/"
// const fakePalettes = ["palette_anxiety.json", "palette_stem.json", "palette_you.json", "palette_wrong.json"]
const fakePalettes = []


docReady(init)


const dataRef = {
    giorgia_36: "assets/images/tempLoad/full.json"
}


function loadExamples(week = 0, author = "giorgia") {

    const container = document.getElementById('selFlat');

    for (let i = 0; i < examples.length; i++) {
        const el = document.createElement("div");
        el.style.backgroundImage = "url('" + examples[i] + "')";
        el.setAttribute('type', "example");
        el.setAttribute('value', i);
        el.onclick = loadEx
        container.appendChild(el);

    }


    let authorRef = author === "giorgia" ? 0 : 1;
    /*    for (let i = 0; i < 1; i++) {
            const el = document.createElement("div");
            el.style.backgroundImage = "url('" + examples[i] + "')";
            el.setAttribute('value', i);
            el.setAttribute('type', "data");

            el.onclick = loadEx
            container.appendChild(el);
        }*/
    for (let i = 1; i < totalExamples; i++) {
        let num = i

        if (num < 10) {
            num = "0" + num
        }

        for (let j = 0; j < url_templates.length; j++) {
            const t = encodeURI(url_templates[j][0] + num + url_templates[j][1]);
            // (url_templates[j][0] , num , url_templates[j][1])
            const el = document.createElement("div");
            el.style.backgroundImage = "url('" + t + "')";
            el.setAttribute('value', num);
            el.setAttribute('template', j);
            el.setAttribute('type', "url");

            el.onclick = loadEx
            container.appendChild(el);

            if (num == week && j === authorRef) {
                el.scrollIntoView()
                el.classList.add("selectedIm");
            }
        }
    }
}

async function loadEx() {

    clearExamples()
    this.classList.add("selectedIm");
    const type = this.getAttribute("type")
    purge()
    if (type === "data") {
        loadImg(examples[this.getAttribute("value")])
    } else if (type === "url") {
        let i = this.getAttribute("value")
        let j = this.getAttribute("template")
        let author = j == 0 ? "giorgia" : "stefanie"
        loadImg(encodeURI(url_templates[j][0] + i + url_templates[j][1]))
        if (dataRef[author + "_" + i]) {
            let json = await getData(dataRef[author + "_" + i])
            importData(json);
        }
    } else if (type === "example") {
        loadImg(examples[this.getAttribute("value")])
    }
}

async function init() {
    // loadImg("assets/images/tempLoad/dearDat.png")
    // fillAllPalette()
    let week = null
    let author = null
    let type = null
    if (urlParams.has("week"))
        week = urlParams.get("week").toLowerCase()

    if (urlParams.has("author"))
        author = urlParams.get("author").toLowerCase()
    if (urlParams.has("type"))
        type = urlParams.get("type").toLowerCase()

    type = (type === null ? "deardata" : type)
    if (type === "deardata") {  //Default to lollipops
        week = (week === null ? 36 : week.length === 1 ? "0" + week : week)
        author = (author === null ? "giorgia" : author)
    }
    let authorRef = author === "giorgia" ? 0 : 1;
    loadExamples(week);

    if (dataRef[author + "_" + week]) {
        let json = await getData(dataRef[author + "_" + week])
        importData(json);
    } else {
        let url = ""
        if (type === "deardata") {
            url = url_templates[authorRef][0] + week + url_templates[authorRef][1]
        }
        loadImg(url)
    }

    switchMode("rect")
    document.getElementById("jsonLoader").addEventListener("change", importFromJson);
    document.getElementById("imgLoader").addEventListener("change", importImg);
    document.getElementById("paletteLoader").addEventListener("change", importPalette);


}

async function getData(url) {

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
        if (sample.categories[category]) {
            return true;
        } else {
            return false
        }
    })
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
        fillPalette([0, 10], false)
    }
}


function displayCat(category) {
    console.log(category);
    document.getElementById("catMod").style.display = "block";

    fillCatMod(categories[category]);
}

function fillCatMod(category) {
    let cont = document.getElementById("catModTable");

    cont.innerHTML = "<tr><th>Name</th><td><input type='text' id='modalCatName' placeholder='" + category.name + "' style='width: 100%;margin: 0;height: 30px' value='" + category.name + "'></td></tr>" +
        "<tr><th>Color</th><td><input type='color' id='modalColor' value='" + category.color + "'> </td></tr>"
    // "<tr><td></td><td></td></tr>

    document.getElementById("modalColor").addEventListener('input', (e) => {
        const val = document.getElementById("modalColor").value;
        categories[selectedCategory].color = val;
        // console.log(val);
    })

    document.getElementById("modalCatName").addEventListener('input', (e) => {
        const val = document.getElementById("modalCatName").value.replace(/ /g, "");

        if (val !== "")
            categories[selectedCategory].name = val;
        // console.log(val);
    })


    if (category.prototype) {

        let proto = document.getElementById("catProtoCanvas");
        let proto_cont = proto.getContext("2d")

        proto_cont.clearRect(0, 0, proto.width, proto.height)

        proto_cont.drawImage(category.prototype.canvas, 0, 0, proto.width, proto.height)

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
        } else if (el.matches(".category img")) {
            parent = el.parentNode;
            displayCat(parent.getAttribute("value"))

        }

        if (parent !== null) {

            document.getElementById("selectedCat").removeAttribute("id")
            parent.setAttribute("id", "selectedCat");
            selectedCategory = parent.getAttribute("value");


            if (seldots !== undefined) {
                for (let i = 0; i < seldots.length; i++) {
                    seldots[i].categories[selectedCategory] = categories[selectedCategory]
                }

                seldots = undefined;
                over_on = true
                d3.select("#lasso").remove();
                drawImage()

            }
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
            let samples = getSamplesFromCategory(parent.getAttribute("value"))
            if (samples !== []) {
                drawSamples(samples);
            }
        }
    });

    document.getElementById("catContainer").addEventListener('mouseout', (e) => {

        resetImg()
    });

    document.getElementById("marks").addEventListener('mouseout', (e) => {
        resetImg()
    });

    document.getElementById("svgControl").addEventListener('click', (e) => {

        let el = e.target

        if (el.matches('img')) {
            el = el.parentNode
            document.getElementById("selectedButton3").removeAttribute("id")
            el.setAttribute("id", "selectedButton3")

        }
    });
});


//-----------------------------------------------------------

onkeyup = function (e) {
    if (e.keyCode in keymap) {
        keymap[e.keyCode] = false;

        if (e.keyCode == 16) {
            dragMod = false
            let svg = d3.select("#svgDisplay")
            svg.selectAll("image").style("cursor", "pointer")
        }

        if (e.keyCode == 18) {
            rotateMod = false
        }
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
            fillPalette()
        }

        if (document.activeElement === document.getElementById("dataInpVal")) {
            let tval = document.getElementById("dataInpVal").value
            const tsel = document.getElementById("dataInpVal").getAttribute("key")

            if (tval === null)
                tval = ""

            tval = tval.replace(/[^0-9.-]/g, '')

            if (tval !== "") {

                selectedMark.data[tsel].value = parseFloat(tval)
                fillInfos(selectedMark)
                fillPalette()
            }


        }
    }

    if (keymap[16]) {
        dragMod = true
        let svg = d3.select("#svgDisplay")
        svg.selectAll("image").style("cursor", "grab")
    }

    if (keymap[18]) {
        rotateMod = true
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

        if (document.activeElement === document.getElementById("markMod")) {
            selectedMark = undefined
        }

        document.getElementById("catMod").style.display = "none"

        seldots = undefined;
        over_on = true
        d3.select("#lasso").remove();
        drawImage()
    }

    if (keymap[46]) {

        for (let i = 0; i < seldots.length; i++) {

            let id = sampleData.indexOf(seldots[i])
            sampleData.splice(id, 1)
        }
        updateChart(curr_mod, seldots)
        seldots = undefined;
        over_on = true


    }

    if (keymap[37]) {
        if (selectedMark)
            switchMark("prev")
    }
    if (keymap[39]) {
        if (selectedMark)
            switchMark("next")
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
        // marks[i].canvas.style.border = "solid " + marks[i].categories.color + " 2px"
        container.appendChild(marks[i].canvas);
    }
}


function updateCategories() {
    // document.querySelector(".category").remove();

    let first = true
    for (const [key, value] of Object.entries(categories)) {
        drawCat(key, value.color, first)
        first = false
    }
}


function export2json() {

    let tdat = []

    for (let i = 0; i < sampleData.length; i++) {
        const tobj = {...sampleData[i]}
        tobj.canvas = tobj.canvas.toDataURL("image/png")
        if (tobj.data) {

            for (const [key, value] of Object.entries(tobj.data)) {

                const tval = {...value}
                if (tval?.proto?.canvas) {
                    tval.proto.canvas = tval.proto.canvas.toDataURL("image/png")
                }
                tobj[key] = tval

            }
        }
        tdat.push(tobj)
    }

    const canvas = document.createElement('canvas');

    canvas.width = currImg.width;
    canvas.height = currImg.height;

    let t = document.getElementById("inVis")
    // let cont = canvas.getContext("2d")
    // cont.drawImage(currImg, 0, 0);
    //todo: FIX WHY USING CURRIMG IS NOT WORKING ?!

    let tmarks = {}
    for (const [key, value] of Object.entries(marks)) {
        tmarks[key] = {}
        let cloneVal = {...value}
        for (const [key2, value2] of Object.entries(cloneVal)) {

            let tval = {...value2}
            if (tval?.proto?.canvas) {
                if (typeof tval?.proto?.canvas !== "string")
                    tval.proto.canvas = tval.proto.canvas.toDataURL("image/png")
            }
            tmarks[key][key2] = tval
        }
    }


    let tcat = {}
    for (const [key, value] of Object.entries(palette_cat)) {
        tcat[key] = {}

        let tval = {...value}
        if (tval?.proto?.canvas)
            tval.proto.canvas = tval.proto.canvas.toDataURL("image/png")
        tcat[key] = tval
    }

    let tcat2 = {}
    for (const [key, value] of Object.entries(categories)) {
        tcat2[key] = {}

        let tval = {...value}
        if (tval?.prototype?.canvas)
            tval.prototype.canvas = tval.prototype.canvas.toDataURL("image/png")
        tcat2[key] = tval
    }


    let tprim = {}
    for (const [key, value] of Object.entries(primitive)) {
        tprim[key] = {}

        let tval = {...value}
        if (tval?.proto?.canvas) {
            if (typeof tval?.proto?.canvas !== "string") {
                tval.proto.canvas = tval.proto.canvas.toDataURL("image/png")
            }
        }

        tprim[key] = tval
    }

    let tanchor = {}
    for (const [key, value] of Object.entries(global_anchors)) {
        tanchor[key] = {}

        let tval = {...value}

        tanchor[key] = tval
    }

    let palette = {
        categories: tcat,
        marks: tmarks,
        primitive: tprim,
        anchors: tanchor
    }

    const tempData = {

        categories: categories,
        // background: canvas.toDataURL("image/png"),
        background: t.toDataURL("image/png"),
        marks: tdat,
        palette: palette
    }
    download(JSON.stringify(tempData), "descript.json", "text/json");
}

function importFromJson(e) {

    const reader = new FileReader();

    reader.onload = function (e) {
        let jsonObj = JSON.parse(e.target.result);

        // jsonObj.palette.primitive = {}
        // delete jsonObj.categories.time.prototype

        importData(jsonObj).then(fillTable );

        // fillTable()
        // console.log(jsonObj)
    }
    reader.readAsText(e.target.files[0]);
}


function fakeFile(name) {
    document.getElementById(name).click()
}


async function importData(data) {
    // purge()
    const tempData = data;


    let toDel = []
    for (let i = 0; i < tempData["marks"].length; i++) {
        // console.log("waiting mark ", i);
        if (tempData["marks"][i].canvas.length > 50) {
            tempData["marks"][i].canvas = await convertToCanvas(tempData["marks"][i].canvas)
        } else {
            toDel.push(tempData["marks"][i])
        }
        if (tempData["marks"][i].data) {
            for (const [key, value] of Object.entries(tempData["marks"][i].data)) {
                if (value.proto) {
                    value.proto.canvas = await convertToCanvas(value.proto.canvas)
                }
            }
        }

    }
    console.log(toDel);
    for (let i = 0; i < toDel.length; i++) {
        let id = tempData["marks"].indexOf(toDel[i]);
        console.log(id);
        if (id > -1) {
            tempData["marks"].splice(id, 1)
        }
    }
    for (const [key, value] of Object.entries(tempData["categories"])) {
        if (value.prototype) {
            value.prototype.canvas = await convertToCanvas(value.prototype.canvas)
            // value.prototype.canvas = await convertToCanvas(tempData["palette"]["categories"][key]["proto"]["canvas"])
        }
    }

    for (const [key, value] of Object.entries(tempData["palette"]["categories"])) {
        if (value.proto) {
            value.proto.canvas = await convertToCanvas(value.proto.canvas)
        }
    }

    for (const [key, tval] of Object.entries(tempData["palette"]["marks"])) {
        for (const [key, value] of Object.entries(tval)) {
            if (value.proto) {
                value.proto.canvas = await convertToCanvas(value.proto.canvas)
            }
        }
    }


    sampleData = tempData["marks"];
    categories = tempData["categories"];
    palette_cat = tempData["palette"]["categories"];
    primitive = tempData["palette"]["primitive"];
    marks = tempData["palette"]["marks"];


    document.querySelectorAll(".category").forEach((item) => {
        // if (item.getAttribute("value") !== "default") {
        item.remove()
        // }
    })


    loadImg(tempData.background)

    // let im = document.getElementById("tester")
    // im.src = tempData.background
    console.log(sampleData);

    updateCategories()
    updateMarks("size")
    fillPalette()
    populateSelect()
    fillTable()

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

    newCat.innerHTML = "<div class='lightBorder catColor' style='background-color: " + color + "'> </div> <p>" + name + "</p><img src=\"assets/images/buttons/edit.png\" class=\"editCat\">"
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

//todo:
document.onpaste = (evt) => {
    const dT = evt.clipboardData || window.clipboardData;
    const file = dT.files[0];

    if (file !== undefined) {
        if (file.type === "image/png" || file.type === "image/jpeg") {
            const reader = new FileReader();

            reader.onload = function (e) {

                // currImg = e.target.result;

                // purge()
                // loadImg(file);
                loadImg(e.target.result)
                // console.log(currImg);
                switchMode("rect")
                clearExamples()
                purge()

            }
            reader.readAsDataURL(file);
        } else {
            console.log(file);
        }
    }
};

function getImgUrl() {
    let tval = document.getElementById("imgUrl").value;

    purge()
    clearExamples()
    loadImg(tval)
}


function purge() {
    currImg = null;

    sampleData = []
    palette_cat = {}
    marks = {}
    primitive = {}

    categories = {
        default: {
            name: "default",
            color: "#414141FF"
        }
    }
    selectedCategory = "default";

    mouseDown = 0
    origin = null;

    strokePoint = [];
    stroke = [];

    selectedMark = null
    updateMarks("size")
    document.querySelectorAll(".category").forEach((item) => {
        // if (item.getAttribute("value") !== "default") {
        item.remove()
        // }
    })
    updateCategories()

    const svg = d3.select('#svgDisplay');
    svg.selectAll("image").remove();
    document.getElementById("paletteCont").innerHTML = "";
    populateSelect()
    fillTable()
}

function clearExamples() {
    const el = document.querySelector(".selectedIm")

    if (el !== null) {
        el.classList.remove("selectedIm");
    }

}


docReady(function () {
    document.getElementById("closeCatMod").addEventListener('click', (e) => {
        const dialog = document.getElementById("catMod");
        dialog.style.display = "none";
        document.querySelectorAll(".category").forEach((item) => {
            // if (item.getAttribute("value") !== "default") {
            item.remove()
            // }
        })
        updateCategories()
    })
})


async function fillAllPalette() {


    let tdat = []


    for (let i = 0; i < fakePalettes.length; i++) {
        let t = await getData(fakePalettesBase + fakePalettes[i])

        tdat.push(t)
    }

    console.log(tdat);


    for (let i = 0; i < tdat.length; i++) {
        let tname = tdat[i].name
        if (globalPalettes[tname]) {
            tname += "_" + i
        }

        if (tdat[i].data) {
            for (const [name, value] of Object.entries(tdat[i].data)) {
                if (value.proto) {
                    value.proto.canvas = await convertToCanvas(value.proto.canvas)
                }
            }
        }

        if (tdat[i].proto) {
            tdat[i].proto.canvas = await convertToCanvas(tdat[i].proto.canvas)
        }

        let tcan = document.createElement("canvas");

        tdat[i].globalPaletteCanvas = tcan
        tcan.width = 78
        tcan.height = 78


    }

}