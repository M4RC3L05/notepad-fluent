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
            isSavingFile: false,
            shouldResetEditor: false
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
                    isSavingFile: false
                }

            case CANCEL_FILE_LOAD:
                return {
                    ...state,
                    isLoadingFile: false,
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
                    isEditorDirty: false
                }

            case CHUNK_LOAD_FILE_ACTION:
                return {
                    ...state,
                    contents: state.contents + action.payload.chunk
                }

            case START_FILE_SAVE_ACTION:
                return { ...state, isSavingFile: true }

            case DONE_FILE_SAVE_ACTION:
                return {
                    ...state,
                    isSavingFile: false
                }

            case TOGGLE_SHOULD_EDITOR_RESET:
                return { ...state, shouldResetEditor: action.payload }

            default:
                return state
        }
    }
}

export default EditorStore.create()
