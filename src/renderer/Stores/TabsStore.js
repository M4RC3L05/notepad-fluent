import Store from './Store'
import {
    CREATE_NEW_TAB,
    UPDATE_TAB,
    CLOSE_TAB,
    SET_TAB_DIRTY_STATE,
    ACTIVATE_TAB
} from '../actions/types'
import uuid from '../utils/uuid'

class TabsStore extends Store {
    constructor() {
        super()
    }

    static getClassName() {
        return 'TabsStore'
    }

    static create() {
        return new TabsStore()
    }

    getInitialState() {
        return {
            tabs: []
        }
    }

    reduce(state, action) {
        switch (action.type) {
            case CREATE_NEW_TAB:
                return {
                    ...state,
                    tabs: [
                        ...state.tabs.map(tabs => ({
                            ...tabs,
                            isActive: false
                        })),
                        action.payload
                    ]
                }

            case UPDATE_TAB:
                return {
                    ...state,
                    tabs: state.tabs.map(tab =>
                        tab.id === action.payload.id
                            ? { ...tab, ...action.payload.data }
                            : tab
                    )
                }

            case CLOSE_TAB:
                return {
                    ...state,
                    tabs: state.tabs
                        .filter(tab => tab.id !== action.payload)
                        .map((tab, i, arrTabs) => {
                            return i === arrTabs.length - 1
                                ? { ...tab, isActive: true }
                                : { ...tab, isActive: false }
                        })
                }

            case SET_TAB_DIRTY_STATE:
                return {
                    ...state,
                    tabs: state.tabs.map(tab =>
                        tab.id === action.payload.id
                            ? { ...tab, isDirty: action.payload.isDirty }
                            : tab
                    )
                }

            case ACTIVATE_TAB:
                return {
                    ...state,
                    tabs: state.tabs.map(tab =>
                        tab.id === action.payload
                            ? { ...tab, isActive: true }
                            : { ...tab, isActive: false }
                    )
                }

            default:
                return state
        }
    }
}

export const tabFactory = (
    displayName,
    fullName,
    isActive,
    isDirty,
    isFile
) => ({
    displayName,
    fullName,
    id: uuid(),
    isActive,
    isDirty,
    isFile
})

export default TabsStore.create()
