import View from './View'
import { ipcRenderer } from 'electron'
import TitleBarStore from '../Stores/TitleBarStore'
import SideBarStore from '../Stores/SideBarStore'
import ConfirmDialogView from './ConfirmDialogView'
import Dispatcher from '../Dispatcher'

class TitleBarView extends View {
    constructor(dispatcher) {
        super(dispatcher)

        this.setUpUI = this.setUpUI.bind(this)
        this.setUpListeners = this.setUpListeners.bind(this)

        this.setUpUI()
        this.setUpListeners()

        this.render()
    }

    getStores() {
        return [TitleBarStore, SideBarStore]
    }

    static create(...props) {
        return new TitleBarView(...props)
    }

    setUpUI() {
        this.titlebarTitle = document.querySelector('.top-bar__title')
    }

    setUpListeners() {
        Array.from(
            document.querySelectorAll('.top-bar__buttons .icon')
        ).forEach(winbtn =>
            winbtn.addEventListener('click', e => {
                const btnType = e.target.getAttribute('id')

                switch (btnType) {
                    case 'close':
                        const confirmDialog = ConfirmDialogView.create(
                            Dispatcher,
                            'Tem a certesa que pretende sair?',
                            e => {
                                ipcRenderer.send('close-app')
                            },
                            e => confirmDialog.onDestroy()
                        )
                        break

                    case 'minimise':
                        ipcRenderer.send('minimise-app')
                        break

                    case 'maximise':
                        ipcRenderer.send('maximise-app')
                        e.target.setAttribute('id', 'decrease')
                        break

                    case 'decrease':
                        ipcRenderer.send('decrease-app')
                        e.target.setAttribute('id', 'maximise')
                        break

                    default:
                        return
                }
            })
        )
    }

    render() {
        const { SideBarStore, TitleBarStore } = this.getState()

        if (SideBarStore.isOpen) {
            this.titlebarTitle.style.paddingLeft = '270px'
            this.titlebarTitle.style.width = '100%'
        } else {
            this.titlebarTitle.style.paddingLeft = '60px'
            this.titlebarTitle.style.width = '100%'
        }

        this.titlebarTitle.textContent = TitleBarStore.titleBarText
    }
}

export default TitleBarView
