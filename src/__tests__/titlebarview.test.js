import 'jest-dom/extend-expect'

import electron from 'electron'

import getMarkup from './utils/getMarkup'
import TitleBarView from '../renderer/Views/TitleBarView'
import TitleBarStore from '../renderer/Stores/TitleBarStore'
import SideBarView from '../renderer/Views/SideBarView'
import Dispatcher from '../renderer/Dispatcher'

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

        TitleBarView.create({ dispatch: () => {}, subscribe: () => {} })

        expect(topBarTitle.style.paddingLeft).toBe('60px')
        expect(topBarTitle.style.width).toBe('100%')

        SideBarView.create(Dispatcher)
        document.querySelector('#menu').click()

        expect(topBarTitle.style.paddingLeft).toBe('270px')
        expect(topBarTitle.style.width).toBe('100%')
    })

    it('Should send minimise event', () => {
        TitleBarView.create({ dispatch: () => {}, subscribe: () => {} })

        const minimiseBtn = document.querySelector('#minimise')

        expect(electron.ipcRenderer.send).toHaveBeenCalledTimes(0)

        minimiseBtn.click()

        expect(electron.ipcRenderer.send).toHaveBeenCalledTimes(1)
        expect(electron.ipcRenderer.send).toHaveBeenCalledWith('minimise-app')
    })

    it('Should send close event', () => {
        TitleBarView.create({ dispatch: () => {}, subscribe: () => {} })

        const closeBtn = document.querySelector('#close')

        expect(electron.ipcRenderer.send).toHaveBeenCalledTimes(0)

        closeBtn.click()

        expect(electron.ipcRenderer.send).toHaveBeenCalledTimes(1)
        expect(electron.ipcRenderer.send).toHaveBeenCalledWith('close-app')
    })

    it('Should send maximise / decrease event', () => {
        TitleBarView.create({ dispatch: () => {}, subscribe: () => {} })

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
