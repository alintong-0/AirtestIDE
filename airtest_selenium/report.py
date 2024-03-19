# -*- coding: utf-8 -*-
import os
from urllib.parse import unquote
import airtest.report.report as report

LOGDIR = "log"

old_trans_screen = report.LogToHtml._translate_screen
old_trans_desc = report.LogToHtml._translate_desc
old_trans_code = report.LogToHtml._translate_code

screen_func = ["find_element_by_xpath", "find_element_by_id", "find_element_by_name", "assert_exist",
               "back", "forward", "switch_to_new_tab", "switch_to_previous_tab", "get",
               "click", "send_keys", "snapshot"]

second_screen_func = ["click", "send_keys"]
other_func = []

def new_trans_screen(self, step, code):
    trans = old_trans_screen(self, step, code)
    if "name" in step['data'] and step['data']["name"] in screen_func:
        screen = {
            "src": None,
            "rect": [],
            "pos": [],
            "vector": [],
            "confidence": None,
        }

        src = ""
        if step["data"]["name"] in second_screen_func:
            res = step["data"]['ret']
            src = res["screen"]
            if "pos" in res:
                screen["pos"] = res["pos"]

        for item in step["__children__"]:
            if item["data"]["name"] in ["_gen_screen_log", "try_log_screen"]:
                res = item["data"]['ret']
                src = res["screen"]
                if "pos" in res:
                    screen["pos"] = res["pos"]
                break

        if self.export_dir and src:
            src = os.path.join(LOGDIR, src)
        screen["src"] = src

        return screen
    else:
        if step["data"]["name"] in ["airtest_touch"]:
            # 将图像匹配得到的pos修正为最终pos
            display_pos = None
            if self.is_pos(step["data"].get("ret")):
                display_pos = step["data"]["ret"]
            elif self.is_pos(step["data"]["call_args"].get("v")):
                display_pos = step["data"]["call_args"]["v"]
            if display_pos:
                trans["pos"] = [display_pos]
        return trans


def new_translate_desc(self, step, code):
    trans = old_trans_desc(self, step, code)
    if "name" in step['data'] and (step['data']["name"] in screen_func or step["data"]["name"] in other_func):
        name = step["data"]["name"]
        args = {}
        url = ""
        for item in code["args"]:
            if (name=='get'):
                url = unquote(item['value'])
                item['value'] = "<a href='%s' target='_blank' style='color:cornflowerblue'>%s</a>" % (url, url)
            args[item['key']] = item['value']
        desc = {
            "find_element_by_xpath": lambda: u"Find element by xpath: %s" % args.get("xpath"),
            "find_element_by_id": lambda: u"Find element by id: %s" % args.get("id"),
            "find_element_by_name": lambda: u"Find element by name: %s" % args.get("name"),
            "assert_exist": u"Assert element exists.",
            "click": u"Click the element that been found.",
            "send_keys": u"Send some text and keyboard event to the element that been found.",
            "get": lambda: u"Get the web address: %s" % (url),
            "switch_to_last_window": u"Switch to the last tab.",
            "switch_to_latest_window": u"Switch to the new tab.",
            "back": u"Back to the last page.",
            "forward": u"Forward to the next page.",
            "snapshot": lambda: (u"Screenshot description: %s" % args.get("msg")) if args.get("msg") else u"Snapshot current page",
        }

        desc_zh = {
            "find_element_by_xpath": lambda: u"寻找指定页面元素: \"%s\"" % args.get("xpath"),
            "find_element_by_id": lambda: u"寻找指定页面元素: \"%s\"" % args.get("id"),
            "find_element_by_name": lambda: u"寻找指定页面元素: \"%s\"" % args.get("name"),
            "assert_exist": u"断言页面元素存在.",
            "click": u"点击找到的页面元素.",
            "send_keys": u"传送文本\"%s\"到选中文本框." % (args.get("text", "")),
            "get": lambda: u"访问网络地址: %s" % (url),
            "switch_to_last_window": u"切换到上一个标签页.",
            "switch_to_latest_window": u"切换到最新标签页.",
            "back": u"后退到上一个页面.",
            "forward": u"前进到下一个页面.",
            "snapshot": lambda: (u"截图描述: %s" % args.get("msg")) if args.get("msg") else u"截取当前页面"
        }

        if self.lang == 'zh':
            desc = desc_zh
        ret = desc.get(name)
        if callable(ret):
            ret = ret()
        return ret
    else:
        return trans


def new_translate_code(self, step):
    trans = old_trans_code(self, step)
    if trans:
        for idx, item in enumerate(trans["args"]):
            if item["key"] == "self":
                trans["args"].pop(idx)
    return trans


report.LogToHtml._translate_screen = new_trans_screen
report.LogToHtml._translate_desc = new_translate_desc
report.LogToHtml._translate_code = new_translate_code

