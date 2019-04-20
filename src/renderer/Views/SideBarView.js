import View from './View'
import {
    toggleSideBarAction,
    cancelFileLoad,
    setNewTitleBarText,
    toggleShouldEditorReset,
    newFile,
    closeOpenFile
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
        this.addFileBtn = document.querySelector('.side-bar__item#add_file')
        this.closeFileBtn = document.querySelector('.side-bar__item#close_file')
        this.sidebar = document.querySelector('.side-bar')
    }

    setUpListeners() {
        this.navToggler.addEventListener('click', () =>
            this.dispatcher.dispatch(toggleSideBarAction())
        )

        this.openFileBtn.addEventListener('click', () => {
            this.dispatcher.dispatch(cancelFileLoad())
            ipcRenderer.send('cancelLoad')
            ipcRenderer.send('openFileDialog')
        })

        this.addFileBtn.addEventListener('click', e => {
            this.dispatcher.dispatch(cancelFileLoad())
            ipcRenderer.send('cancelLoad')
            this.dispatcher.dispatch(setNewTitleBarText('Untitled'))
            this.dispatcher.dispatch(newFile())
            this.dispatcher.dispatch(toggleShouldEditorReset(true))
        })

        this.closeFileBtn.addEventListener('click', e => {
            if (this.editorStore.getState().hasFile)
                this.dispatcher.dispatch(closeOpenFile())
        })
    }

    render() {
        const sideBarState = this.sideBarStore.getState()
        const editorStore = this.editorStore.getState()

        sideBarState.isOpen
            ? this.sidebar.classList.add('open')
            : this.sidebar.classList.remove('open')

        if (editorStore.hasFile) this.closeFileBtn.style.display = 'block'
        else this.closeFileBtn.style.display = 'none'
    }
}

export default SideBarView
