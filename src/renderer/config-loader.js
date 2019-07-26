import { ipcRenderer } from 'electron'

function applyConfig(config) {
    if (!config) return

    applyColors(config.colors)
}

function applyColors(colors) {
    if (!colors) return
    for (const [key, style] of Object.entries(colors))
        document.documentElement.style.setProperty('--' + key, style)
}

ipcRenderer.on('configChanged', (e, { config }) => {
    config && applyConfig(JSON.parse(config))
})
ipcRenderer.send('getConfig')
