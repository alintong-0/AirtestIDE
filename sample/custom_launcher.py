#!/usr/bin/env python
# -*- coding: utf-8 -*-

"""This is a sample launcher file."""
import sys
import logging
from airtest.cli.runner import run_script
from airtest.cli.parser import runner_parser
from airtest.core.settings import Settings as ST

if not globals().get("AirtestCase"):
    from airtest.cli.runner import AirtestCase


logger = logging.getLogger("code")
logger.setLevel(logging.DEBUG)
sh = logging.StreamHandler()
fmt = logging.Formatter('%(message)s')
sh.setFormatter(fmt)
logger.addHandler(sh)


class StreamToLogger(object):
    def __init__(self, logger, log_level=logging.INFO):
        self.logger = logger
        self.log_level = log_level
        self.linebuf = ''

    def write(self, buf):
        for line in buf.rstrip().splitlines():
            self.logger.log(self.log_level, line.rstrip())

    def flush(self):
        # just act as fileobject, bug doing nothing
        pass


class CustomCase(AirtestCase):
    """Custom launcher."""

    def __init__(self):
        super(CustomCase, self).__init__()

    def setUp(self):
        """Custom setup logic here."""
        self.scope['__name__'] = '__main__'
        print("custom setup")
        # # add var/function/class/.. to globals:
        # self.scope["add"] = lambda x: x+1

        # # exec setup test script:
        # self.exec_other_script("setup.air")

        # # set custom parameter in Settings:
        # ST.THRESHOLD = 0.75

        super(CustomCase, self).setUp()

    def tearDown(self):
        """Custom tear down logic here."""
        print("custom tearDown")
        # # exec teardown script:
        # self.exec_other_script("teardown.air")

        super(CustomCase, self).tearDown()


if __name__ == '__main__':
    ap = runner_parser()
    args = ap.parse_args()
    # 以下三行是为了让运行过程中的log能在IDE里按照顺序显示
    stdout = sys.stdout
    sl = StreamToLogger(logger, logging.ERROR)
    sys.stdout = sl
    # 运行任务
    run_script(args, CustomCase)
    # 运行完毕
    sys.stdout = stdout
