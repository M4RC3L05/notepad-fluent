import View from './View'
import { ipcRenderer } from 'electron'
import EditorStore from '../Stores/EditorStore'
import { Dictionary } from 'terser'

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
        return [EditorStore]
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

    setUpListeners() {}

    render() {
        const { EditorStore } = this.getState()

        this.encodingTypeDisplay.textContent = EditorStore.fileEncoding
        this.eolTypeDisplay.textContent = EditorStore.fileEndOfLineType
    }
}

export default BottomStatusBar
