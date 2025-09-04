const palettes = {}

function handlePaletteSelect(value) {
    if (value === "index") {
        const data = makeIndex()
        palettes[value] = data
        addPalette("index", data)
    } else if (value === "color") {
        const data = makeColor()
        palettes[value] = data
        addPalette("color", data, true)
    }
}


function makeIndex() {

    let res = {}

    let n = 0
    for (let i = 0; i < sampleData.length; i++) {
        const el = sampleData[i]
        // if (el.type !== "manual") { //TODO: virer ou mettre le filtre manual?

        res[n] = el
        n++
        // }
    }
    return res
}


function makeColor() {
    let res = {}
    let bg_color = [241, 234, 222]
    let colors = []
    for (let i = 0; i < sampleData.length; i++) {
        const el = sampleData[i]
        let tcol = getAverageRGB(el.canvas, bg_color)
        // console.log(tcol);
        colors.push([tcol.r, tcol.g, tcol.b]);
    }

    let [refs, ids] = group_colors(colors)

    for (let i = 0; i < ids.length; i++) {
        for (let j = 0; j < ids[i].length; j++) {
            ids[i][j] = sampleData[ids[i][j]]
        }
    }
    return ids
}


function group_colors(colors) {
    let threshold = 10

    let refs = [colors[0]]
    let ids = [[0]]

    for (let i = 1; i < colors.length; i++) {
        let found = false
        for (let j = 1; j < refs.length; j++) {
            if (deltaE(refs[j], colors[i]) < threshold) {
                ids[j].push(i);
                found = true
                break;
            }
        }
        if (!found) {
            refs.push(colors[i]);
            ids.push([i])
        }
    }

    return [refs, ids];
}


function addPalette(name, data, grouped = false) {
    const container = document.getElementById('paletteContainer')

    let n = container.querySelectorAll('.paletteRow').length

    let h = 100
    let marTop = -13


    let tp = document.createElement('p')
    tp.innerHTML = name
    tp.classList.add('paletteLabel')
    tp.style.top = ((h * n) + marTop) + 'px'
    container.appendChild(tp)

    let divList = document.createElement('div')
    divList.classList.add('paletteRow')


    if (!grouped) {
        fillUnique(divList, data)

    } else {
        fillGrouped(divList, data)
    }

    let expor = document.createElement("img")
    expor.src = "/assets/images/buttons/export.png"
    expor.classList.add('exportPalette')
    expor.classList.add('buttonImg')
    expor.setAttribute('alt', 'Export')
    expor.setAttribute('name', name)

    expor.onclick = function () {
        exportPalette(name)
    }

    container.appendChild(expor)
    container.appendChild(divList)

}

function fillUnique(divList, data) {
    for (const [k, v] of Object.entries(data)) {
        let tdiv = document.createElement('div')
        tdiv.setAttribute('name', k)
        tdiv.classList.add('paletteElement')


        let label = document.createElement('p')
        label.classList.add('paletteElemLabel')
        label.innerHTML = k

        let tcan = cloneCanvas(v.canvas)
        tdiv.appendChild(tcan)
        tdiv.appendChild(label)

        divList.appendChild(tdiv)

    }
    return divList
}

function fillGrouped(divList, data) {

    for (let i = 0; i < data.length; i++) {
        let groupName = `color ${i}`
        let tdiv = document.createElement('div')
        tdiv.setAttribute('name', groupName)
        tdiv.classList.add('paletteElement')

        let label = document.createElement('p')
        label.classList.add('paletteElemLabel')
        label.innerHTML = groupName

        let canGroup = document.createElement('div')
        canGroup.classList.add('paletteGroup')

        let n = data[i].length


        for (let j = 0; j < data[i].length; j++) {

            canGroup.appendChild(data[i][j].canvas)
        }
        tdiv.appendChild(canGroup)
        tdiv.appendChild(label)

        divList.appendChild(tdiv)
    }

    return divList
}

function exportPalette(name) {

    const tdat = palettes[name]
    let res = {}
    if (Array.isArray(tdat)) {
        for (let i = 0; i < tdat.length; i++) {
            res[`${name}_${i}`] = tdat[i]
        }

    } else {
        for (const [k, v] of Object.entries(tdat)) {
            res[k] = v.canvas.toDataURL("image/png")
        }
    }

    download(JSON.stringify(res), `palette_${name}.json`, "text/json")
}