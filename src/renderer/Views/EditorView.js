import View from './View'
import { ipcRenderer } from 'electron'
import 'codemirror/lib/codemirror.css'
import codemirror from 'codemirror/lib/codemirror'

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
        this.codem = codemirror.fromTextArea(this.editor, {
            mode: 'javascript'
        })
    }

    setUpListeners() {
        this.codem.on('keydown', (cm, e) => {
            if (e.keyCode === 83 && e.ctrlKey) {
                console.log('saving')

                ipcRenderer.send('saveFile', {
                    path:
                        'C:\\Users\\joaob\\Desktop\\DevInProg\\notepad-fluent\\abc.txt',
                    content: cm.getValue()
                })
            }
        })
        ipcRenderer.send('loadFile', {
            path:
                'C:\\Users\\joaob\\Desktop\\DevInProg\\notepad-fluent\\abc.txt'
        })
        ipcRenderer.on('fileLoaded', (e, d) => {
            this.codem.doc.setValue(d.data)
        })
    }

    render() {}
}

export default EditorView
