import Store from './Store'
import { CHANGE_TITLE_BAR_TITLE_ACTION } from '../actions/types'

class TitleBarStore extends Store {
    constructor() {
        super()
    }

    static create() {
        return new TitleBarStore()
    }

    getInitialState() {
        return {
            titleBarText: 'NotepadFluent'
        }
    }

    reduce(state, action) {
        switch (action.type) {
            case CHANGE_TITLE_BAR_TITLE_ACTION:
                return { ...state, titleBarText: action.payload.text }
            default:
                return state
        }
    }
}

export default TitleBarStore
