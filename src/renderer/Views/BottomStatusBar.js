import View from './View'
import { ipcRenderer } from 'electron'
import { setFileEOLType } from '../actions'
import BottomStatusBarStore from '../Stores/BottomStatusBarStore'

class BottomStatusBar extends View {
    constructor(dispatcher) {
        super(dispatcher)

        this.setUpUI = this.setUpUI.bind(this)
        this.setUpListeners = this.setUpListeners.bind(this)

        this.setUpUI()
        this.setUpListeners()

        this.render()
    }

    getStores() {
        return [BottomStatusBarStore]
    }

    static create(...props) {
        return new BottomStatusBar(...props)
    }

    setUpUI() {
        this.encodingTypeDisplay = document.querySelector(
            '.bottom-status-bar__encodingType'
        )
        this.eolTypeDisplay = document.querySelector(
            '.bottom-status-bar__eolType'
        )
    }

    setUpListeners() {
        ipcRenderer.on('setLineTerminator', (e, d) => {
            this.dispatch(setFileEOLType(d.eolType))
        })
    }

    render() {
        const { BottomStatusBarStore } = this.getState()

        this.encodingTypeDisplay.textContent = BottomStatusBarStore.fileEncoding
        this.eolTypeDisplay.textContent = BottomStatusBarStore.fileEndOfLineType
    }
}

export default BottomStatusBar
