#!/usr/bin/env python
# -*- coding: utf-8 -*-

"""This is a sample launcher file."""

import argparse
from airtest.report.report import main as report_main
from airtest.report.report import get_parger as report_parser

if __name__ == "__main__":
    import os
    import sys
    # add the path of AirtestIDE to sys.path
    sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    ap = argparse.ArgumentParser()
    ap = report_parser(ap)
    args = ap.parse_args(sys.argv[1:])
    report_main(args)
