import Store from './Store'
import {
    SET_FILE_EOL_TYPE,
    RESET_BOTTOM_STATUS_BAR,
    SET_FILE_ENCODING_TYPE
} from '../actions/types'

class BottomStatusBarStore extends Store {
    constructor() {
        super()
    }

    static getClassName() {
        return 'BottomStatusBarStore'
    }

    static create() {
        return new BottomStatusBarStore()
    }

    getInitialState() {
        return {
            fileEncoding: 'UTF-8',
            fileEndOfLineType: 'CRLF'
        }
    }

    reduce(state, action) {
        switch (action.type) {
            case SET_FILE_EOL_TYPE:
                return { ...state, fileEndOfLineType: action.payload }
            case RESET_BOTTOM_STATUS_BAR:
                return { ...this.getInitialState() }
            case SET_FILE_ENCODING_TYPE:
                return { ...state, fileEncoding: action.payload }
            default:
                return state
        }
    }
}

export default BottomStatusBarStore.create()
