import View from './View'
import { ipcRenderer } from 'electron'
import 'codemirror/lib/codemirror.css'
import Codemirror from 'codemirror/lib/codemirror'
import {
    startLoadFileAction,
    doneLoadFileAction,
    doneSaveFileAction,
    startSaveFileAction,
    toggleShouldEditorReset,
    createNewTab,
    setTabDirty,
    updateTab,
    setFileEOLType,
    activateTab,
    tabsIsLoadingFile,
    closeOpenTab,
    setFileEncodingType
} from '../actions'
import EditorStore from '../Stores/EditorStore'
import BottomStatusBarStore from '../Stores/BottomStatusBarStore'
import TabsStore, { tabFactory } from '../Stores/TabsStore'
import ConfirmDialogView from './ConfirmDialogView'
import Dispatcher from '../Dispatcher'

class EditorView extends View {
    static SCROLL_INFO_BY_TABS = {}

    constructor(dispatcher) {
        super(dispatcher)
        this.setUpUI = this.setUpUI.bind(this)
        this.setUpListeners = this.setUpListeners.bind(this)
        this.saveContents = this.saveContents.bind(this)
        this.createEditorInstance = this.createEditorInstance.bind(this)
        this.shouldCreateTab = this.shouldCreateTab.bind(this)

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

                if (activeTab.fullName === 'Untitled') {
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

        this.codem.on('scroll', cm => {
            if (this.activeTab) {
                EditorView.SCROLL_INFO_BY_TABS[
                    this.activeTab.id
                ] = cm.getScrollInfo()
            }
        })
    }

    setUpListeners() {
        window.addEventListener('keydown', e => {
            if (e.ctrlKey && e.keyCode === 84) {
                e.preventDefault()
                const { TabsStore } = this.getState()

                const tab = TabsStore.tabs.find(tab => tab.isActive)

                if (tab) {
                    if (tab.isDirty) {
                        const confirmDialog = ConfirmDialogView.create(
                            Dispatcher,
                            {
                                confirmMessage:
                                    'Tem a certesa que pretende mudar de ficheiro sem guardar?',
                                onConfirm: () => {
                                    this.dispatch(
                                        createNewTab(
                                            tabFactory(
                                                'Untitled',
                                                'Untitled',
                                                true,
                                                false,
                                                false
                                            )
                                        )
                                    )
                                    this.dispatch(setFileEOLType('CRLF'))
                                    this.dispatch(setFileEncodingType('UTF-8'))
                                    confirmDialog.onDestroy()
                                },
                                onCancel: () => confirmDialog.onDestroy()
                            }
                        )
                    } else {
                        this.dispatch(
                            createNewTab(
                                tabFactory(
                                    'Untitled',
                                    'Untitled',
                                    true,
                                    false,
                                    false
                                )
                            )
                        )
                        this.dispatch(setFileEOLType('CRLF'))
                        this.dispatch(setFileEncodingType('UTF-8'))
                    }
                }
            } else if (e.ctrlKey && e.keyCode === 87) {
                e.preventDefault()
                const { TabsStore } = this.getState()

                const tab = TabsStore.tabs.find(tab => tab.isActive)

                if (tab) {
                    if (tab.isDirty) {
                        const confirmDialog = ConfirmDialogView.create(
                            Dispatcher,
                            {
                                confirmMessage:
                                    'Tem a certesa que pretende fechar o ficheiro sem guardar?',
                                onConfirm: () => {
                                    if (TabsStore.tabs.length <= 1) {
                                        this.dispatch(setFileEOLType(''))
                                        this.dispatch(setFileEncodingType(''))
                                    }
                                    this.dispatch(closeOpenTab(tab.id))
                                    confirmDialog.onDestroy()
                                },
                                onCancel: () => confirmDialog.onDestroy()
                            }
                        )
                    } else {
                        if (TabsStore.tabs.length <= 1) {
                            this.dispatch(setFileEOLType(''))
                            this.dispatch(setFileEncodingType(''))
                        }
                        this.dispatch(closeOpenTab(tab.id))
                    }
                }
            }
        })
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
                const path = e.dataTransfer.items[0].getAsFile().path
                const displayName = e.dataTransfer.items[0]
                    .getAsFile()
                    .path.split(/(\\|\/)/g)
                    .pop()

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
            this.dispatch(tabsIsLoadingFile(false))
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

            if (this.activeTab) {
                const scrollInfo =
                    EditorView.SCROLL_INFO_BY_TABS[this.activeTab.id]

                if (scrollInfo)
                    this.codem.scrollTo(scrollInfo.left, scrollInfo.top)
            }
            this.dispatch(tabsIsLoadingFile(false))
        })

        ipcRenderer.on('newFileOpen', (e, d) => {
            const path = d && d.path ? d.path : e && e.path ? e.path : null
            const displayName =
                d && d.displayName
                    ? d.displayName
                    : e && e.displayName
                    ? e.displayName
                    : null

            if (!path || !displayName) {
                this.dispatch(setFileEOLType('CRLF'))
                return
            }

            if (displayName === 'Untitled' && path === 'Untitled') {
                this.shouldCreateTab(displayName, path, false)
                this.dispatch(setFileEOLType('CRLF'))
                this.dispatch(setFileEncodingType('UTF-8'))
                return
            }
            this.shouldCreateTab(displayName, path, true)
            this.dispatch(tabsIsLoadingFile(true))
            this.dispatch(startLoadFileAction())
            ipcRenderer.send('loadFile', {
                path
            })
        })

        ipcRenderer.on('newFileCreated', (e, d) => {
            this.dispatch(tabsIsLoadingFile(true))
            this.shouldCreateTab(d.displayName, d.path, true)
            this.saveContents()
        })

        ipcRenderer.on('check-initfile', (e, d) => {
            if (!d.path) {
                this.dispatch(
                    createNewTab(
                        tabFactory('Untitled', 'Untitled', true, false, false)
                    )
                )
                return
            }
            ipcRenderer.emit('newFileOpen', d)
        })
        ipcRenderer.send('check-initfile', {})
    }

    shouldCreateTab(displayName, fullName, isFile) {
        const { TabsStore } = this.getState()

        const alreadyATab = TabsStore.tabs.find(
            tab => tab.displayName === displayName && tab.fullName === fullName
        )

        if (
            alreadyATab &&
            alreadyATab.displayName === 'Untitled' &&
            alreadyATab.fullName === 'Untitled' &&
            !alreadyATab.isFile
        )
            return

        if (alreadyATab) {
            this.dispatch(activateTab(alreadyATab.id))
            return
        }

        const currTab = TabsStore.tabs.find(tab => tab.isActive)

        if (
            currTab &&
            currTab.displayName === 'Untitled' &&
            currTab.fullName === 'Untitled' &&
            !currTab.isFile
        ) {
            this.dispatch(updateTab(currTab.id, { displayName, fullName }))
            return
        }

        this.dispatch(
            createNewTab(tabFactory(displayName, fullName, true, false, isFile))
        )
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
                if (!this.activeTab || this.activeTab.id !== activeTab.id) {
                    console.log('destroy')
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
