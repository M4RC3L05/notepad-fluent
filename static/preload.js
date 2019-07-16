const fs = require('fs')
const os = require('os')
const path = require('path')
localStorage.removeItem('colors')
const data = fs
    .readFileSync(path.resolve(os.homedir(), 'notepad-fluent-config.json'))
    .toString()

if (data && data.length > 0) {
    const config = JSON.parse(data)

    localStorage.setItem('colors', JSON.stringify(config.colors))
}
