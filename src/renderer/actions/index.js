import { TOGGLE_SIDEBAR, START_EDITOR_ACTION } from './types'
import { IpcRenderer } from 'electron'

export const toggleSideBarAction = () => ({
    type: TOGGLE_SIDEBAR
})

export const startAction = (msg = '') => ({
    type: START_EDITOR_ACTION,
    payload: { msg }
})
