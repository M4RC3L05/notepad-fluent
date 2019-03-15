import {
    TOGGLE_SIDEBAR,
    START_LOAD_FILE_ACTION,
    DONE_LOAD_FILE_ACTION,
    CHUNK_LOAD_FILE_ACTION,
    FILE_CONTENT_CHANGE_ACTION,
    START_FILE_SAVE,
    DONE_FILE_SAVE
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

export const fileContentChangeAction = () => ({
    type: FILE_CONTENT_CHANGE_ACTION
})

export const startSaveFileAction = () => ({
    type: START_FILE_SAVE
})

export const doneSaveFileAction = () => ({
    type: DONE_FILE_SAVE
})
