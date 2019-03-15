'use strict'

import { app, BrowserWindow, ipcMain } from 'electron'
import * as path from 'path'
import fs from 'fs'
import { format as formatUrl } from 'url'
import Container from '../common/Container'

const isDevelopment = process.env.NODE_ENV !== 'production'

// global reference to mainWindow (necessary to prevent window from being garbage collected)
let mainWindow

function createMainWindow() {
    const window = new BrowserWindow({
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
            // console.log('==============')
            // console.log(d)
            // console.log('==============')
            e.sender.send('fileLoadChunk', { data })
        })
        .on('close', () => {
            e.sender.send('fileLoadDone', { success: true })
        })

    // fs.readFile(d.path, 'utf-8', (err, data) => {
    //     e.sender.send('fileLoaded', { data: data })
    // })
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
