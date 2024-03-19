function tipsStrings(e){"cn"==e?(window.currentLang="cn",window.selectPlaceHolder="点击这里选择历史数据文件以查看",window.startCollectingStr="开始收集性能数据",window.inputPackagenameStr="请先填写需要收集数据的应用包名，或使用当前启动中的应用",window.connectPhoneStr="请先连接手机",window.connectStoppedStr="收集线程已停止！",window.chartTitle="双击图表进行标记"):(window.currentLang="en",window.selectPlaceHolder="Click here to select historical data files to view.",window.startCollectingStr="Start collecting performance data...",window.inputPackagenameStr="Please fill in the package name of the application that needs to collect data first.",window.connectPhoneStr="Please connect your phone first.",window.connectStoppedStr="Collection thread has stopped.",window.chartTitle="Double click to mark the collection")}function init(){qtchannel.SIGNAL_INSERT_LOG.connect(addData),qtchannel.SIGNAL_PACKAGE_CHANGED.connect(changePackageName),qtchannel.SIGNAL_SERIALNO_CHANGED.connect(changeSerialno),qtchannel.SIGNAL_CPU_KERNEL_CHANGED.connect(changeCpuKel),qtchannel.SIGNAL_NOTIFY_PAUSE_COLLECTING.connect(pauseCollectingByIDE),qtchannel.SIGNAL_NOTIFY_START_COLLECTING.connect(startCollectingByIDE),qtchannel.SIGNAL_THEME_CHANGED.connect(changeTheme),qtchannel.SIGNAL_LANG_CHANGED.connect(changeLang),toggleStart("stop"),changeTheme(),updateHistoryFiles(),changeLang()}function changePackageName(){$(".packageName").html(qtchannel.packageName),$("#inputPackageName").val(qtchannel.packageName)}function changeSerialno(){$("#serialno").html(qtchannel.serialno)}function changeCpuKel(){coreNum=qtchannel.cpuKel}function startCollecting(){var e="";return document.getElementById("pss").checked&&(e+="pss|"),document.getElementById("cpu").checked&&(e+="cpu|"),document.getElementById("battery_temperature").checked&&(e+="battery_temperature|"),document.getElementById("getframeinfo").checked&&(e+="getframeinfo|"),document.getElementById("snapshot").checked&&(e+="snapshot|"),document.getElementById("net_flow").checked&&(e+="net_flow|"),""==e||"snapshot|"==e?void showAlert("Noting to collect!"):void(""!=$("#serialno").html()?$("#inputPackageName").val()?(qtchannel.start_collecting(document.getElementById("inputPackageName").value+"|"+e),toggleStart("start"),showAlert(window.startCollectingStr)):showAlert(window.inputPackagenameStr):showAlert(window.connectPhoneStr))}function markArea(e){qtchannel.mark_area(e)}function pauseCollecting(){qtchannel.pause_collecting(),toggleStart("stop"),showAlert(window.connectStoppedStr)}function startCollectingByIDE(){toggleStart("start")}function pauseCollectingByIDE(){toggleStart("stop"),showAlert(window.connectStoppedStr)}function refreshInfo(){qtchannel.refresh_info()}function currentApp(){qtchannel.refresh_package_name()}function formatDate(e){function t(e){return 10>e?"0"+e:e}return t(e.getHours())+":"+t(e.getMinutes())+":"+t(e.getSeconds())}function toggleStart(e){if("start"==e){$(".hideOnStarting").addClass("d-hide"),$(".hideOnStopping").removeClass("d-hide"),$("#btnRefreshData").attr("disabled",!0),clearData();var t=new Date;startTime=formatDate(t),$(".startTime").html(startTime),showAlert(window.startCollectingStr)}else""!=startTime&&(t=new Date,endTime=formatDate(t),$(".hideOnStarting").removeClass("d-hide"),$(".endTime").html(endTime)),$(".hideOnStopping").addClass("d-hide"),$("#btnRefreshData").removeAttr("disabled"),updateHistoryFiles()}function showAlertMsg(e,t){var n=$("#toastConnectPhone");e?(t&&$(n).html(t),$(n).parent().removeClass("d-hide")):$(n).parent().addClass("d-hide")}function showAlert(e){showAlertMsg(!0,e),setTimeout("showAlertMsg(false)",4e3)}function showReport(){qtchannel.show_report()}function changeTheme(){document.querySelectorAll('link[title="light-css"]')[0].disabled=!0,document.querySelectorAll('link[title="dark-css"]')[0].disabled=!0,"DarkShadow"===qtchannel.theme?document.querySelectorAll('link[title="dark-css"]')[0].disabled=!1:document.querySelectorAll('link[title="light-css"]')[0].disabled=!1,currentTheme=qtchannel.theme}function updateHistoryFiles(){var e=$("#history-multi-selector");e.val(null).trigger("change"),qtchannel.historyFiles(function(t){e.empty().trigger("change"),_.forEach(t,function(t){var n=new Option(t.text,t.path,!1,!1);e.append(n).trigger("change")})})}function clearHistoryFiles(){qtchannel.clearHistoryFiles(),$("#history-multi-selector").val(null).trigger("change"),$("#history-multi-selector").empty().trigger("change")}function showHistoryReport(){var e=$("#history-multi-selector").select2("data"),t=[];_.forEach(e,function(e){t.push(e.id)}),qtchannel.historyReport(t)}function changeLang(){window.lang.change(qtchannel.lang),tipsStrings(qtchannel.lang),$("#history-multi-selector").select2({placeholder:window.selectPlaceHolder})}$(document).ready(function(){function e(e){if(!e.id)return e.text;var t=e.text.split("_");if(t.length<2)var n=$("<span>"+t[0]+"</span>");else var n=$("<span>"+t[0]+'<br/><span class="history-text-subtitle">'+t[1]+"</span></span>");return n}function t(e){if(!e.id)return e.text;var t=e.text.split("_");if(t.length<2)var n=$("<span>"+t[0]+"</span>");else var n=$("<span>"+t[0]+"_"+t[1]+"</span>");return n}window.lang=new Lang,window.lang.init({defaultLang:"en"}),"undefined"!=typeof qt&&new QWebChannel(qt.webChannelTransport,function(e){window.qtchannel=e.objects.qtchannel,init(),qtchannel.registrationFinished()}),$("#btnCurrentApp").click(function(){currentApp()}),$("#btnStart").click(function(){startCollecting()}),$("#btnStop").click(function(){pauseCollecting()}),$("#btnRefreshData").click(function(){clearData()}),$("#linkShowReport").click(function(){showReport()}),$("#btn-refresh").click(function(){refreshInfo()}),$.fn.select2.defaults.set("width","520px"),$.fn.select2.defaults.set("templateResult",e),$.fn.select2.defaults.set("templateSelection",t),$("#history-multi-selector").select2({placeholder:"Click here to select historical data files to view"}),$("#btnHistoryData").click(function(){showHistoryReport()}),$("#btnClearHistoryData").click(function(){clearHistoryFiles()})});var startTime="",endTime="";