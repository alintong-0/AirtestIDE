function initContextMenu(e, t) {
    var n = {};
    if (!(e in contextMenuTypes)) return !0;
    for (var o = contextMenuTypes[e], a = 0; a < o.length; a++) n[o[a]] = contextMenuItems[o[a]];
    $.contextMenu({
        selector: ".CodeMirror",
        autoHide: !0,
        items: n
    }), t || (t = "en_US"), toggleLanguage(t)
}

function toggleLanguage(e) {
    "zh_CN" == e ? ($(".en").hide(), $(".zh").show()) : ($(".zh").hide(), $(".en").show())
}
var contextMenuTypes = {
        EDITOR: ["undo", "redo", "copy", "paste", "debug", "switch_mode","sep_0","split","sep_1","ui_func","process_control_func",],
        LOG: ["copy", "clear"]
    },
    contextMenuItems = {
        undo: {
            name: '<span class="en">Undo</span><span class="zh">撤销</span>',
            callback: function() {
                editor.undo(), editor.focus()
            },
            icon: "undo",
            isHtmlName: !0,
            disabled: function() {
                return 0 === editor.doc.historySize().undo
            }
        },
        redo: {
            name: '<span class="en">Redo</span><span class="zh">重复</span>',
            callback: function() {
                editor.redo(), editor.focus()
            },
            icon: "redo",
            isHtmlName: !0,
            disabled: function() {
                return 0 === editor.doc.historySize().redo
            }
        },
        copy: {
            name: '<span class="en">Copy</span><span class="zh">复制</span>',
            disabled: function() {
                return !editor.doc.somethingSelected()
            },
            callback: function() {
                var e = editor.getDoc().getSelection();
                if (e.length > 0) {
                    var t = document.createElement("textarea");
                    t.value = e, document.body.appendChild(t), t.select();
                    try {
                        document.execCommand("copy"), -1 !== e.indexOf("Template") && qtbridge.copy(e)
                    } catch (n) {
                        console.log("unable to copy")
                    }
                    document.body.removeChild(t)
                }
            },
            icon: "copy",
            isHtmlName: !0
        },
        paste: {
            name: '<span class="en">Paste</span><span class="zh">粘贴</span>',
            callback: function() {
                qtbridge.getClipboardData(function(e) {
                    editor.focus(), -1 !== e.indexOf("Template") ? qtbridge.paste(e) : editor.addTextWithImageTest(e, [], !1)
                })
            },
            icon: "paste",
            isHtmlName: !0
        },
        clear: {
            name: '<span class="en">Clear All</span><span class="zh">清空</span>',
            callback: function() {
                editor.getDoc().setValue(""), qtbridge.clearContent()
            },
            isHtmlName: !0,
            icon: "delete"
        },
        debug: {
            name: '<span class="en">Run selected code</span><span class="zh">只运行选中代码</span>',
            callback: function() {
                var e = "";
                if (editor.doc.somethingSelected()) e = editor.getDoc().getSelection();
                else {
                    var t = editor.getCursor();
                    e = editor.getLine(t.line)
                }
                qtbridge.runSelectedCode(e)
            },
            isHtmlName: !0,
            icon: "debug"
        },
        switch_mode: {
            name: '<span class="en">Image render/Code</span><span class="zh">图片/代码模式切换</span>',
            callback: function() {
                var e = "code";
                e = "code" !== this.data("templateMode") ? "code" : "template", this.data("templateMode", e);
                var t = editor.getDoc().getValue();
                editor.getDoc().setValue(""), qtbridge.refreshContent(t, e)
            },
            isHtmlName: !0,
            icon: function(e, t, n) {
                return console.log("test", e, t, n), "code" !== $($(t).parent("ul").parent()[0]).find(".CodeMirror-wrap").data("templateMode") ? "context-menu-icon context-menu-icon-code" : "context-menu-icon context-menu-icon-template"
            }
        },
        sep_0: "---------",
        sep_1: "---------",
        split: {
            name: '<span class="en">-----The line between Func-----</span><span class="zh">-----以下为Nemo自定义方法-----</span>',
            callback: function() {
                
            },
            isHtmlName: !0,
            icon: ""
        },
        ui_func:{
            name:'UI方法',
            items:{
                start_hide_top_ui:{
                    name:'开始屏蔽顶层ui弹出',
                    callback: function() {
                
                    },
                    isHtmlName: !0,
                    icon: ""
                },
                end_hide_top_ui:{
                    name:'恢复顶层ui弹出',
                    callback: function() {
                
                    },
                    isHtmlName: !0,
                    icon: ""
                },
            }
        },
        process_control_func:{
            name:'流程控制方法',
            items:{
                code_func:{
                    name:'流程控制代码模板',
                    items:{
                        code_func_if:{
                            name:'条件判断',
                            callback: function() {
                        
                            },
                            isHtmlName: !0,
                            icon: ""
                        },
                    }
                },
                code_special_func:{
                    name:'拓展支持代码模板',
                    callback: function() {
                
                    },
                    isHtmlName: !0,
                    icon: ""
                },
            }
        },
    };