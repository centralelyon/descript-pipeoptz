function handlePaletteSelect(value) {
    console.log(value);
    if (value === "index") {
        const data = makeIndex()
        console.log(data);
        addPalette("index", data)
    }
}


function makeIndex() {

    let res = {}

    let n = 0
    for (let i = 0; i < sampleData.length; i++) {
        const el = sampleData[i]
        // if (el.type !== "manual") { //TODO: virer ou mettre le filtre manual

            res[n] = el
            n++
        // }
    }
    return res
}


function addPalette(name, data) {
    const container = document.getElementById('paletteContainer')

    let divList = document.createElement('div')


    let tp = document.createElement('p')
    tp.innerHTML = `name`
    tp.classList.add('paletteLabel')

    divList.appendChild(tp)

    for (const [k, v] of Object.entries(data)) {
        let tdiv = document.createElement('div')
        tdiv.setAttribute('name', k)

        let label = document.createElement('p')
        label.classList.add('paletteElemLabel')
        label.innerHTML = k

        let tcan = cloneCanvas(v.canvas)
        tdiv.appendChild(tcan)
        tdiv.appendChild(label)

        container.appendChild(tdiv)
    }
}