let currImg;
let origin = null;

let sampleData = []
let keymap = {}
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
let strokePoint = [];
let stroke = [];


loadImg("assets/images/tempLoad/dearDat.png")
docReady(initSampler)

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
        category: categories[selectedCategory]
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
        let newCat = document.createElement("div");

        name = name.replace(/ /g, "_")
        categories[name] = {
            name: name,
            color: catColors[Object.keys(categories).length % catColors.length], //TODO: computational heavy
        }
        newCat.className = "category";
        newCat.setAttribute("value", name);

        newCat.innerHTML = "<div class='lightBorder catColor' style='background-color: " + categories[name].color + "'> </div> <p>" + name + "</p>"
        document.getElementById("catContainer").insertBefore(newCat, document.getElementById("addCat"))
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
    let marks = sortMarks([...sampleData], type
    )

    container.innerHTML = "";


    for (let i = 0; i < marks.length; i++) {
        container.appendChild(marks[i].canvas);
    }
}