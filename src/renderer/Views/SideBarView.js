import View from './View'
import { toggleSideBarAction } from '../actions'

class SideBarView extends View {
    constructor(props) {
        super(props)

        this.dispatcher = props.dispatcher
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
        return new SideBarView(props)
    }

    setUpDependencies() {
        this.sideBarStore.subscribe(this)
        this.dispatcher.subscribe(this.sideBarStore)
    }

    setUpUI() {
        this.navToggler = document.querySelector('.side-bar__item#menu')
        this.sidebar = document.querySelector('.side-bar')
    }

    setUpListeners() {
        this.navToggler.addEventListener('click', () =>
            this.dispatcher.dispatch(toggleSideBarAction())
        )
    }

    render() {
        const sideBarState = this.sideBarStore.getState()

        sideBarState.isOpen
            ? this.sidebar.classList.add('open')
            : this.sidebar.classList.remove('open')
    }
}

export default SideBarView
