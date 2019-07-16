import os from 'os'

export const isDevelopment = process.env.NODE_ENV !== 'production'

export function getLineEnding(content) {
    const matched = content.match(/\r\n|\r|\n/)
    const returned = {
        '\r': 'CR',
        '\n': 'LF',
        '\r\n': 'CRLF'
    }

    if (matched) {
        return returned[matched]
    }
    return returned[os.EOL.toString()]
}
