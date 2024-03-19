function changeScrollTheme() {
    qtbridge.currentSkin(function(e) {
        "DarkShadow" == e ? (globalVariable.current_theme = "DarkShadow", $(".CodeMirror-overlayscroll-vertical div").removeClass("CodeMirror-scroll-Moonlight"), $(".CodeMirror-overlayscroll-vertical div").addClass("CodeMirror-scroll-DarkShadow")) : (globalVariable.current_theme = "MoonLight", $(".CodeMirror-overlayscroll-vertical div").removeClass("CodeMirror-scroll-DarkShadow"), $(".CodeMirror-overlayscroll-vertical div").addClass("CodeMirror-scroll-Moonlight"))
    })
}

function init_editor_bridge(e) {
    var n = {
            SIMPLE: ["insert_code", "insert_code_line", "set_content", "get_content", "get_content", "font_size_changed"],
            LOG: ["insert_code", "insert_code_line", "set_content", "get_content", "toggle_running", "font_size_changed", "menu_lang_changed", "insert_help_info", "theme_changed", "insert_code_with_image"],
            EDITOR: ["insert_code", "insert_code_line", "set_content", "get_content", "get_content", "font_size_changed", "active_line", "toggle_running", "confirm_insert_code", "confirm_insert_code_smart", "replace_code", "menu_lang_changed", "theme_changed", "insert_code_with_image"]
        },
        o = n[e];
    $.each(o, function(e, n) {
        qtbridge[editor_bridge_dict[n].signal].connect(editor_bridge_dict[n].func)
    })
}

function init_editor_options(e, n, o) {
    var i = {
        EDITOR: {
            lineNumbers: !0,
            lineWrapping: !0,
            mode: {
                name: "python",
                version: 2,
                singleLineStringErrors: !1
            },
            indentUnit: 4,
            fullScreen: !0,
            styleActiveLine: !0,
            matchBrackets: !0,
            scrollbarStyle: "overlay",
            foldGutter: !0,
            gutters: ["CodeMirror-linenumbers", "CodeMirror-foldgutter"],
            readOnly: !1
        },
        LOG: {
            lineWrapping: !0,
            mode: "consolelog",
            fullScreen: !0,
            styleActiveLine: !1,
            scrollbarStyle: "overlay",
            foldGutter: !1,
            readOnly: !0,
            cursorBlinkRate: -1
        },
        SIMPLE: {
            lineNumbers: !0,
            lineWrapping: !0,
            mode: {
                name: "python",
                version: 2,
                singleLineStringErrors: !1
            },
            indentUnit: 4,
            fullScreen: !0,
            styleActiveLine: !0,
            matchBrackets: !0,
            scrollbarStyle: "overlay",
            foldGutter: !0,
            gutters: ["CodeMirror-linenumbers", "CodeMirror-foldgutter"],
            readOnly: !1
        }
    };
    if (i[n]) var t = i[n];
    else var t = i.EDITOR;
    for (var r in t) e.setOption(r, t[r]);
    e.setOption("theme", qtbridge.theme), changeScrollTheme(), initContextMenu(n, o)
}
globalVariable = {
    active_line: 0,
    running_failed: !1,
    current_theme: "DarkShadow"
}, MAX_LOG_LINE = 3e3, MAX_LOG_LINE_SHOW = MAX_LOG_LINE + 3, editor_bridge_dict = {
    insert_code: {
        signal: "SIGNAL_INSERT_CODE",
        func: function(e) {
            editor.addTextWithImage(e, !1, null), pos = editor.getCursor(), pos.line > MAX_LOG_LINE_SHOW && editor.replaceRange("", {
                line: 3,
                ch: 0
            }, {
                line: pos.line - MAX_LOG_LINE,
                ch: 0
            }), editor.execCommand("goDocEnd")
        }
    },
    insert_code_smart: {
        signal: "SIGNAL_INSERT_CODE_SMART",
        func: function(e, n, o) {
            o = "undefined" != typeof o ? o : !1, editor.smartAddText(e, !0, n, o)
        }
    },
    insert_code_line: {
        signal: "SIGNAL_INSERT_CODE_LINE",
        func: function(e) {
            editor.addTextWithImage(e, !0, null)
        }
    },
    insert_code_with_image: {
        signal: "SIGNAL_INSERT_CODE_WITH_IMAGE",
        func: function(e, n, o, i) {
            void 0 == o && (o = !0), "code" == $(".CodeMirror-wrap").data("templateMode") ? editor.addText(e, o) : editor.addTextWithImageTest(e, n, o), i && (pos = editor.getCursor(), pos.line > MAX_LOG_LINE_SHOW && editor.replaceRange("", {
                line: 3,
                ch: 0
            }, {
                line: pos.line - MAX_LOG_LINE,
                ch: 0
            }), editor.execCommand("goDocEnd"))
        }
    },
    insert_help_info: {
        signal: "SIGNAL_INSERT_HELP_INFO",
        func: function(e) {
            editor.addTextWithLink(e, !0, null)
        }
    },
    set_content: {
        signal: "SIGNAL_EDITOR_SET_CONTENT",
        func: function(e, n, o) {
            editor.getDoc().setValue(""), editor.addTextWithImageTest(e, n, !1), editor.execCommand("goDocEnd"), o && editor.getDoc().clearHistory()
        }
    },
    get_content: {
        signal: "SIGNAL_JS_GET_CONTENT",
        func: function() {
            var e = editor.getDoc().getValue();
            qtbridge.content = e
        }
    },
    active_line: {
        signal: "SIGNAL_ACTIVE_LINE",
        func: function(e, n) {
            var o = "line-running-" + globalVariable.current_theme;
            editor.removeLineRunning(), n && (o = "line-error-" + globalVariable.current_theme, (0 === e || e >= editor.lineCount()) && (e = globalVariable.active_line + 1), globalVariable.running_failed = !0), editor.getDoc().addLineClass(e - 1, "background", o), globalVariable.active_line = e - 1, editor.scrollIntoView({
                line: e - 1,
                ch: 0
            })
        }
    },
    toggle_running: {
        signal: "SIGNAL_TOGGLE_RUNNING",
        func: function(e) {
            e ? (editor.setOption("styleActiveLine", !1), editor.removeLineRunning(), editor.removeLineError(), globalVariable.active_line = 0, "LOG" === qtbridge.mode && editor.setOption("readOnly", "nocursor")) : (editor.removeLineRunning(), editor.setOption("styleActiveLine", !0), "LOG" === qtbridge.mode && editor.setOption("readOnly", !1))
        }
    },
    confirm_insert_code: {
        signal: "SIGNAL_CONFIRM_INSERT_CODE",
        func: function(e) {
            $(".confirmInsertDiv").length > 0 && $(".confirmInsertDiv").closest(".CodeMirror-dialog").remove(), confirmDialog(editor, doReplaceConfirm, "Insert", [
                function() {
                    var n = editor.getDoc().getCursor();
                    0 !== n.ch && (e = "\n" + e), editor.addTextWithImage(e, !0, null), editor.execCommand("goLineEnd")
                },
                function() {
                    console.log("poco log")
                }
            ])
        }
    },
    confirm_insert_code_smart: {
        signal: "SIGNAL_CONFIRM_INSERT_CODE_SMART",
        func: function(e, n, o) {
            $(".confirmInsertDiv").length > 0 && $(".confirmInsertDiv").closest(".CodeMirror-dialog").remove(), confirmDialog(editor, doReplaceConfirm, "Insert", [
                function() {
                    var i = editor.getDoc().getCursor();
                    0 !== i.ch && (e = "\n" + e), editor.smartAddText(e, !0, n, o)
                },
                function() {
                    console.log("poco log")
                }
            ])
        }
    },
    replace_code: {
        signal: "SIGNAL_REPLACE_CODE",
        func: function(e, n, o, i) {
            editor.getDoc().replaceRange("", o, i), editor.setCursor(o), editor.addTextWithImageTest(e, n)
        }
    },
    font_size_changed: {
        signal: "SIGNAL_FONT_SIZE_CHANGED",
        func: function() {
            var e = qtbridge.fontSize;
            $("body").css("fontSize", e), editor.refresh()
        }
    },
    menu_lang_changed: {
        signal: "SIGNAL_CONTEXTMENU_LANG",
        func: function() {
            var e = qtbridge.menuLang;
            toggleLanguage(e)
        }
    },
    theme_changed: {
        signal: "SIGNAL_THEME_CHANGED",
        func: function() {
            var e = qtbridge.theme;
            changeScrollTheme(), editor.setOption("theme", e)
        }
    }
};