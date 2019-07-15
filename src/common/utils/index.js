export const isDevelopment = process.env.NODE_ENV !== 'production'

export function getLineEnding(content) {
    const matched = content.match(/\r\n|\r|\n/)
    const returned = {
        '\r': 'CR',
        '\n': 'LF',
        '\r\n': 'CRLF'
    }[matched]

    if (matched) {
        return returned
    }
    return 'NA'
}
