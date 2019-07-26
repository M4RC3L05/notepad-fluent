import View from './View'
import { ipcRenderer } from 'electron'
import 'codemirror/lib/codemirror.css'
import Codemirror from 'codemirror/lib/codemirror'
import {
    startLoadFileAction,
    doneLoadFileAction,
    fileContentChangeAction,
    doneSaveFileAction,
    startSaveFileAction,
    setFilePathAction,
    setNewTitleBarText,
    toggleShouldEditorReset,
    fileContentPrestine,
    createNewTab,
    setTabDirty,
    updateTab,
    setFileEOLType
} from '../actions'
import EditorStore from '../Stores/EditorStore'
import BottomStatusBarStore from '../Stores/BottomStatusBarStore'
import TabsStore, { tabFactory } from '../Stores/TabsStore'

class EditorView extends View {
    constructor(dispatcher) {
        super(dispatcher)
        this.setUpUI = this.setUpUI.bind(this)
        this.setUpListeners = this.setUpListeners.bind(this)
        this.saveContents = this.saveContents.bind(this)
        this.createEditorInstance = this.createEditorInstance.bind(this)

        this.setUpUI()
        this.setUpListeners()

        this.render()
    }

    static create(...props) {
        return new EditorView(...props)
    }

    getStores() {
        return [EditorStore, BottomStatusBarStore, TabsStore]
    }

    setUpUI() {
        this.editor = document.querySelector('#editor')
        this.editorWrapper = document.querySelector('#editor-wrapper')
    }

    createEditorInstance() {
        this.codem = Codemirror.fromTextArea(this.editor, {
            mode: '',
            dragDrop: false,
            lineNumbers: false
        })

        this.codem.on('keydown', (cm, e) => {
            if (e.keyCode === 83 && e.ctrlKey) {
                const { EditorStore, TabsStore } = this.getState()
                const activeTab = TabsStore.tabs.find(tab => tab.isActive)
                if (!activeTab) return

                if (EditorStore.isSavingFile) return
                if (!activeTab.isDirty) return

                if (!activeTab.fullName || activeTab.fullName === 'Untitled') {
                    this.dispatch(startSaveFileAction())
                    ipcRenderer.send('createFile')
                    return
                }

                this.dispatch(startSaveFileAction())
                this.saveContents()
            }
        })

        this.codem.on('change', (cm, e) => {
            const { EditorStore, TabsStore } = this.getState()
            if (EditorStore.isLoadingFile || EditorStore.shouldResetEditor)
                return

            const activeTab = TabsStore.tabs.find(tab => tab.isActive)
            if (activeTab) {
                if (cm.getDoc().historySize().undo > 0)
                    this.dispatch(setTabDirty(activeTab.id, true))
                else this.dispatch(setTabDirty(activeTab.id, false))
            }
        })
    }

    setUpListeners() {
        this.editorWrapper.addEventListener('dragover', e => {
            e.preventDefault()
            this.editorWrapper.classList.add('file-hover')
        })
        this.editorWrapper.addEventListener('dragleave', e => {
            e.preventDefault()
            this.editorWrapper.classList.remove('file-hover')
        })
        this.editorWrapper.addEventListener('drop', e => {
            if (e.dataTransfer.items) {
                const { TabsStore } = this.getState()
                const path = e.dataTransfer.items[0].getAsFile().path
                const displayName = e.dataTransfer.items[0]
                    .getAsFile()
                    .path.split(/(\\|\/)/g)
                    .pop()
                const activeTab = TabsStore.tabs.find(tab => tab.isActive)

                if (!activeTab)
                    this.dispatch(
                        createNewTab(tabFactory(displayName, path, true, false))
                    )
                else if (activeTab.displayName !== 'Untitled') {
                    this.dispatch(
                        createNewTab(tabFactory(displayName, path, true, false))
                    )
                } else if (
                    activeTab.displayName === 'Untitled' &&
                    activeTab.isDirty
                ) {
                    this.dispatch(
                        createNewTab(tabFactory(displayName, path, true, false))
                    )
                } else {
                    this.dispatch(
                        updateTab(activeTab.id, { displayName, fullName: path })
                    )
                }

                ipcRenderer.emit('newFileOpen', {
                    path,
                    displayName
                })
            }

            this.editorWrapper.classList.remove('file-hover')
        })

        ipcRenderer.on('saveFileDone', () => {
            const { TabsStore } = this.getState()
            this.codem.getDoc().clearHistory()
            this.dispatch(doneSaveFileAction())
            const activeTab = TabsStore.tabs.find(tab => tab.isActive)
            this.dispatch(setTabDirty(activeTab.id, false))
        })

        ipcRenderer.on('fileLoadChunk', (e, d) => {
            const { EditorStore } = this.getState()
            if (EditorStore.isLoadingFile)
                this.codem.replaceRange(
                    d.data,
                    Codemirror.Pos(this.codem.lastLine())
                )
        })

        ipcRenderer.on('fileLoadDone', (e, d) => {
            this.codem.getDoc().clearHistory()
            this.dispatch(doneLoadFileAction())
        })

        ipcRenderer.on('newFileOpen', (e, d) => {
            const path = d && d.path ? d.path : e && e.path ? e.path : null
            const displayName =
                d && d.displayName
                    ? d.displayName
                    : e && e.displayName
                    ? e.displayName
                    : null

            if (!path || !displayName || displayName === 'Untitled') {
                this.dispatch(setFileEOLType('CRLF'))
                return
            }

            this.dispatch(startLoadFileAction())
            ipcRenderer.send('loadFile', {
                path
            })
        })

        ipcRenderer.on('newFileCreated', (e, d) => {
            const { TabsStore } = this.getState()
            const activeTab = TabsStore.tabs.find(tab => tab.isActive)

            // activeTab && activeTab.fullName && this.codem.setValue('')

            this.dispatch(
                updateTab(activeTab.id, {
                    displayName: d.displayName,
                    fullName: d.path
                })
            )
            this.saveContents()
        })

        ipcRenderer.on('check-initfile', (e, d) => {
            if (!d.path) {
                this.dispatch(
                    createNewTab(
                        tabFactory('Untitled', 'Untitled', true, false)
                    )
                )
                return
            }
            ipcRenderer.emit('newFileOpen', d)
        })
        ipcRenderer.send('check-initfile', {})
    }

    saveContents() {
        const { BottomStatusBarStore, TabsStore } = this.getState()
        const activeTab = TabsStore.tabs.find(tab => tab.isActive)
        const readable = new (require('stream')).Readable()
        readable.push(this.codem.getValue())
        readable.push(null)
        readable
            .on('data', data => {
                ipcRenderer.send('saveFileChunk', {
                    data: data,
                    path: activeTab.fullName,
                    encoding: BottomStatusBarStore.fileEncoding
                })
            })
            .on('end', () => {
                ipcRenderer.send('endSaveFileChunk')
            })
    }

    onDestroy() {
        if (this.activeTab) this.activeTab = null
        if (
            this.codem &&
            this.codem.getWrapperElement() &&
            document
                .querySelector('#editor-wrapper')
                .contains(this.codem.getWrapperElement())
        )
            document
                .querySelector('#editor-wrapper')
                .removeChild(this.codem.getWrapperElement())
    }

    render() {
        const { EditorStore, BottomStatusBarStore, TabsStore } = this.getState()

        if (TabsStore.tabs.length > 0) {
            if (document.querySelector('#editorPlaceholder'))
                document
                    .querySelector('#editor-wrapper')
                    .removeChild(document.querySelector('#editorPlaceholder'))

            const activeTab = TabsStore.tabs.find(tab => tab.isActive)
            if (activeTab) {
                if (!this.activeTab) {
                    this.onDestroy()
                    this.activeTab = activeTab
                    this.createEditorInstance()
                    ipcRenderer.emit('newFileOpen', {
                        path: activeTab.fullName,
                        displayName: activeTab.displayName
                    })
                } else if (this.activeTab.id !== activeTab.id) {
                    this.onDestroy()
                    this.activeTab = activeTab
                    this.createEditorInstance()
                    ipcRenderer.emit('newFileOpen', {
                        path: activeTab.fullName,
                        displayName: activeTab.displayName
                    })
                }
            }

            if (this.codem) {
                if (EditorStore.isSavingFile)
                    this.codem.setOption('readOnly', true)
                else this.codem.setOption('readOnly', false)

                if (EditorStore.shouldResetEditor) {
                    this.codem.setValue('')
                    this.codem.getDoc().clearHistory()
                    this.dispatch(toggleShouldEditorReset(false))
                }

                this.codem.setOption(
                    'lineSeparator',
                    BottomStatusBarStore.fileEndOfLineType === 'CRLF'
                        ? '\r\n'
                        : BottomStatusBarStore.fileEndOfLineType === 'LF'
                        ? '\n'
                        : BottomStatusBarStore.fileEndOfLineType === 'CR'
                        ? '\r'
                        : null
                )
            }
        } else {
            this.onDestroy()
            if (!document.querySelector('#editorPlaceholder')) {
                const placeholder = document.createElement('div')
                placeholder.setAttribute('id', 'editorPlaceholder')
                document
                    .querySelector('#editor-wrapper')
                    .insertBefore(
                        placeholder,
                        document.querySelector('#editor')
                    )
            }
        }
    }
}

export default EditorView
