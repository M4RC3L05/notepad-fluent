import View from './View'
import { ipcRenderer } from 'electron'
import { setFileEOLType, setFileEncodingType } from '../actions'
import BottomStatusBarStore from '../Stores/BottomStatusBarStore'

class BottomStatusBarView extends View {
    constructor(props) {
        super(props)

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
        return new BottomStatusBarView(...props)
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
            this.dispatch(setFileEncodingType('UTF-8'))
        })
    }

    shouldComponentUpdate(prevState, newState) {
        return (
            prevState.fileEncoding !== newState.fileEncoding ||
            prevState.fileEndOfLineType !== newState.fileEndOfLineType
        )
    }

    render() {
        const { BottomStatusBarStore } = this.getState()
        this.encodingTypeDisplay.textContent = BottomStatusBarStore.fileEncoding
        this.eolTypeDisplay.textContent = BottomStatusBarStore.fileEndOfLineType
    }
}

export default BottomStatusBarView
