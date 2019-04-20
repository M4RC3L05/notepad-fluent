import {
    TOGGLE_SIDEBAR,
    START_LOAD_FILE_ACTION,
    DONE_LOAD_FILE_ACTION,
    CHUNK_LOAD_FILE_ACTION,
    FILE_CONTENT_CHANGE_ACTION,
    START_FILE_SAVE_ACTION,
    DONE_FILE_SAVE_ACTION,
    SET_FILE_ACTION,
    CHANGE_TITLE_BAR_TITLE_ACTION,
    CANCEL_FILE_LOAD
} from './types'

export const toggleSideBarAction = () => ({
    type: TOGGLE_SIDEBAR
})

export const startLoadFileAction = () => ({
    type: START_LOAD_FILE_ACTION
})

export const doneLoadFileAction = () => ({
    type: DONE_LOAD_FILE_ACTION
})

export const chuckLoadFileAction = chunk => ({
    type: CHUNK_LOAD_FILE_ACTION,
    payload: {
        chunk
    }
})

export const cancelFileLoad = () => ({ type: CANCEL_FILE_LOAD })

export const fileContentChangeAction = () => ({
    type: FILE_CONTENT_CHANGE_ACTION
})

export const startSaveFileAction = () => ({
    type: START_FILE_SAVE_ACTION
})

export const doneSaveFileAction = () => ({
    type: DONE_FILE_SAVE_ACTION
})

export const setFilePathAction = path => ({
    type: SET_FILE_ACTION,
    payload: { path }
})

export const setNewTitleBarText = text => ({
    type: CHANGE_TITLE_BAR_TITLE_ACTION,
    payload: {
        text
    }
})
