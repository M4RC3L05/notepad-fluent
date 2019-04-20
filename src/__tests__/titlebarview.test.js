import 'jest-dom/extend-expect'

import electron from 'electron'

import getMarkup from './utils/getMarkup'
import TitleBarView from '../renderer/Views/TitleBarView'
import TitleBarStore from '../renderer/Stores/TitleBarStore'

jest.mock('electron', () => ({
    ipcRenderer: {
        send: jest.fn()
    }
}))

describe('TitleBar tests', () => {
    beforeEach(() => {
        document.documentElement.innerHTML = getMarkup()
    })

    afterEach(() => {
        electron.ipcRenderer.send.mockReset()
    })

    it('Should move title on open/close of the side bar', () => {
        const topBarTitle = document.querySelector('.top-bar__title')

        TitleBarView.create({
            dispatcher: { dispatch: () => {}, subscribe: () => {} },
            sideBarStore: {
                subscribe: () => {},
                getState: () => ({ isOpen: false })
            },
            titleBarStore: TitleBarStore.create()
        })

        expect(topBarTitle.style.paddingLeft).toBe('60px')
        expect(topBarTitle.style.width).toBe('100%')

        TitleBarView.create({
            dispatcher: { dispatch: () => {}, subscribe: () => {} },
            sideBarStore: {
                subscribe: () => {},
                getState: () => ({ isOpen: true })
            },
            titleBarStore: TitleBarStore.create()
        })

        expect(topBarTitle.style.paddingLeft).toBe('15px')
        expect(topBarTitle.style.width).toBe('255px')
    })

    it('Should send minimise event', () => {
        TitleBarView.create({
            dispatcher: { dispatch: () => {}, subscribe: () => {} },
            sideBarStore: {
                subscribe: () => {},
                getState: () => ({ isOpen: false })
            },
            titleBarStore: TitleBarStore.create()
        })

        const minimiseBtn = document.querySelector('#minimise')

        expect(electron.ipcRenderer.send).toHaveBeenCalledTimes(0)

        minimiseBtn.click()

        expect(electron.ipcRenderer.send).toHaveBeenCalledTimes(1)
        expect(electron.ipcRenderer.send).toHaveBeenCalledWith('minimise-app')
    })

    it('Should send close event', () => {
        TitleBarView.create({
            dispatcher: { dispatch: () => {}, subscribe: () => {} },
            sideBarStore: {
                subscribe: () => {},
                getState: () => ({ isOpen: false })
            },
            titleBarStore: TitleBarStore.create()
        })

        const closeBtn = document.querySelector('#close')

        expect(electron.ipcRenderer.send).toHaveBeenCalledTimes(0)

        closeBtn.click()

        expect(electron.ipcRenderer.send).toHaveBeenCalledTimes(1)
        expect(electron.ipcRenderer.send).toHaveBeenCalledWith('close-app')
    })

    it('Should send maximise / decrease event', () => {
        TitleBarView.create({
            dispatcher: { dispatch: () => {}, subscribe: () => {} },
            sideBarStore: {
                subscribe: () => {},
                getState: () => ({ isOpen: false })
            },
            titleBarStore: TitleBarStore.create()
        })

        const maximiseBtn = document.querySelector('#maximise')
        expect(electron.ipcRenderer.send).toHaveBeenCalledTimes(0)

        maximiseBtn.click()

        expect(electron.ipcRenderer.send).toHaveBeenCalledTimes(1)
        expect(electron.ipcRenderer.send).toHaveBeenCalledWith('maximise-app')
        expect(maximiseBtn.getAttribute('id')).toBe('decrease')

        const decreaseBtn = document.querySelector('#decrease')
        decreaseBtn.click()
        expect(electron.ipcRenderer.send).toHaveBeenCalledTimes(2)
        expect(electron.ipcRenderer.send).toHaveBeenCalledWith('maximise-app')
        expect(decreaseBtn.getAttribute('id')).toBe('maximise')
    })
})
