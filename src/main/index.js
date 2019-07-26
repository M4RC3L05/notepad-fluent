'use strict'

import { app, ipcMain, dialog, shell } from 'electron'
import fs from 'fs'
import path from 'path'
import os from 'os'
import MainWindow from './windows/MainWindow'
import { getLineEnding } from '../common/utils'

// global reference to mainWindow (necessary to prevent window from being garbage collected)
let mainWindow
let initFile = null
let currReadStream = null
let currWriteStream = null

if (!fs.existsSync(path.resolve(os.homedir(), 'notepad-fluent-config.json'))) {
    fs.writeFileSync(
        path.resolve(os.homedir(), 'notepad-fluent-config.json'),
        fs
            .readFileSync(path.resolve(__static, 'config-template.json'))
            .toString()
    )
}

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

    currReadStream = fs.createReadStream(e && e.path ? e.path : d.path, {
        encoding: 'UTF-8'
    })

    currReadStream
        .on('data', data => {
            e.sender.send('fileLoadChunk', { data })
        })
        .once('data', data => {
            e.sender.send('setLineTerminator', {
                eolType: getLineEnding(data.toString())
            })
        })
        .on('error', () =>
            e.sender.send('fileLoadDone', {
                success: false,
                path: e && e.path ? e.path : d.path,
                displayName: path.basename(e && e.path ? e.path : d.path)
            })
        )
        .on('end', () =>
            e.sender.send('fileLoadDone', {
                success: true,
                path: e && e.path ? e.path : d.path,
                displayName: path.basename(e && e.path ? e.path : d.path)
            })
        )
})

ipcMain.on('cancelLoad', () => {
    if (currReadStream) currReadStream.destroy()
    currReadStream = null
})

ipcMain.on('saveFileChunk', (e, d) => {
    if (!currWriteStream) {
        currWriteStream = fs.createWriteStream(d.path, {
            encoding: d.encoding
        })
    }
    currWriteStream.write(d.data, d.encoding, err => {
        if (err) {
            e.sender.send('saveFailed')
        }
    })
})
ipcMain.on('endSaveFileChunk', e => {
    if (!currWriteStream) return
    currWriteStream.end(() => {
        currWriteStream.destroy()
        currWriteStream = null
        e.sender.send('saveFileDone')
    })
})

ipcMain.on('openFileDialog', e => {
    dialog.showOpenDialog({ properties: ['openFile'] }, filePath => {
        if (!filePath || filePath.length <= 0) return
        e.sender.send('newFileOpen', {
            path: filePath[0],
            displayName: path.basename(filePath[0])
        })
    })
})

ipcMain.on('createFile', e => {
    dialog.showSaveDialog(r => {
        if (!r) return

        fs.open(r, 'w', (err, fd) => {
            fs.close(fd, err => {
                e.sender.send('newFileCreated', {
                    path: r,
                    displayName: path.basename(r)
                })
            })
        })
    })
})
ipcMain.on('check-initfile', e => {
    if (!initFile) {
        e.sender.send('check-initfile', { path: null, displayName: null })
        return
    }
    const tmpInitFile = initFile
    e.sender.send('check-initfile', {
        ...tmpInitFile,
        displayName: path.basename(tmpInitFile.path)
    })
    initFile = null
})
ipcMain.on('openConfigFile', () => {
    shell.openExternal(
        `file:///${path.resolve(os.homedir(), 'notepad-fluent-config.json')}`
    )
})
ipcMain.on('minimise-app', () => mainWindow.getWindow().minimize())
ipcMain.on('maximise-app', () => mainWindow.getWindow().maximize())
ipcMain.on('decrease-app', () => mainWindow.getWindow().restore())
ipcMain.on('close-app', () => app.quit())

fs.watch(path.resolve(os.homedir(), 'notepad-fluent-config.json'), (e, f) => {
    if (!mainWindow) return

    fs.readFile(
        path.resolve(os.homedir(), 'notepad-fluent-config.json'),
        null,
        (err, data) => {
            if (err) return
            mainWindow
                .getWindow()
                .webContents.send('configChanged', { config: data.toString() })
        }
    )
})

ipcMain.on('getConfigStart', e => {
    try {
        if (
            !fs.existsSync(
                path.resolve(os.homedir(), 'notepad-fluent-config.json')
            )
        ) {
            e.returnValue = null
            return
        }

        e.returnValue = {
            config: fs
                .readFileSync(
                    path.resolve(os.homedir(), 'notepad-fluent-config.json')
                )
                .toString()
        }
    } catch {
        e.returnValue = null
    }
})
