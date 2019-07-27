import View from './View'
import TabsStore from '../Stores/TabsStore'
import {
    closeOpenTab,
    activateTab,
    setFileEOLType,
    setFileEncodingType
} from '../actions'
import ConfirmDialogView from './ConfirmDialogView'
import Dispatcher from '../Dispatcher'

class TabsView extends View {
    constructor(dispatcher) {
        super(dispatcher)

        this.setUpUI = this.setUpUI.bind(this)
        this.setUpListeners = this.setUpListeners.bind(this)
        this.createTabElement = this.createTabElement.bind(this)
        this.onTabEnter = this.onTabEnter.bind(this)
        this.onTabLeave = this.onTabLeave.bind(this)
        this.closeTab = this.closeTab.bind(this)
        this.onTabClick = this.onTabClick.bind(this)

        this.setUpUI()
        this.setUpListeners()

        this.render()
    }

    getStores() {
        return [TabsStore]
    }

    static create(...props) {
        return new TabsView(...props)
    }

    setUpUI() {
        this.tabsWrapper = document.querySelector('.tabs')
    }

    setUpListeners() {}

    createTabElement(tabData) {
        const { isActive, isDirty, displayName, id } = tabData

        const tab = document.createElement('div')
        tab.setAttribute('data-key', id)
        tab.classList.add('tab')

        tab.addEventListener('mouseenter', this.onTabEnter)
        tab.addEventListener('mouseleave', this.onTabLeave)
        tab.addEventListener('click', this.onTabClick)

        if (isActive) tab.classList.add('active')

        if (isDirty) {
            tab.classList.add('dirty')
            tab.classList.add('indicator-visible')
        }

        const tabTitle = document.createElement('div')
        tabTitle.classList.add('tab__title')
        tabTitle.append(displayName)

        const tabIndicator = document.createElement('div')
        tabIndicator.classList.add('tab__indicator')
        tabIndicator.addEventListener('click', this.closeTab)

        tab.appendChild(tabTitle)
        tab.appendChild(tabIndicator)

        return tab
    }

    clearallTabs() {
        while (this.tabsWrapper.firstChild) {
            this.tabsWrapper.firstChild.removeEventListener(
                'mouseenter',
                this.onTabEnter
            )
            this.tabsWrapper.firstChild.removeEventListener(
                'mouseleave',
                this.onTabLeave
            )
            this.tabsWrapper.removeChild(this.tabsWrapper.firstChild)
        }
    }

    displayTabs(tabs) {
        if (!tabs || tabs.length <= 0) return

        const fragment = document.createDocumentFragment()
        tabs.map(tab => this.createTabElement(tab)).forEach(tab => {
            fragment.appendChild(tab)
        })

        this.tabsWrapper.append(fragment)
    }

    onTabEnter(e) {
        const tab = this.getState().TabsStore.tabs.find(
            tab => tab.id === e.target.getAttribute('data-key')
        )

        if (!tab) return

        if (!e.target.classList.contains('indicator-visible'))
            e.target.classList.add('indicator-visible')

        if (tab.isDirty) {
            if (e.target.classList.contains('dirty'))
                e.target.classList.remove('dirty')
        }
    }

    onTabLeave(e) {
        const tab = this.getState().TabsStore.tabs.find(
            tab => tab.id === e.target.getAttribute('data-key')
        )

        if (!tab) return

        if (tab.isDirty) {
            if (!e.target.classList.contains('dirty'))
                e.target.classList.add('dirty')

            return
        }

        if (e.target.classList.contains('indicator-visible'))
            e.target.classList.remove('indicator-visible')
    }

    onTabClick(e) {
        const { TabsStore } = this.getState()
        if (TabsStore.isLoadingFile) return

        if (!e.target.getAttribute('data-key'))
            this.dispatch(
                activateTab(e.target.parentNode.getAttribute('data-key'))
            )
        else this.dispatch(activateTab(e.target.getAttribute('data-key')))
    }

    closeTab(e) {
        e.stopPropagation()
        const { TabsStore } = this.getState()
        if (TabsStore.isLoadingFile) return

        const tab = TabsStore.tabs.find(
            tab => tab.id === e.target.parentNode.getAttribute('data-key')
        )

        if (tab.isDirty) {
            const confirmDialog = ConfirmDialogView.create({
                dispatcher: Dispatcher,
                confirmMessage:
                    'Tem a certesa que pretende fechar o ficheiro sem guardar?',
                onConfirm: () => {
                    if (TabsStore.tabs.length <= 1) {
                        this.dispatch(setFileEOLType(''))
                        this.dispatch(setFileEncodingType(''))
                    }
                    this.dispatch(
                        closeOpenTab(
                            e.target.parentNode.getAttribute('data-key')
                        )
                    )
                    confirmDialog.onDestroy()
                },
                onCancel: () => confirmDialog.onDestroy()
            })
        } else {
            if (TabsStore.tabs.length <= 1) {
                this.dispatch(setFileEOLType(''))
                this.dispatch(setFileEncodingType(''))
            }
            this.dispatch(
                closeOpenTab(e.target.parentNode.getAttribute('data-key'))
            )
        }
    }

    render() {
        const { TabsStore } = this.getState()
        this.clearallTabs()
        this.displayTabs(TabsStore.tabs)
    }
}

export default TabsView
