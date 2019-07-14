'use strict'

import { app, ipcMain, dialog, ipcRenderer } from 'electron'
import fs from 'fs'
import path from 'path'
import Throttle from 'throttle'
import MainWindow from './windows/MainWindow'

// global reference to mainWindow (necessary to prevent window from being garbage collected)
let mainWindow
let initFile = null
let currReadStream = null

if (process.argv.length >= 2) {
    if (fs.existsSync(path.resolve(process.argv[1])))
        initFile = { path: path.resolve(process.argv[1]) }
    else if (fs.existsSync(path.resolve(process.cwd(), process.argv[1])))
        initFile = { path: path.resolve(process.cwd(), process.argv[1]) }
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
        mainWindow = MainWindow.create({
            frame: false,
            webPreferences: {
                nodeIntegration: true
            }
        })

        mainWindow.start()
    }
})

// create main BrowserWindow when electron is ready
app.on('ready', () => {
    if (mainWindow) return

    mainWindow = MainWindow.create({
        frame: false,
        webPreferences: {
            nodeIntegration: true
        }
    })

    mainWindow.start()
})

ipcMain.on('loadFile', (e, d) => {
    if (currReadStream) {
        currReadStream.destroy()
        currReadStream = null
    }

    currReadStream = fs
        .createReadStream(e && e.path ? e.path : d.path, {
            encoding: 'UTF-8'
        })
        .pipe(new Throttle(1024 * 1024 * 1))

    currReadStream
        .on('data', data => {
            e.sender.send('fileLoadChunk', { data: data.toString() })
        })
        .on('error', () => e.sender.send('fileLoadDone', { success: false }))
        .on('end', () => e.sender.send('fileLoadDone', { success: true }))
})

ipcMain.on('cancelLoad', () => {
    if (currReadStream) currReadStream.destroy()
    currReadStream = null
})

ipcMain.on('saveFile', (e, d) => {
    fs.writeFile(d.path, d.content, { encoding: d.encoding }, (err, d) => {
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
ipcMain.on('check-initfile', e => {
    if (!initFile) return
    const tmpInitFile = initFile
    e.sender.send('check-initfile', tmpInitFile)
    initFile = null
})
ipcMain.on('minimise-app', () => mainWindow.getWindow().minimize())
ipcMain.on('maximise-app', () => mainWindow.getWindow().maximize())
ipcMain.on('decrease-app', () => mainWindow.getWindow().restore())
ipcMain.on('close-app', () => app.quit())
