var editor = CodeMirror(document.body)
var imgMarkerList = []
var debugWebSocket = null
function confirmDialog(cm, text, shortText, fs) {
    if (cm.openConfirm) {
        cm.openConfirm(text, fs)
    } else {
        if (confirm(shortText)) {
            fs[0]()
        }
    }
}
var doReplaceConfirm =
    "<div class='confirmInsertDiv'> Poco mode has changed. Do you want to insert poco init code at the current cursor position? <a class='dialogBtn'>Yes</a> <a class='dialogBtn'>No</a> </div>"
$(function () {
    CodeMirror.registerHelper('hint', 'python', CodeMirror.pythonHint)
    var typingTimer
    var doneTypingInterval = 200
    editor.on('keyup', function (cm, event) {
        clearTimeout(typingTimer)
        typingTimer = setTimeout(function () {
            doneTyping(cm, event)
        }, doneTypingInterval)
    })

    function doneTyping(cm, event) {
        if (!editor.state.completionActive && event.keyCode != 13 && event.keyCode != 27) {
            editor.removeLineError()
            var cursor = editor.getCursor()
            var line = cm.getDoc().getLine(cursor.line)
            var moa_regexp = /((touch|swipe)\(Template\(.*\)\))(,\s*.*)*\)/g
            var match = moa_regexp.exec(line)
            if (match && match[2]) {
                if (cursor.ch > match.index + match[1].length && cursor.ch < match.index + match[0].length) {
                    cm.showHint({
                        hint: CodeMirror.hint.airtest,
                        completeSingle: false,
                    })
                }
            } else {
                var token = editor.getTokenAt(cursor)
                var string = ''
                if (token.string.match(/^[.`\w@]\w*$/)) {
                    string = token.string
                }
                if (string.length > 0) {
                    if (qtbridge.enableAutoComplete != '0') {
                        cm.showHint({
                            hint: CodeMirror.hint.jedi,
                            completeSingle: false,
                        })
                    } else {
                        cm.showHint({
                            hint: CodeMirror.hint.poco,
                            completeSingle: false,
                        })
                    }
                }
            }
        }
    }
    editor.removeLineError = function () {
        var count = editor.lineCount()
        for (var i = 0; i < count; i++) {
            var lineInfo = editor.lineInfo(i)
            if (
                lineInfo.bgClass &&
                (lineInfo.bgClass.indexOf('line-error-MoonLight') > -1 ||
                    lineInfo.bgClass.indexOf('line-error-DarkShadow') > -1)
            ) {
                editor.getDoc().removeLineClass(i, 'background', 'line-error-MoonLight')
                editor.getDoc().removeLineClass(i, 'background', 'line-error-DarkShadow')
            }
        }
    }
    editor.removeLineRunning = function () {
        var count = editor.lineCount()
        for (var i = 0; i < count; i++) {
            var lineInfo = editor.lineInfo(i)
            if (
                lineInfo.bgClass &&
                (lineInfo.bgClass.indexOf('line-running-MoonLight') > -1 ||
                    lineInfo.bgClass.indexOf('line-running-DarkShadow') > -1)
            ) {
                editor.getDoc().removeLineClass(i, 'background', 'line-running-MoonLight')
                editor.getDoc().removeLineClass(i, 'background', 'line-running-DarkShadow')
            }
        }
    }
    editor.addText = function (content, newline, pos) {
        editor.removeLineError()
        if (newline) {
            content += '\n'
        }
        if (!pos) {
            pos = editor.getCursor()
        }
        editor.doc.replaceRange(content, pos, pos)
        if (newline) {
            editor.setCursor({
                line: pos.line + content.split(/\r\n|\r|\n/).length - 1,
                ch: 0,
            })
        } else {
            editor.setCursor({
                line: pos.line + content.split(/\r\n|\r|\n/).length - 1,
                ch: 0,
            })
            editor.execCommand('goLineEnd')
        }
        editor.focus()
    }
    editor.smartAddText = function (content, newline, where, forceInsert) {
        newline = typeof newline !== 'undefined' ? newline : true
        forceInsert = typeof forceInsert !== 'undefined' ? forceInsert : false
        editorText = editor.getDoc().getValue()
        console.log('Nemo smartAddText', content, newline, where, forceInsert, editorText)
        if (!editorText.includes(content) || forceInsert) {
            editor.removeLineError()
            if (newline) {
                content += '\n'
            }
            if (!editorText.includes(where)) {
                editor.addText(content, newline, null)
            } else {
                pos = 0
                lines = editor.doc.eachLine(function (line) {
                    if (editor.doc.lineInfo(line).text.includes(where)) {
                        pos = {
                            line: editor.doc.lineInfo(line).line + 1,
                            ch: 0,
                        }
                    }
                })
                newContent = '\n' + content
                editor.doc.replaceRange(newContent, pos, pos)
                var startLine = pos.line
                if (newline) {
                    editor.setCursor({
                        line: pos.line + content.split(/\r\n|\r|\n/).length,
                        ch: 0,
                    })
                } else {
                    editor.setCursor({
                        line: pos.line + content.split(/\r\n|\r|\n/).length - 1,
                        ch: 0,
                    })
                    editor.execCommand('goLineEnd')
                }
                editor.scrollIntoView({
                    line: startLine,
                    ch: 0,
                })
                editor.focus()
            }
        }
    }
    editor.addTextWithImage = function (content, newline, pos) {
        var cursorPos = editor.getCursor()
        editor.addText(content, newline, pos)
        var moa_regexp = /Template\(([\u4e00-\u9fa5\w\s\+\:\/\\\._-]*\.png)(.*?[\)|\]]){0,1}\)/g
        var match = moa_regexp.exec(content)
        var img_list = new Array()
        while (match !== null && match.length > 1) {
            var img = document.createElement('img')
            img.setAttribute('class', 'imgClass')
            img_list.push(img)
            img.setAttribute('src', match[1])
            img.setAttribute('alt', match[1])
            img.setAttribute('title', match[1])
            var pos_start = editor.findPosH(cursorPos, match.index, 'char')
            var moa_length = match[0].length
            var pos_new_end = editor.findPosH(pos_start, moa_length, 'char')
            ;(function (pos_start, pos_end, img) {
                setTimeout(function () {
                    markCroppedImage(pos_start, pos_end, img)
                }, 1)
            })(pos_start, pos_new_end, img)
            match = moa_regexp.exec(content)
        }
    }
    editor.addTextWithImageTest = function (content, imageList, newline) {
        var cursorPos = editor.getCursor()
        editor.addText(content, newline, null)
        for (var i = 0; i < imageList.length; i++) {
            var pos_start = editor.findPosH(cursorPos, imageList[i][1][0], 'char')
            var pos_end = editor.findPosH(cursorPos, imageList[i][1][1], 'char')
            var img = document.createElement('img')
            img.setAttribute('class', 'imgClass')
            img.setAttribute('src', imageList[i][0])
            img.setAttribute('alt', imageList[i][0])
            img.setAttribute('title', imageList[i][0])
            img.setAttribute('data-start', pos_start)
            img.setAttribute('data-end', pos_end)
            ;(function (pos_start, pos_end, img) {
                setTimeout(function () {
                    markCroppedImage(pos_start, pos_end, img)
                }, 1)
            })(pos_start, pos_end, img)
        }
    }
    editor.addTextWithLink = function (content, newline, pos) {
        var cursorPos = editor.getCursor()
        editor.addText(content, newline, pos)
        var http_regexp = /\[([\u4e00-\u9fa5\w\s]*)\]\((http.*)\)/g
        var match = http_regexp.exec(content)
        while (match !== null && match.length > 1) {
            var link = document.createElement('a')
            var link_name = document.createTextNode(match[1])
            link.setAttribute('href', match[2])
            link.setAttribute('class', 'helpinfo')
            link.appendChild(link_name)
            link.onclick = function () {
                event.preventDefault()
                qtbridge.openLink($(this).attr('href'))
                return false
            }
            var pos_start = editor.findPosH(cursorPos, match.index, 'char')
            var moa_length = match[0].length
            var pos_new_end = editor.findPosH(pos_start, moa_length, 'char')
            editor.doc.markText(pos_start, pos_new_end, {
                className: 'link',
                replacedWith: link,
            })
            match = http_regexp.exec(content)
        }
    }
    editor.on('copy', function (ins, e) {
        var text = ins.getSelection()
        if (text.indexOf('Template') !== -1) {
            qtbridge.copy(text)
        }
    })
    editor.on('paste', function (ins, e) {
        var text = e.clipboardData.getData('Text')
        if (text.indexOf('Template') !== -1) {
            e.preventDefault()
            qtbridge.paste(text)
        }
    })
    editor.on('change', function (ins, e) {
        var content = ins.getDoc().getValue()
        qtbridge.content = content
    })

    function markCroppedImage(pos_start, pos_end, img) {
        var thisMarker = editor.doc.markText(pos_start, pos_end, {
            className: 'imgEditor',
            replacedWith: img,
            readonly: true,
        })
        imgMarkerList.push(thisMarker)
    }

    function addComment(cm) {
        var ret = []
        var comment = 0
        var comment_ret = []
        var cursor_start = editor.getCursor(true)
        var cursor_end = editor.getCursor(false)

        function del_comment(text) {
            return text.replace(/#\s{0,1}/, '')
        }

        function add_comment(text, indent) {
            if (typeof indent === 'undefined') {
                indent = 0
            }
            var start = text.search(/\S|$/)
            if (start > indent && indent >= 0) {
                return ' '.repeat(indent) + '# ' + text.substring(indent)
            } else {
                if (start > 0) {
                    return ' '.repeat(start) + '# ' + text.substring(start)
                } else {
                    return '# ' + text
                }
            }
        }
        var section_indent = undefined
        for (var i = cursor_start.line; i <= cursor_end.line; i++) {
            var indent = cm.getLine(i).search(/\S|$/)
            if (typeof section_indent === 'undefined') {
                section_indent = indent
            } else {
                if (indent < section_indent && indent >= 0) {
                    section_indent = indent
                }
            }
        }
        for (var i = cursor_start.line; i <= cursor_end.line; i++) {
            var text = cm.getLine(i)
            var s = $.trim(text)
            if (s.length > 0 && s[0] === '#') {
                ret.push(del_comment(text))
                comment += 1
            } else {
                ret.push(add_comment(text, section_indent))
            }
            comment_ret.push(add_comment(text, section_indent))
        }
        cm.replaceRange(
            '\n',
            {
                line: cursor_start.line,
                ch: 0,
            },
            {
                line: cursor_end.line + 1,
                ch: 0,
            },
        )
        cm.setCursor({
            line: cursor_start.line,
            ch: 0,
        })
        if (comment == ret.length || comment == 0) {
            cm.addTextWithImage(ret.join('\n'))
        } else {
            cm.addTextWithImage(comment_ret.join('\n'))
        }
        cm.setCursor({
            line: cursor_start.line,
            ch: 0,
        })
    }
    editor.addKeyMap({
        Tab: function (cm) {
            if (cm.somethingSelected()) {
                var sel = editor.getSelection('\n')
                if (
                    sel.length > 0 &&
                    (sel.indexOf('\n') > -1 || sel.length === cm.getLine(cm.getCursor().line).length)
                ) {
                    cm.indentSelection('add')
                    return
                }
            }
            if (cm.options.indentWithTabs) {
                cm.execCommand('insertTab')
            } else {
                cm.execCommand('insertSoftTab')
            }
        },
        'Shift-Tab': function (cm) {
            cm.indentSelection('subtract')
        },
        'Ctrl-/': function (cm) {
            cm.execCommand('toggleComment')
        },
        'Cmd-/': function (cm) {
            cm.execCommand('toggleComment')
        },
    })
    CodeMirror.defineSimpleMode('consolelog', {
        start: [
            {
                regex: /\[\w+\]|\<\w+\>/,
                token: 'type',
            },
            {
                regex: /"(?:[^\\]|\\.)*?(?:"|$)/,
                token: 'string',
            },
            {
                regex: /\[(\d|\:)+\]/,
                token: 'variable-2',
            },
            {
                regex: /(?:Traceback|(\w+)Error)\b/,
                token: 'error',
            },
            {
                regex: /\b(?:def|var|return|if|for|while|else|do|this|python|exec|not)\b/,
                token: 'keyword',
            },
            {
                regex: /0x[a-f\d]+|[-+]?(?:\.\d+|\d+\.?\d*)(?:e[-+]?\d+)?/i,
                token: 'number',
            },
            {
                regex: />>>/,
                token: 'atom',
            },
            {
                regex: /\sin\b/,
                token: 'keyword',
            },
            {
                regex: /\s*\w+\s+(?=\:)/,
                token: 'keyword',
            },
            {
                regex: /[\u4e00-\u9fa5]+(?=\:)/,
                token: 'variable-3',
            },
        ],
    })
    if (typeof qt !== 'undefined') {
        new QWebChannel(qt.webChannelTransport, function (channel) {
            window.qtbridge = channel.objects.qtbridge
            init_editor_options(editor, qtbridge.mode, qtbridge.menuLang)
            var fontSize = qtbridge.fontSize
            $('body').css('fontSize', fontSize)
            editor.refresh()
            init_editor_bridge(qtbridge.mode)
            //定义窗口初始化成功事件
            window.windowMode = qtbridge.mode
            const windowModeInit = new Event('windowModeInit', {
                bubbles: true, // 是否冒泡
                cancelable: false, // 是否可以取消
            })

            // 在文档中触发该事件
            window.document.dispatchEvent(windowModeInit)
            qtbridge.registrationFinished()
        })
    }
    editor.on('dblclick', function (ins, e) {
        if (e.target) {
            var target = $(e.target)
            if (target.attr('class') === 'imgClass') {
                var lineCh = ins.coordsChar({
                    left: e.clientX,
                    top: e.clientY,
                })
                var line = ins.getLine(lineCh.line)
                var from = {
                    line: lineCh.line,
                    ch: 0,
                }
                var to = {
                    line: lineCh.line,
                    ch: line.length,
                }
                var imgList = imgMarkerList.filter(function (img) {
                    return img.replacedWith == target.context
                })
                for (var i = 0; i < imgList.length; i++) {
                    var pos = imgList[i].find()
                    if (
                        pos.from.line == lineCh.line &&
                        pos.from.ch <= lineCh.ch &&
                        pos.to.line == lineCh.line &&
                        pos.to.ch >= lineCh.ch
                    ) {
                        line = editor.getRange(pos.from, pos.to)
                        qtbridge.modify_img(line, pos.from, pos.to)
                        return
                    }
                }
                qtbridge.modify_img(line, from, to)
            }
        }
    })
})
window.editorInstance = editor
