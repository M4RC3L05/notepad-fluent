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
    CANCEL_FILE_LOAD,
    NEW_FILE,
    TOGGLE_SHOULD_EDITOR_RESET,
    CLOSE_OPEN_FILE,
    SET_FILE_ENCODING_TYPE,
    SET_FILE_EOL_TYPE,
    RESET_BOTTOM_STATUS_BAR,
    FILE_CONTENT_PRESTINE_ACTION,
    CREATE_NEW_TAB,
    UPDATE_TAB,
    CLOSE_TAB,
    SET_TAB_DIRTY_STATE,
    MARK_TABS_AS_NOT_ACTIVE,
    ACTIVATE_TAB,
    TABS_IS_LOADING_FILE
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

export const newFile = () => ({
    type: NEW_FILE
})

export const toggleShouldEditorReset = bool => ({
    type: TOGGLE_SHOULD_EDITOR_RESET,
    payload: bool
})

export const closeOpenFile = () => ({
    type: CLOSE_OPEN_FILE
})

export const setFileEncodingType = encType => ({
    type: SET_FILE_ENCODING_TYPE,
    payload: encType
})

export const setFileEOLType = eolType => ({
    type: SET_FILE_EOL_TYPE,
    payload: eolType
})

export const resetBottomStatusBar = () => ({
    type: RESET_BOTTOM_STATUS_BAR
})

export const fileContentPrestine = () => ({
    type: FILE_CONTENT_PRESTINE_ACTION
})

export const createNewTab = tab => ({
    type: CREATE_NEW_TAB,
    payload: tab
})

export const updateTab = (id, args) => ({
    type: UPDATE_TAB,
    payload: { id, data: args }
})

export const closeOpenTab = id => ({
    type: CLOSE_TAB,
    payload: id
})

export const setTabDirty = (id, isDirty) => ({
    type: SET_TAB_DIRTY_STATE,
    payload: { id, isDirty }
})

export const maskAllAsNotActive = () => ({
    type: MARK_TABS_AS_NOT_ACTIVE
})

export const activateTab = id => ({
    type: ACTIVATE_TAB,
    payload: id
})

export const tabsIsLoadingFile = status => ({
    type: TABS_IS_LOADING_FILE,
    payload: status
})
