import View from './View'
import { ipcRenderer } from 'electron'

class TitleBarView extends View {
    constructor(props) {
        super(props)

        this.dispatcher = props.dispatcher
        this.titleBarStore = props.titleBarStore
        this.sideBarStore = props.sideBarStore

        this.setUpDependencies = this.setUpDependencies.bind(this)
        this.setUpUI = this.setUpUI.bind(this)
        this.setUpListeners = this.setUpListeners.bind(this)

        this.setUpDependencies()
        this.setUpUI()
        this.setUpListeners()

        this.render()
    }

    static create(props) {
        return new TitleBarView(props)
    }

    setUpDependencies() {
        this.titleBarStore.subscribe(this)
        this.sideBarStore.subscribe(this)
        this.dispatcher.subscribe(this.titleBarStore)
        this.dispatcher.subscribe(this.sideBarStore)
    }

    setUpUI() {
        this.titlebarTitle = document.querySelector('.top-bar__title')
    }

    setUpListeners() {
        Array.from(
            document.querySelectorAll('.top-bar__buttons .icon-bg .icon')
        ).forEach(winbtn =>
            winbtn.addEventListener('click', e => {
                const btnType = e.target.getAttribute('id')

                switch (btnType) {
                    case 'close':
                        ipcRenderer.send('close-app')
                        break

                    case 'minimise':
                        ipcRenderer.send('minimise-app')
                        break

                    case 'maximise':
                    case 'decrease':
                        btnType === 'maximise'
                            ? (ipcRenderer.send('maximise-app'),
                              e.target.setAttribute('id', 'decrease'))
                            : (ipcRenderer.send('decrease-app'),
                              e.target.setAttribute('id', 'maximise'))

                        break

                    default:
                        return
                }
            })
        )
    }

    render() {
        const sideBarState = this.sideBarStore.getState()
        const titleBarState = this.titleBarStore.getState()

        if (sideBarState.isOpen) {
            this.titlebarTitle.style.paddingLeft = '15px'
            this.titlebarTitle.style.width = '255px'
        } else {
            this.titlebarTitle.style.paddingLeft = '60px'
            this.titlebarTitle.style.width = '100%'
        }

        this.titlebarTitle.textContent = titleBarState.titleBarText
    }
}

export default TitleBarView
