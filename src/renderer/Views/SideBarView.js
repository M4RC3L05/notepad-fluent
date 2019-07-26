import View from './View'
import { toggleSideBarAction, cancelFileLoad } from '../actions'
import { ipcRenderer } from 'electron'
import SideBarStore from '../Stores/SideBarStore'
import TabsStore from '../Stores/TabsStore'

class SideBarView extends View {
    constructor(dispatch) {
        super(dispatch)

        this.setUpUI = this.setUpUI.bind(this)
        this.setUpListeners = this.setUpListeners.bind(this)

        this.setUpUI()
        this.setUpListeners()

        this.render()
    }

    static create(...props) {
        return new SideBarView(...props)
    }

    getStores() {
        return [SideBarStore, TabsStore]
    }

    setUpUI() {
        this.navToggler = document.querySelector('.side-bar__item#menu')
        this.openFileBtn = document.querySelector('.side-bar__item#file')
        this.addFileBtn = document.querySelector('.side-bar__item#add_file')
        this.configBtn = document.querySelector('.side-bar__item#settings')
        this.sidebar = document.querySelector('.side-bar')
    }

    setUpListeners() {
        this.navToggler.addEventListener('click', () =>
            this.dispatch(toggleSideBarAction())
        )

        this.openFileBtn.addEventListener('click', () => {
            this.dispatch(cancelFileLoad())
            ipcRenderer.send('cancelLoad')
            ipcRenderer.send('openFileDialog')
        })

        this.addFileBtn.addEventListener('click', e => {
            this.dispatch(cancelFileLoad())
            ipcRenderer.send('cancelLoad')
            ipcRenderer.send('createFile')
        })

        this.configBtn.addEventListener('click', () => {
            ipcRenderer.send('openConfigFile')
        })
    }

    render() {
        const { SideBarStore } = this.getState()

        SideBarStore.isOpen
            ? this.sidebar.classList.add('open')
            : this.sidebar.classList.remove('open')
    }
}

export default SideBarView
