import View from './View'
import TabsStore from '../Stores/TabsStore'
import uuid from '../utils/uuid'

class TabsView extends View {
    constructor(dispatcher) {
        super(dispatcher)

        this.setUpUI = this.setUpUI.bind(this)
        this.setUpListeners = this.setUpListeners.bind(this)
        this.createTabElement = this.createTabElement.bind(this)
        this.onTabEnter = this.onTabEnter.bind(this)
        this.onTabLeave = this.onTabLeave.bind(this)

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
            tab.addEventListener('mouseenter', this.onTabEnter)
            tab.addEventListener('mouseleave', this.onTabLeave)
            fragment.appendChild(tab)
        })

        this.tabsWrapper.append(fragment)
    }

    onTabEnter(e) {
        const tab = this.getState().TabsStore.tabs.find(
            tab => tab.id === e.target.getAttribute('data-key')
        )

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

        if (tab.isDirty) {
            if (!e.target.classList.contains('dirty'))
                e.target.classList.add('dirty')

            return
        }

        if (e.target.classList.contains('indicator-visible'))
            e.target.classList.remove('indicator-visible')
    }

    render() {
        const { TabsStore } = this.getState()

        this.clearallTabs()
        this.displayTabs(TabsStore.tabs)
    }
}

export default TabsView
