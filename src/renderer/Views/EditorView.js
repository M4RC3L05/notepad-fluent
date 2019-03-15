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
    setFilePathAction
} from '../actions'

class EditorView extends View {
    constructor(props) {
        super(props)

        this.dispatcher = props.dispatcher
        this.editorStore = props.editorStore

        this.setUpDependencies = this.setUpDependencies.bind(this)
        this.setUpUI = this.setUpUI.bind(this)
        this.setUpListeners = this.setUpListeners.bind(this)

        this.setUpDependencies()
        this.setUpUI()
        this.setUpListeners()

        this.render()
    }

    static create(props) {
        return new EditorView(props)
    }

    setUpDependencies() {
        this.editorStore.subscribe(this)
        this.dispatcher.subscribe(this.editorStore)
    }

    setUpUI() {
        this.editor = document.querySelector('#editor')
        this.codem = Codemirror.fromTextArea(this.editor, {
            mode: ''
        })
    }

    setUpListeners() {
        this.codem.on('keydown', (cm, e) => {
            if (e.keyCode === 83 && e.ctrlKey) {
                const editorState = this.editorStore.getState()
                if (!editorState.isEditorDirty) return

                if (!editorState.filePath) {
                    ipcRenderer.send('createFile')
                    return
                }

                this.dispatcher.dispatch(startSaveFileAction())
                ipcRenderer.send('saveFile', {
                    path: editorState.filePath,
                    content: cm.getValue()
                })
            }
        })

        ipcRenderer.on('saveFileDone', () => {
            this.dispatcher.dispatch(doneSaveFileAction())
        })

        this.codem.on('change', (cm, e) => {
            const editoState = this.editorStore.getState()
            if (editoState.isLoadingFile) return
            this.dispatcher.dispatch(fileContentChangeAction())
        })

        ipcRenderer.on('fileLoadChunk', (e, d) => {
            this.codem.replaceRange(
                d.data,
                Codemirror.Pos(this.codem.lastLine())
            )
        })

        ipcRenderer.on('fileLoadDone', (e, d) => {
            this.dispatcher.dispatch(doneLoadFileAction())
        })

        ipcRenderer.on('newFileOpen', (e, d) => {
            this.codem.setValue('')
            this.dispatcher.dispatch(setFilePathAction(d.path))
            this.dispatcher.dispatch(startLoadFileAction())
            ipcRenderer.send('loadFile', {
                path: this.editorStore.getState().filePath
            })
        })

        ipcRenderer.on('newFileCreated', (e, d) => {
            this.dispatcher.dispatch(setFilePathAction(d.path))
            ipcRenderer.send('saveFile', {
                path: this.editorStore.getState().filePath,
                content: this.codem.getValue() || ''
            })
        })
    }

    render() {
        const editroState = this.editorStore.getState()
        if (editroState.filePath) {
            editroState.isEditorDirty
                ? (document.title = `${editroState.filePath} *`)
                : (document.title = editroState.filePath)
        }
    }
}

export default EditorView
