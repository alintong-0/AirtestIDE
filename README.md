<!--
 * @Description: 
 * @Author: alintong
 * @Date: 2024-03-19 21:51:41
 * @LastEditors: alintong
-->
# AirTestIDE
NetEase AirTestIDE1.2.17 Overwrite. For learning only. <br>
拓展网易的AirTestIDE1.2.17功能，仅供学习使用 <br>
# plugins:
1.tippyjs  https://github.com/atomiks/tippyjs <br>
2.jQuery-contextMenu  https://github.com/swisnl/jQuery-contextMenu <br>
3.codemirror  https://github.com/codemirror/dev/ <br>
4.qtwebengine  https://github.com/qt/qtwebengine <br>
5.PyQt5 https://www.riverbankcomputing.com/software/pyqt/ <br>
# action:

> ## 拓展poco录制功能的智能代码键入功能
>> * 打开qtwebengine的调试端口 https://blog.csdn.net/weixin_32895669/article/details/120856160 <br>
>> * 使用谷歌devtool链接 chrome://inspect/ <br>
>> * 成功可以直接断点调试对应窗口（打开调试窗口后F5可直接刷新界面） <br>
![image text](https://github.com/alintong-0/AirtestIDE/blob/main/readMe/debug.png) <br>
>> * 添加代码窗口键入支持，游戏内开启WebSocketServer，默认端口9321，开启ide后代码窗口自动连接游戏内服务器 <br>
>> * 后续根据自己项目需求使用poco的需求写对应的操作转代码的逻辑 <br>
![image text](https://github.com/alintong-0/AirtestIDE/blob/main/readMe/coding.gif) <br>

> ## 拓展代码编辑器右键菜单
>> 右键菜单使用的是jQuery-contextMenu，可以搜索相关文档对其进行拓展 <br>
![image text](https://github.com/alintong-0/AirtestIDE/blob/main/readMe/right_click.png) <br>

> ## 拓展框架开发
>> 1. 全工程checkout
>> 2. 配置TS编译环境
>> 3. VSCode使用 ctrl+shift+b 运行编译任务
>> 4. 重开ide即可生效
>> 5. TS代码入口为 jsInterface.ts
