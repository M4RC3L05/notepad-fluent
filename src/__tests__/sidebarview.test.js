import 'jest-dom/extend-expect'

import getMarkup from './utils/getMarkup'
import SideBarView from '../renderer/Views/SideBarView'
import Dispatcher from '../renderer/Dispatcher'
import SideBarStore from '../renderer/Stores/SideBarStore'
import EditorStore from '../renderer/Stores/EditorStore'
import electron from 'electron'
import { doneLoadFileAction } from '../renderer/actions'
jest.mock('electron', () => ({
    ipcRenderer: {
        send: jest.fn()
    }
}))

describe('SideBar tests', () => {
    beforeEach(() => {
        document.documentElement.innerHTML = getMarkup()
        SideBarView.create({
            dispatcher: Dispatcher.create(),
            sideBarStore: SideBarStore.create(),
            editorStore: EditorStore.create()
        })
    })

    afterEach(() => {
        electron.ipcRenderer.send.mockReset()
    })

    it('should toggle side bar', () => {
        const sideBar = document.querySelector('.side-bar')
        const menuBtn = sideBar.querySelector('.side-bar__item#menu')
        expect(sideBar).not.toHaveClass('open')
        menuBtn.click()
        expect(sideBar).toHaveClass('open')
        menuBtn.click()
        expect(sideBar).not.toHaveClass('open')
    })

    it('Should call ipcRenderer send method to create a new file dialog', () => {
        const sideBar = document.querySelector('.side-bar')
        const newFileBtn = sideBar.querySelector('.side-bar__item#add_file')

        expect(electron.ipcRenderer.send).toHaveBeenCalledTimes(0)
        newFileBtn.click()
        expect(electron.ipcRenderer.send).toHaveBeenCalledTimes(1)
        expect(electron.ipcRenderer.send).toHaveBeenCalledWith('cancelLoad')
    })

    it('Should add new untitled file', () => {
        const sideBar = document.querySelector('.side-bar')
        const openFileBtn = sideBar.querySelector('.side-bar__item#file')

        expect(electron.ipcRenderer.send).toHaveBeenCalledTimes(0)
        openFileBtn.click()
        expect(electron.ipcRenderer.send).toHaveBeenCalledTimes(2)
        expect(electron.ipcRenderer.send).toHaveBeenCalledWith('cancelLoad')
        expect(electron.ipcRenderer.send).toHaveBeenCalledWith('openFileDialog')
    })

    it('Should trigger close open file', () => {
        const d = Dispatcher.create()
        SideBarView.create({
            dispatcher: d,
            sideBarStore: SideBarStore.create(),
            editorStore: EditorStore.create()
        })

        const sideBar = document.querySelector('.side-bar')
        const closeFileBtn = sideBar.querySelector('.side-bar__item#close_file')

        expect(closeFileBtn.style.display).toBe('none')
        d.dispatch(doneLoadFileAction())
        expect(closeFileBtn.style.display).toBe('block')
        closeFileBtn.click()
        expect(closeFileBtn.style.display).toBe('none')
    })
})
