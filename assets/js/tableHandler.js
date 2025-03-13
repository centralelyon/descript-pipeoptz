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