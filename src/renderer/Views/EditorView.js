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
    toggleShouldEditorReset
} from '../actions'
import EditorStore from '../Stores/EditorStore'

class EditorView extends View {
    constructor(dispatcher) {
        super(dispatcher)

        this.setUpUI = this.setUpUI.bind(this)
        this.setUpListeners = this.setUpListeners.bind(this)

        this.setUpUI()
        this.setUpListeners()

        this.render()
    }

    static create(...props) {
        return new EditorView(...props)
    }

    getStores() {
        return [EditorStore]
    }

    setUpUI() {
        this.editor = document.querySelector('#editor')
        this.editorWrapper = document.querySelector('#editor-wrapper')
        this.codem = Codemirror.fromTextArea(this.editor, {
            mode: '',
            dragDrop: false,
            lineNumbers: false
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
            // this.editorWrapper.style.filter = 'blur(0px)'
        })
        this.editorWrapper.addEventListener('drop', e => {
            if (e.dataTransfer.items) {
                ipcRenderer.emit('newFileOpen', {
                    path: e.dataTransfer.items[0].getAsFile().path
                })
            }

            this.editorWrapper.classList.remove('file-hover')
        })

        this.codem.on('keydown', (cm, e) => {
            if (e.keyCode === 83 && e.ctrlKey) {
                const { EditorStore } = this.getState()
                if (!EditorStore.isEditorDirty) return

                if (
                    !EditorStore.filePath ||
                    EditorStore.filePath === 'Untitled'
                ) {
                    ipcRenderer.send('createFile')
                    return
                }

                this.dispatch(startSaveFileAction())
                ipcRenderer.send('saveFile', {
                    path: EditorStore.filePath,
                    content: cm.getValue(),
                    encoding: EditorStore.fileEncoding
                })
            }
        })

        ipcRenderer.on('saveFileDone', () => {
            this.dispatch(doneSaveFileAction())
        })

        this.codem.on('change', (cm, e) => {
            const { EditorStore } = this.getState()
            if (EditorStore.isLoadingFile || EditorStore.shouldResetEditor)
                return
            this.dispatch(fileContentChangeAction())
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
            this.dispatch(doneLoadFileAction())
        })

        ipcRenderer.on('newFileOpen', (e, d) => {
            const path = d && d.path ? d.path : e && e.path ? e.path : null

            if (!path) return

            this.dispatch(toggleShouldEditorReset(true))
            this.dispatch(setFilePathAction(path))
            this.dispatch(startLoadFileAction())
            const { EditorStore } = this.getState()
            ipcRenderer.send('loadFile', {
                path: EditorStore.filePath
            })
        })

        ipcRenderer.on('newFileCreated', (e, d) => {
            const { EditorStore } = this.getState()
            const textToStart = !EditorStore.filePath
                ? this.codem.getValue()
                : ''
            EditorStore.filePath && this.codem.setValue('')
            this.dispatch(setFilePathAction(d.path))
            ipcRenderer.send('saveFile', {
                path: EditorStore.filePath,
                content: textToStart
            })
        })
    }

    render() {
        const { EditorStore } = this.getState()

        if (EditorStore.filePath) {
            EditorStore.isEditorDirty
                ? this.dispatch(setNewTitleBarText(`* ${EditorStore.filePath}`))
                : this.dispatch(setNewTitleBarText(`${EditorStore.filePath}`))
        } else {
            EditorStore.isEditorDirty && !EditorStore.isLoadingFile
                ? this.dispatch(setNewTitleBarText(`Untitled`))
                : this.dispatch(setNewTitleBarText(`Notepad Fluent`))
        }

        if (EditorStore.shouldResetEditor) {
            this.codem.setValue('')
            this.dispatch(toggleShouldEditorReset(false))
        }
    }
}

export default EditorView
