import View from './View'
import {
    toggleSideBarAction,
    setFilePathAction,
    startLoadFileAction
} from '../actions'
import { ipcRenderer } from 'electron'

class SideBarView extends View {
    constructor(props) {
        super(props)

        this.dispatcher = props.dispatcher
        this.sideBarStore = props.sideBarStore
        this.editorStore = props.editorStore

        this.setUpDependencies = this.setUpDependencies.bind(this)
        this.setUpUI = this.setUpUI.bind(this)
        this.setUpListeners = this.setUpListeners.bind(this)

        this.setUpDependencies()
        this.setUpUI()
        this.setUpListeners()

        this.render()
    }

    static create(props) {
        return new SideBarView(props)
    }

    setUpDependencies() {
        this.sideBarStore.subscribe(this)
        this.editorStore.subscribe(this)
        this.dispatcher.subscribe(this.sideBarStore)
        this.dispatcher.subscribe(this.editorStore)
    }

    setUpUI() {
        this.navToggler = document.querySelector('.side-bar__item#menu')
        this.openFileBtn = document.querySelector('.side-bar__item#file')
        this.sidebar = document.querySelector('.side-bar')
    }

    setUpListeners() {
        this.navToggler.addEventListener('click', () =>
            this.dispatcher.dispatch(toggleSideBarAction())
        )

        this.openFileBtn.addEventListener('click', () => {
            console.log('opening')
            ipcRenderer.send('openFileDialog')
        })

        ipcRenderer.on('newFileOpen', (e, d) => {
            this.dispatcher.dispatch(setFilePathAction(d.path))
            this.dispatcher.dispatch(startLoadFileAction())
            ipcRenderer.send('loadFile', {
                path: this.editorStore.getState().filePath
            })
        })
    }

    render() {
        const sideBarState = this.sideBarStore.getState()

        sideBarState.isOpen
            ? this.sidebar.classList.add('open')
            : this.sidebar.classList.remove('open')
    }
}

export default SideBarView
