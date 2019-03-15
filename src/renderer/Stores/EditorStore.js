import Store from './Store'
import {
    START_LOAD_FILE_ACTION,
    DONE_LOAD_FILE_ACTION,
    CHUNK_LOAD_FILE_ACTION
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
            isPerformingAction: false,
            actionMessage: '',
            contents: ''
        }
    }

    getState() {
        return this._state
    }

    reduce(state, action) {
        switch (action.type) {
            case START_LOAD_FILE_ACTION:
                return { ...state, isPerformingAction: true, contents: '' }
            case DONE_LOAD_FILE_ACTION:
                return { ...state, isPerformingAction: false }
            case CHUNK_LOAD_FILE_ACTION:
                return {
                    ...state,
                    contents: state.contents + action.payload.chunk
                }
            default:
                return state
        }
    }
}

export default EditorStore
