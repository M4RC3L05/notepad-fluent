import './../assets/css/styles.css'

const navToggler = document.querySelector('.side-bar__icon#menu')
const sidebar = document.querySelector('.side-bar')
navToggler.addEventListener('click', () => {
    sidebar.classList.toggle('open')
})

const path = require('path')
const fs = require('fs')
const readline = require('readline')

function loadFile() {
    const fileStream = fs.createReadStream(
        path.resolve(__dirname, '..', '..', 'abc.txt')
    )

    const rl = readline.createInterface({
        input: fileStream,
        crlf: Infinity
    })

    rl.on('line', line => {
        const div = document.createElement('div')
        if (line.trim().length <= 0) line = '<br>'
        line = line.replace(' ', '&nbsp;')
        div.innerHTML = line
        document.querySelector('#content-editable').appendChild(div)
    })
}

function saveFile() {
    const data = Array.from(
        document.querySelector('#content-editable').childNodes
    )
        .map(el => {
            let str = ''
            if (el.nodeType && el.nodeType === 3) {
                str += el.textContent + '\n'
            } else if (el.firstChild.nodeType === 3) {
                str += el.textContent + '\n'
            } else {
                str += '\n'
            }

            return str
        })
        .join('')

    fs.writeFile(
        path.resolve(__dirname, '..', '..', 'abc.txt'),
        data,
        (err, d) => {}
    )
}

document.querySelector('#content-editable').addEventListener('keydown', e => {
    if (e.keyCode === 9) {
        e.preventDefault()

        const editor = document.querySelector('#content-editable')

        document.execCommand('insertHTML', false, '&nbsp;&nbsp;&nbsp;&nbsp;')
    }
    if (e.keyCode === 83 && e.ctrlKey) {
        console.log('saving')
        saveFile()
    }
})

loadFile()
