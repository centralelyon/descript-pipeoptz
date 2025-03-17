let theaders = []

function fillTable() {

    let t = getOptionalHeaders()

    let datas = t[0]
    let catas = t[1]

    let tableHeader = document.getElementById("tableHeader")
    let tableContainer = document.getElementById("datatable")

    let data_mess = ""
    for (let i = 0; i < datas.length; i++) {
        data_mess += "<th>" + datas[i] + "</th>"
    }

    let cata_mess = ""
    for (let i = 0; i < catas.length; i++) {
        cata_mess += "<th>" + catas[i] + "</th>"
    }

    tableHeader.innerHTML = "" +
        "<th>Id</th>" +
        "<th>x</th>" +
        "<th>y</th>" +
        "<th>width</th>" +
        "<th>height</th>" +
        cata_mess +
        data_mess


    for (let i = 0; i < sampleData.length; i++) {
        let trow = document.createElement("tr");
        let tmess = "<td>" + i + "</td>" +
            "<td>" + sampleData[i].x + "</td>" +
            "<td>" + sampleData[i].y + "</td>" +
            "<td>" + sampleData[i].width + "</td>" +
            "<td>" + sampleData[i].height + "</td>"


        for (let j = 0; j < catas.length; j++) {
            if (sampleData[i].categories[catas[j]]) {
                tmess += "<td>X</td>"
            } else {
                tmess += "<td></td>"
            }

        }
        for (let j = 0; j < datas.length; j++) {
            if (sampleData[i].data[datas[j]]) {
                tmess += "<td>" + sampleData[i].data[datas[j]].value + "</td>"
            } else {
                tmess += "<td></td>"
            }
        }

        trow.innerHTML = tmess;
        tableContainer.append(trow);
    }

    fillInputs(catas, datas)
}


function getOptionalHeaders() {

    let data = new Set()
    let cata = new Set()

    for (let i = 0; i < sampleData.length; i++) {

        for (const [key, value] of Object.entries(sampleData[i].data)) {
            data.add(key)
        }

        for (const [key, value] of Object.entries(sampleData[i].categories)) {
            cata.add(key)
        }
    }

    return [[...data], [...cata]]
}


function fillInputs(catas, datas) {
    let tmess = ""
    let cont = document.getElementById("newDataTable")

    for (let i = 0; i < catas.length; i++) {

        tmess += "<div><p>" + catas[i] + " </p><input class='newRowCat' name='" + catas[i] + "' type='checkbox'></div>"
    }

    for (let i = 0; i < datas.length; i++) {

        tmess += "<div><p>" + datas[i] + " </p><input class='newRowData' name='" + datas[i] + "' type='text'></div>"
    }
    cont.innerHTML = tmess

}

function saveRow() {

    let t = document.querySelectorAll(".newRowCat")
    let t2 = document.querySelectorAll(".newRowData")
    let drawingData = {}

    t.forEach((item) => {
        if (item.checked) {
            drawingData[item.name] = ""
        }
    })

    t2.forEach((item) => {
        if (item.value !== "") {
            drawingData[item.name] = +item.value.replace(/[^0-9.-]/g, '')
        }
    })
    console.log(drawingData);

    let order = getCollageOrder(drawingData)

    for (let i = 0; i < order.length; i++) {
        if (order[i] === "")
            continue

        addProto2Collage(order[i], drawingData[order[i]])
    }

    dataList = drawingData
}