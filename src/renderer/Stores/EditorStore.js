import Store from './Store'
import {
    START_LOAD_FILE_ACTION,
    DONE_LOAD_FILE_ACTION,
    CHUNK_LOAD_FILE_ACTION,
    FILE_CONTENT_CHANGE_ACTION,
    START_FILE_SAVE_ACTION,
    DONE_FILE_SAVE_ACTION,
    SET_FILE_ACTION,
    CANCEL_FILE_LOAD,
    NEW_FILE,
    TOGGLE_SHOULD_EDITOR_RESET,
    CLOSE_OPEN_FILE,
    SET_FILE_EOL_TYPE,
    FILE_CONTENT_PRESTINE_ACTION
} from '../actions/types'

class EditorStore extends Store {
    constructor() {
        super()
    }

    static getClassName() {
        return 'EditorStore'
    }

    static create() {
        return new EditorStore()
    }

    getInitialState() {
        return {
            isLoadingFile: false,
            actionMessage: '',
            filePath: '',
            isEditorDirty: false,
            isSavingFile: false,
            shouldResetEditor: false,
            hasFile: false,
            fileLength: 0
        }
    }

    getState() {
        return this._state
    }

    reduce(state, action) {
        switch (action.type) {
            case NEW_FILE:
                return {
                    ...state,
                    isLoadingFile: false,
                    isEditorDirty: true,
                    isSavingFile: false,
                    filePath: 'Untitled'
                }

            case CANCEL_FILE_LOAD:
                return {
                    ...state,
                    isLoadingFile: false,
                    isEditorDirty: false,
                    isSavingFile: false
                }

            case START_LOAD_FILE_ACTION:
                return {
                    ...state,
                    isLoadingFile: true,
                    isEditorDirty: false
                }

            case DONE_LOAD_FILE_ACTION:
                return {
                    ...state,
                    isLoadingFile: false,
                    isEditorDirty: false,
                    hasFile: true
                }

            case CHUNK_LOAD_FILE_ACTION:
                return {
                    ...state,
                    contents: state.contents + action.payload.chunk
                }

            case FILE_CONTENT_CHANGE_ACTION:
                return { ...state, isEditorDirty: true }

            case START_FILE_SAVE_ACTION:
                return { ...state, isSavingFile: true }

            case DONE_FILE_SAVE_ACTION:
                return {
                    ...state,
                    isSavingFile: false,
                    isEditorDirty: false,
                    hasFile: true
                }

            case SET_FILE_ACTION:
                return {
                    ...state,
                    filePath: action.payload.path,
                    hasFile: true
                }

            case TOGGLE_SHOULD_EDITOR_RESET:
                return { ...state, shouldResetEditor: action.payload }

            case CLOSE_OPEN_FILE:
                return {
                    isLoadingFile: false,
                    actionMessage: '',
                    filePath: '',
                    isEditorDirty: false,
                    isSavingFile: false,
                    shouldResetEditor: true,
                    hasFile: false,
                    fileLength: 0
                }

            case FILE_CONTENT_PRESTINE_ACTION:
                return { ...state, isEditorDirty: false }

            default:
                return state
        }
    }
}

export default EditorStore.create()
