import Store from './Store'
import {
    START_LOAD_FILE_ACTION,
    DONE_LOAD_FILE_ACTION,
    CHUNK_LOAD_FILE_ACTION,
    FILE_CONTENT_CHANGE_ACTION,
    START_FILE_SAVE,
    DONE_FILE_SAVE
} from '../actions/types'

class EditorStore extends Store {
    constructor() {
        super()
    }

    static create() {
        return new EditorStore()
    }

    getInitialState() {
        return {
            isLoadingFile: false,
            actionMessage: '',
            contents: '',
            isEditorDirty: false,
            isSavingFile: false
        }
    }

    getState() {
        return this._state
    }

    reduce(state, action) {
        switch (action.type) {
            case START_LOAD_FILE_ACTION:
                return { ...state, isLoadingFile: true, contents: '' }
            case DONE_LOAD_FILE_ACTION:
                return { ...state, isLoadingFile: false }
            case CHUNK_LOAD_FILE_ACTION:
                return {
                    ...state,
                    contents: state.contents + action.payload.chunk
                }
            case FILE_CONTENT_CHANGE_ACTION:
                return { ...state, isEditorDirty: true }

            case START_FILE_SAVE:
                return { ...state, isSavingFile: true }
            case DONE_FILE_SAVE:
                return {
                    ...state,
                    isSavingFile: false,
                    isEditorDirty: false
                }
            default:
                return state
        }
    }
}

export default EditorStore
