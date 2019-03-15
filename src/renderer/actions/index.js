import {
    TOGGLE_SIDEBAR,
    START_LOAD_FILE_ACTION,
    DONE_LOAD_FILE_ACTION,
    CHUNK_LOAD_FILE_ACTION
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
