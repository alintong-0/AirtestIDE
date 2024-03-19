# -*- coding: utf-8 -*-
import os
import re
import io
import json
import jinja2
import shutil
import airtest.report.report as report
from airtest.utils.logger import get_logger
from collections import defaultdict
from airtest.cli.info import get_script_info
from airtest.utils.compat import script_dir_name
from copy import deepcopy
LOGDIR = report.LOGDIR
HTML_FILE = report.HTML_FILE
PFM_LOG_PATTERN = r"log_pfm_(?P<serialno>.*)_(?P<time>\d{8}-\d{6})_(?P<package>[\w\.]*)\.log"

logger = get_logger("airtest")
old_report = report.LogToHtml.report


def print_file_name(filename):
    """
    把log_pfm_手机名_时间_packagename.log的文件名用正则转换出对应内容
    Args:
        filename:

    Returns:

    """
    pattern = re.compile(PFM_LOG_PATTERN)
    match = re.match(pattern, filename)
    if match:
        return {"serialno": match.group("serialno"),
                "time_package": match.group("time") + "_" + match.group("package")}
    else:
        return {"serialno": filename, "time_package": ""}


def new_report(self, template_name, output_file=None, record_list=None):
    """ 对airtest.report.report 进行补充，如果airtest的report模块有修改，需要对应修改本方法 """
    # TODO: 注意需要和airtest的report模块联动
    # 由于生成报告是在另外一个进程中，只能从环境变量里获取是否是IDE PRO版的信息
    if os.environ.get("IDEPRO") != "true":
        return old_report(self, template_name, output_file=output_file, record_list=record_list)
    # 先运行一遍老的report函数，将相关的路径都配置好
    if not self.script_name:
        path, self.script_name = script_dir_name(self.script_root)

    if self.export_dir:
        self.script_root, self.log_root = self._make_export_dir()
        # output_file可传入文件名，或绝对路径
        output_file = output_file if output_file and os.path.isabs(output_file) \
            else os.path.join(self.script_root, output_file or HTML_FILE)
        if not self.static_root.startswith("http"):
            self.static_root = "static/"

    if not record_list:
        record_list = [f for f in os.listdir(self.log_root) if f.endswith(".mp4")]

    if os.environ.get("IDEDEBUG") == "true":
        pfm_static_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), "pfm_html", "static")
    else:
        pfm_static_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), "pfm_html", "output", "static")

    template_file = os.path.join(os.path.dirname(pfm_static_path), "report_charts.html")
    # 如果需要导出报告，要将用到的静态文件copy到目标目录中，并修改引用路径
    if self.export_dir:
        copy_report_static_files(pfm_static_path, os.path.join(self.script_root, "static"))
        pfm_static_path = self.static_root

    # 从airtest的report_data中获取到生成的数据，再往上添加性能数据
    try:
        data = report.LogToHtml.report_data(self, output_file, record_list)
    except AttributeError:
        # 如果本地python环境的airtest未更新到最新版本
        logger.error("Please update the airtest version to 1.1.2 or higher.")
        return old_report(self, template_name, output_file=output_file, record_list=record_list)

    # 以下为性能数据定制内容
    pfm_data, avg_data, show_name = get_data_from_logroot(self.log_root)
    data['extra_block'] = gen_performance_charts_html(pfm_data, avg_data, pfm_static_path,
                                                      template_name=template_file,
                                                      show_names=show_name, lang=self.lang)

    return self._render(template_name, output_file, **data)


report.LogToHtml.report = new_report


def get_data_from_logroot(log_root_path):
    """
    从指定的log目录中，寻找可能有多个符合log文件名格式的性能数据记录文件，将他们按照手机设备号分类读取数据后返回结果
    Args:
        log_root_path: air脚本的运行log目录

    Returns: {"serialno1": {性能数据内容}}

    """
    pfm_data = {}
    avg_data = {}
    show_name = {}
    pfm_files = get_pfm_files(log_root_path)
    for filename, file_path in pfm_files.items():
        show_name[filename] = print_file_name(filename)
        pfm_data[filename], avg_data[filename] = get_performance_data(file_path)
    return pfm_data, avg_data, show_name


def average_values(value_list):
    """
    计算平均值，传入某一项内容的数值列表，必须要包含"value"这项内容
    Args:
        value_list: [{'name': 'battery_temperature', 'value': '28.0', 'time': 1571745936231},
        {'name': 'battery_temperature', 'value': '28.0', 'time': 1571745938283}]

    Returns: 平均值，精确到小数点后两位

    """
    filtered_list = list(filter(lambda x: x["value"] is not None, value_list))
    if not filtered_list:
        return 0

    def convert_to_float(f):
        try:
            return float(f)
        except ValueError:
            return 0
    # 这两个数据只需要记录总数，不需要记录平均值
    if value_list[0]["name"] == "jank" or value_list[0]["name"] == "bigjank":
        return sum(map(lambda x: convert_to_float(x["value"]), filtered_list))
    return round(sum(map(lambda x: convert_to_float(x["value"]), filtered_list)) / len(filtered_list), 2)


def get_performance_data(data_file):
    """
    读取性能数据log文件，将数据从json字符串转成dict，方便页面渲染
    Args:
        data_file: 性能数据log文件名，文件内容每行一个数据项，内容类似于{"name": "pss", "value": "49193", "time": 1557745436}

    Returns: {"性能数据分类名": [{数据项内容，其中time字段转换成毫秒}],
            "battery_temperature": [{"name": "battery_temperature", "value": "27.5", "time": 1557745438}, ]}
            以及平均值 {"分类名": 平均值}

    """
    data = defaultdict(list)
    avg_data = {}
    lastftime = 0 # 记录上一次的收集时间
    with open(data_file, "r") as f:
        for line in f.readlines():
            item = json.loads(line)
            item["time"] = item["time"]
            if item["name"] in ["pss", "net_flow"]:
                # 内存和流量数据除以1024
                item["value"] = round(float(item["value"]) / 1024, 2) if item["value"] else item["value"]
            
            # 帧数据需要重新生成，因为一段时间内，会收集到大量帧数据，把他们平均分配到某一个时间点上
            if item["name"] == "ftime":
                if lastftime == 0: # 第一次收集，需要特判
                    for i in range(0, len(item["value"])):
                        ti = deepcopy(item)
                        ti["time"] = (lastftime + (1000)/len(item["value"])*(i+1))
                        ti["value"] = str(item["value"][i])
                        data[item['name']].append(ti)
                else:
                    for i in range(0, len(item["value"])):
                        ti = deepcopy(item)
                        ti["time"] = (lastftime + (item["time"] - lastftime)/len(item["value"])*(i+1)) # 平均分配
                        ti["value"] = str(item["value"][i])
                        data[item['name']].append(ti)
                lastftime = item["time"]
                continue
            data[item['name']].append(item)
        for key in data.keys():
            avg_data[key] = average_values(data[key])
    if "traceback" in data:
        del data["traceback"]
    return dict(data), avg_data


def gen_performance_charts_html(pfm_data, average_data, static_root, template_name="report_charts.html",
                                output_file=None, show_names={}, lang="en_US",mark_area=[],screen_data={},show_img={}):
    """
    根据性能数据内容，用指定模板生成echarts的html内容
    Args:
        pfm_data: {""}
        average_data:
        static_root:
        template_name:
        output_file: 如果需要导出到文件，则传入输出的html文件的路径
        show_names: {"filename": {"serialno": 手机名称, "time_package"}, } 用于显示标题
        screen_data: {"报告名字":截图列表}
        mark_area: 打了标记的时间列表
        show_img: 是否显示截图

    Returns:

    """
    pfm_html_data = {
        "mark_area":mark_area,
        "screen_data":screen_data,
        "pfm_data": json.dumps(pfm_data),
        "average_data": average_data,
        "static_root": static_root,
        "show_names": show_names,
        "current_lang": "cn" if lang in ["zh_CN", "zh", "cn"] else "en",
        "show_img":show_img
    }
    env = jinja2.Environment(
        loader=jinja2.FileSystemLoader(os.path.dirname(template_name) or os.path.dirname(static_root)),
        extensions=(),
        autoescape=False
    )
    template = env.get_template(os.path.basename(template_name),
                                parent=os.path.dirname(template_name) if os.path.isabs(template_name) else None)
    html = template.render(**pfm_html_data)

    if output_file:
        with io.open(output_file, 'w', encoding="utf-8") as f:
            f.write(html)

    return html


def get_pfm_files(log_root):
    """
    从指定的目录里，查找符合"log_pfm_(?P<serialno>\w+).log"这个格式命名的文件，即为指定的性能log文件
    Args:
        log_root:

    Returns:

    """
    ret = {}
    for f in os.listdir(log_root):
        m = re.match(PFM_LOG_PATTERN, f)
        if m:
            ret[f] = os.path.join(log_root, f)
    return ret


def copy_report_static_files(src, dst):
    files = ["css/lightbox.min.css", "js/echarts/echarts.min.js", "js/echarts/dark.js",
             "js/reportCharts.js"]
    for f in files:
        dst_file = os.path.normpath(os.path.join(dst, f))
        if not os.path.exists(os.path.dirname(dst_file)):
            os.makedirs(os.path.dirname(dst_file), exist_ok=True)
        shutil.copyfile(os.path.join(src, f), dst_file)
