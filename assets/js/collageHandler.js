let options_type = {}

function populateSelect() {
    let select = document.getElementById("collageSel")

    let data = Object.keys(dataEncoding)


    let cats = Object.keys(categories)

    let mess = ""

    for (let j = 0; j < data.length; j++) {
        mess += "<option value='" + data[j] + "'>" + data[j] + "</option>"
        options_type[data[j]] = "data"
    }
    for (let j = 0; j < cats.length; j++) {
        if (categories[cats[j]].prototype)
            mess += "<option value='" + cats[j] + "'>" + cats[j] + "</option>"
        options_type[cats[j]] = "cat"
    }
    select.innerHTML = mess

    select.oninput = function (e) {
        console.log(e.target.value);

        const val = e.target.value

        if (options_type[val] == "data") {
            document.getElementById("dataVal").disabled = false
        }


    }
}



