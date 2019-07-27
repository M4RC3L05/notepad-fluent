import View from './View'
import { ipcRenderer } from 'electron'
import TitleBarStore from '../Stores/TitleBarStore'
import SideBarStore from '../Stores/SideBarStore'
import ConfirmDialogView from './ConfirmDialogView'
import TabsStore from '../Stores/TabsStore'

class TitleBarView extends View {
    constructor(props) {
        super(props)

        this.setUpUI = this.setUpUI.bind(this)
        this.setUpListeners = this.setUpListeners.bind(this)
        this.confirmAction = this.confirmAction.bind(this)

        this.setUpUI()
        this.setUpListeners()

        this.render()
    }

    getStores() {
        return [TitleBarStore, SideBarStore, TabsStore]
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
                        const activeTab = this.getState().TabsStore.tabs.find(
                            tab => tab.isActive
                        )
                        if (activeTab && activeTab.isDirty) {
                            this.confirmAction(
                                'Tem a certeza que pretende sair, sem guardar?',
                                e => {
                                    ipcRenderer.send('close-app')
                                },
                                e => {}
                            )
                        } else ipcRenderer.send('close-app')
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

    confirmAction(confirmMessage, onConfirm, onCancel) {
        const confirmDialog = ConfirmDialogView.create({
            confirmMessage,
            onConfirm: (...args) => {
                onConfirm(...args)
                confirmDialog.onDestroy()
            },
            onCancel: (...args) => {
                onCancel(...args)
                confirmDialog.onDestroy()
            }
        })
    }

    shouldComponentUpdate(prevState, nextState) {
        if (prevState.hasOwnProperty('isOpen'))
            return prevState.isOpen !== nextState.isOpen

        if (prevState.hasOwnProperty('titleBarText'))
            return prevState.titleBarText !== nextState.titleBarText
        return false
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
