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
    fileContentPrestine
} from '../actions'
import EditorStore from '../Stores/EditorStore'
import BottomStatusBarStore from '../Stores/BottomStatusBarStore'

class EditorView extends View {
    constructor(dispatcher) {
        super(dispatcher)

        this.setUpUI = this.setUpUI.bind(this)
        this.setUpListeners = this.setUpListeners.bind(this)
        this.saveContents = this.saveContents.bind(this)

        this.setUpUI()
        this.setUpListeners()

        this.render()
    }

    static create(...props) {
        return new EditorView(...props)
    }

    getStores() {
        return [EditorStore, BottomStatusBarStore]
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
                if (EditorStore.isSavingFile) return
                if (!EditorStore.isEditorDirty) return

                if (
                    !EditorStore.filePath ||
                    EditorStore.filePath === 'Untitled'
                ) {
                    this.dispatch(startSaveFileAction())
                    ipcRenderer.send('createFile')
                    return
                }

                this.dispatch(startSaveFileAction())
                this.saveContents()
            }
        })

        ipcRenderer.on('saveFileDone', () => {
            this.codem.getDoc().clearHistory()
            this.dispatch(doneSaveFileAction())
            this.dispatch(fileContentPrestine())
        })

        this.codem.on('change', (cm, e) => {
            const { EditorStore } = this.getState()
            if (EditorStore.isLoadingFile || EditorStore.shouldResetEditor)
                return
            if (cm.getDoc().historySize().undo > 0)
                this.dispatch(fileContentChangeAction())
            else this.dispatch(fileContentPrestine())
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
            EditorStore.filePath && this.codem.setValue('')
            this.dispatch(setFilePathAction(d.path))
            this.saveContents()
        })

        ipcRenderer.on('check-initfile', (e, d) => {
            if (!d.path) return
            ipcRenderer.emit('newFileOpen', d)
        })
        ipcRenderer.send('check-initfile', {})
    }

    saveContents() {
        const { BottomStatusBarStore, EditorStore } = this.getState()

        const readable = new (require('stream')).Readable()
        readable.push(this.codem.getValue())
        readable.push(null)
        readable
            .on('data', data => {
                ipcRenderer.send('saveFileChunk', {
                    data: data,
                    path: EditorStore.filePath,
                    encoding: BottomStatusBarStore.fileEncoding
                })
            })
            .on('end', () => {
                ipcRenderer.send('endSaveFileChunk')
            })
    }

    render() {
        const { EditorStore, BottomStatusBarStore } = this.getState()
        if (EditorStore.isSavingFile) this.codem.setOption('readOnly', true)
        else this.codem.setOption('readOnly', false)
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
}

export default EditorView
