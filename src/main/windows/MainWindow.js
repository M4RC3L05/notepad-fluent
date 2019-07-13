import { BrowserWindow } from 'electron'
import { isDevelopment } from '../../common/utils'
import path from 'path'
import { format } from 'url'
class MainWindow {
    constructor(windowOptions) {
        this._windowOptions = windowOptions

        this.start = this.start.bind(this)
        this.getWindow = this.getWindow.bind(this)
    }

    static create(windowOptions) {
        return new MainWindow(windowOptions)
    }

    getWindow() {
        return this._window
    }

    createWindow() {
        console.log('creating')
        this._window = new BrowserWindow(this._windowOptions)

        if (isDevelopment) {
            this._window.webContents.openDevTools()
        }

        if (isDevelopment) {
            this._window.loadURL(
                `http://localhost:${process.env.ELECTRON_WEBPACK_WDS_PORT}`
            )
        } else {
            this._window.loadURL(
                format({
                    pathname: path.join(__dirname, 'index.html'),
                    protocol: 'file',
                    slashes: true
                })
            )
        }

        this._window.on('closed', () => {
            this._window = null
        })

        this._window.webContents.on('devtools-opened', () => {
            this._window.focus()
            setImmediate(() => {
                this._window.focus()
            })
        })
    }

    start() {
        console.log('creating2')
        if (this._window) return
        this.createWindow()
    }
}

export default MainWindow
