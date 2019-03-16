import fs from 'fs'
import path from 'path'

export default function getMarkup() {
    return fs
        .readFileSync(path.resolve(__dirname, '..', '..', 'index.html'))
        .toString()
}
