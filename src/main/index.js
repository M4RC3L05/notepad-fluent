'use strict'

import { app, ipcMain, dialog } from 'electron'
import fs from 'fs'
import Throttle from 'throttle'
import MainWindow from './windows/MainWindow'

// global reference to mainWindow (necessary to prevent window from being garbage collected)
let mainWindow

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

let currReadStream = null

ipcMain.on('loadFile', (e, d) => {
    if (currReadStream) {
        currReadStream.destroy()
        currReadStream = null
    }

    currReadStream = fs
        .createReadStream(d.path, {
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

ipcMain.on('minimise-app', () => mainWindow.getWindow().minimize())
ipcMain.on('maximise-app', () => mainWindow.getWindow().maximize())
ipcMain.on('decrease-app', () => mainWindow.getWindow().restore())
ipcMain.on('close-app', () => app.quit())
