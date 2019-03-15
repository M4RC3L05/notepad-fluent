'use strict'

import { app, BrowserWindow, ipcMain, dialog, remote } from 'electron'
import * as path from 'path'
import fs from 'fs'
import { format as formatUrl } from 'url'

const isDevelopment = process.env.NODE_ENV !== 'production'

// global reference to mainWindow (necessary to prevent window from being garbage collected)
let mainWindow

function createMainWindow() {
    const window = new BrowserWindow({
        frame: false,
        webPreferences: {
            nodeIntegration: true
        }
    })

    if (isDevelopment) {
        window.webContents.openDevTools()
    }

    if (isDevelopment) {
        window.loadURL(
            `http://localhost:${process.env.ELECTRON_WEBPACK_WDS_PORT}`
        )
    } else {
        window.loadURL(
            formatUrl({
                pathname: path.join(__dirname, 'index.html'),
                protocol: 'file',
                slashes: true
            })
        )
    }

    window.on('closed', () => {
        mainWindow = null
    })

    window.webContents.on('devtools-opened', () => {
        window.focus()
        setImmediate(() => {
            window.focus()
        })
    })

    return window
}

// quit application when all windows are closed
app.on('window-all-closed', () => {
    // on macOS it is common for applications to stay open until the user explicitly quits
    if (process.platform !== 'darwin') {
        app.quit()
    }
})

app.on('activate', () => {
    // on macOS it is common to re-create a window even after all windows have been closed
    if (mainWindow === null) {
        mainWindow = createMainWindow()
    }
})

// create main BrowserWindow when electron is ready
app.on('ready', () => {
    mainWindow = createMainWindow()
})

let currReadStream = null

ipcMain.on('loadFile', (e, d) => {
    if (currReadStream) {
        currReadStream.destroy()
        currReadStream = null
    }
    currReadStream = fs.createReadStream(d.path, {
        encoding: 'utf8',
        highWaterMark: 4 * 1024
    })

    currReadStream
        .on('data', data => {
            e.sender.send('fileLoadChunk', { data })
        })
        .on('close', () => {
            e.sender.send('fileLoadDone', { success: true })
        })
})

ipcMain.on('cancelLoad', () => {
    if (currReadStream) currReadStream.destroy()
    currReadStream = null
})

ipcMain.on('saveFile', (e, d) => {
    fs.writeFile(d.path, d.content, (err, d) => {
        e.sender.send('saveFileDone')
    })
})

ipcMain.on('openFileDialog', e => {
    dialog.showOpenDialog({ properties: ['openFile'] }, path => {
        if (!path || path.length <= 0) return
        e.sender.send('newFileOpen', { path: path[0] })
    })
})

ipcMain.on('createFile', e => {
    dialog.showSaveDialog(r => {
        if (!r) return

        e.sender.send('newFileCreated', { path: r })
    })
})
console.log(remote)
ipcMain.on('minimise-app', () => mainWindow.minimize())
ipcMain.on('maximise-app', () => mainWindow.maximize())
ipcMain.on('decrease-app', () => mainWindow.restore())
ipcMain.on('close-app', () => mainWindow.close())
