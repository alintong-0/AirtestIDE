/*
 * @Description: 
 * @Author: Era Chen
 * @Email: chenjiyun@corp.netease.com
 * @Date: 2019-08-08 19:06:40
 * @LastEditors: Era Chen
 * @LastEditTime: 2019-11-21 10:54:01
 */

function Router(routes, dom) {
  this.original = original_data
  this.original.task_type = this.original.task_type || 'script'
  this.routes = routes
  this.dom = dom
  this.current_route = null
  this.pages_container = $('.page')
  this.init = function() {
    this.cleanData()
    this.initUI()
    this.addListener()
  }

  this.addListener = function() {
    var that = this
    window.onhashchange = function() {
      that.changePage()
    }
  }

  this.initUI = function() {
    // 初始化页面
    var fragment = ''
    var that = this
    this.routes.forEach(function(route) {
      route.controller.initUI(that.getCopyData())
      fragment += '<a class="nav-li %s" href="#%s">'.format(route.name, route.name) +
                    '<div class="nav-li-content"><img src="static/image/%s" alt="%s" />'.format(route.icon, route.name) +
                    '<span lang="en">%s</span></div>'.format(route.name) +
                  '</a>'
    })
    this.dom.html(fragment)
    this.changePage()
    if(this.original.task_type != 'script') {
      $('.nav-li.data').hide()
    }
  }

  this.changePage = function() {
    page = this.getCurrentPage()
    if(!page.needSaerch && location.search!='') {
      location.search = ""
    }
    if(page.controller.hasOwnProperty('resetData'))
      page.controller.resetData(this.getCopyData())
    this.pages_container.removeClass('active')
    $('.nav-li').removeClass('active')
    $(".page#%s".format(page.name)).addClass('active')
    $('.nav-li.%s'.format(page.name)).addClass('active')
  }

  this.getCurrentPage = function() {
    hash = location.hash.substring(1)
    for(var i=0; i<this.routes.length; i++) {
      if(this.routes[i].name == hash)
        return this.routes[i]
    }
    return this.routes[0]
  }

  this.cleanData = function() {
    // 处理数据, 给设备, 任务添加序号, 间隔时间
    this.original.progress.forEach(function(proc, i) {
      proc.no = i
      proc.delta = proc.end_time - proc.start_time
      proc.tasks.forEach(function(task, j) {
        task.proc_no = i
        task.no = j
        task.delta = task.end_time - task.start_time
        var history = task.history || []
        history.forEach(function(t, k) {
          t.proc_no = i
          t.no = j
          t.delta = t.end_time - t.start_time
        })
      })
    })
  }

  this.getCopyData = function() {
    return JSON.parse(JSON.stringify(this.original))
  }
}

function Overview() {
  this.initUI = function(data) {
    // 总览页面
    this.data = data
    sortProgressStatus(this.data.progress)
    this.initPie()
    this.initBar()
    this.initTable()
  }
  this.initPie = function() {
    // 扇形图
    var pie = new Chart(document.getElementById('pie'), {
      type: 'pie',
      data: {
        datasets: [{
            data: [this.data.success, this.data.failed, this.data.amount - this.data.accomplished],
            label: 'xxx # of Votes',
            backgroundColor: [
                'rgb(2, 82, 177)',
                '#8D4268',
                '#A2CEFF',
            ],
            borderWidth: 0
        }],
        labels: ['Succeed', 'Failed', 'Unfinished']
      },
      options:{
        legend: {
          position: 'right'
        }
      }
    })
  }

  this.initBar = function() {
    // 柱状图
    var bar = new Chart(document.getElementById('bar'), {
      type: 'bar',
      data: this.generateBarData(),
      options:{
        tooltips: {
          mode: 'index',
          intersect: false
        },
        responsive: true,
        scales: {
          xAxes: [{
            stacked: true,
          }],
          yAxes: [{
            stacked: true
          }]
        }
      }
    })

    this.initTable = function() {
      var fragment = ""
      var that = this
      this.data.progress.forEach(function(proc, data) {
        fragment += "<tr><td>%s</td>>".format(proc.device.show) +
                      '<td>%s</td>'.format(proc.accomplished + (that.type == 'parallel' ? '' : '/' +proc.amount)) +
                      '<td>%s% (%s/%s)</td>'.format((proc.rate * 100).toFixed(2), proc.success, proc.accomplished) +
                      '<td>%s</td>'.format(proc.time) +
                      '<td><a href="?device=%s#detail"><span lang="en">Detail</span></a></td>'.format(proc.no) +
                    '</tr>'
      })
      $('#overview .part4 table tbody').html(fragment)
    }
  }

  this.generateBarData = function() {
    var devices = this.data.progress || []
    var chartData = {
      labels: [],
      datasets: [{
        label: 'Failed',
        backgroundColor: '#8D4268',
        data:[]
      }, {
        label: 'Succeed',
        backgroundColor: 'rgb(2, 82, 177)',
        data:[]
      }]
    }
    if(devices.length>0) {
      if(this.data.type == "parallel") {
        chartData.datasets.splice(1, 0, {
          label: 'Unfinished',
          backgroundColor: '#A2CEFF',
          data:[]
        })
      }
      var that = this
      devices.forEach(function(proc) {
        chartData.labels.push(proc.device.show)
        chartData.datasets[0].data.push(proc.failed)
        if(that.data.type == "parallel") {
          chartData.datasets[1].data.push(proc.amount - proc.accomplished)
          chartData.datasets[2].data.push(proc.success)
        } else {
          chartData.datasets[1].data.push(proc.success)
        }
      })
    }
    return chartData
  }
}

function DataPage() {
  this.dataCount = 0
  this.leftDom = $('#data .btns .left')
  this.rightDom = $('#data .btns .right')
  this.device_num = $('#data .device-num')
  // 数据页
  this.initUI = function(data) {
    this.data = data
    this.progress = data.progress
    if(this.data.task_type == 'script') {
      if(this.data.type=="parallel") {
        sortProgressStatus(this.progress)
        this.pagesize = 8
        this.currentPage = 0
        this.tableData = this.generateParallelData()
        this.dataCount = this.progress.length
        this.page_total = Math.ceil(this.dataCount / this.pagesize)
        this.refreshParallelTable()
        this.addListener()
      } else{
        this.pagesize = 15
        this.currentPage = 1
        this.order_script = 'acc'
        this.order_device = 'acc'
        this.order_duration = 'acc'
        this.order_start = 'acc'
        this.order_status = 'acc'
        this.generateDistibuteData()
        this.init_pagenation()
        this.refreshDistributeTable()
        this.addDistributeListener()
      }
    }
  }

  this.addListener = function() {
    var that = this
    this.rightDom.click(function() {
      if((that.currentPage + 1) * that.pagesize < that.dataCount) {
        that.currentPage ++
        that.refreshParallelTable()
      }
    })
    this.leftDom.click(function() {
      if(that.currentPage >0) {
        that.currentPage --
        that.refreshParallelTable()
      }
    })
  }

  this.addDistributeListener = function() {
    var that = this
    $('#distribute-script').click(function() {
      that.filterDistribute('air_name', 'order_script')
    })
    $('#distribute-device').click(function() {
      that.filterDistribute('device_show', 'order_device')
    })
    $('#distribute-duration').click(function() {
      that.filterDistribute('delta', 'order_duration')
    })
    $('#distribute-start').click(function() {
      that.filterDistribute('start_time', 'order_start')
    })
    $('#distribute-status').click(function() {
      that.filterDistribute('status', 'order_status')
    })
    $("#data.distribute .search-query").keyup(function(e) {
      that.searchDistribute(e.target.value.trim())
    })
  }

  this.filterDistribute = function(attr, key){
    this.progressList.sort(sortArr(attr, this[key] == 'acc'))
    this[key] = this[key] == 'acc' ? 'dec' : 'acc'
    if (this.progressList.length > 10){
      this.paging.go(1)
    } else {
      this.refreshDistributeTable()
    }
  }

  this.searchDistribute = function(key) {
    var that = this
    this.progressList = this.originalProgressList.filter(function(proc){
      return that.contain(proc.air_name, key) || that.contain(proc.device_show, key)
    })
    this.init_pagenation()
    this.refreshDistributeTable()
  }

  this.contain = function(target, key) {
    return this.purString(target).indexOf(this.purString(key))>=0
  }

  this.purString = function(target) {
    return target.replace(/\s+/g,"").toLowerCase();
  }

  this.refreshParallelTable= function() {
    this.resetBtns()
    this.fillParallelTable()
  }

  this.resetBtns = function() {
    if(this.dataCount<this.pagesize) {
      $('#data .btns').hide()
    } else{
      this.device_num.html((this.currentPage + 1) + '/' + this.page_total)
      if(this.currentPage>0)
        this.leftDom.addClass('active')
      else
        this.leftDom.removeClass('active')
      if((this.currentPage + 1)* this.pagesize < this.dataCount)
        this.rightDom.addClass('active')
      else
        this.rightDom.removeClass('active')
    }
  }

  this.fillParallelTable = function() {
    // 分布式的时候,填充表格
    start = this.currentPage * this.pagesize + 2
    end = Math.min((this.currentPage + 1) * this.pagesize + 2 , this.tableData[0].length)
    // 填充 thead
    th1 = '<th></th><th></th>', th2 = '<th></th><th></th>', th3 = '<th></th><th></th>'
    for(var i=start; i<end; i++) {
      var proc = this.progress[i-2]
      th1 += '<th>%s</th>'.format(i-1)
      th2 += '<th title="%s"><a href="?device=%s#detail">%s</a></th>'.format(proc.device.show, proc.no, proc.device.show.split('(')[0].trim())
      th3 += '<th>%s%</th>'.format((proc.rate*100).toFixed(2))
    }
    $('#data .table thead').html("<tr>%s</tr><tr>%s</tr><tr>%s</tr>".format(th1, th2, th3))
  
    // 填充 tbody
    var that = this
    tbody = this.tableData.map(function(item, i) {
      tr = '<td title="%s"><span class="script-path">%s</span></td>'.format(item[0].abspath, item[0].basename)
      tr += "<td>%s%</td>".format((item[1] * 100).toFixed(2))
      for(var j=start; j<end; j++) {
        if(item[j].output_html) {
          tr += '<td><a href="%s" target="_blank">'.format(linkToSimpleReport(item[j], that.progress[j-2], that.data.type)) +
                  '<img src="static/image/step_%s.svg" alt="%s"/>'.format(item[j].status, item[j].status) +
                '</a></td>'
        } else{
          tr += '<td title="No report"><img src="static/image/step_%s.svg" alt="%s"/></td>'.format(item[j].status, item[j].status)
        }
      }
      return "<tr>%s</tr>".format(tr)
    })
    $('#data .table tbody').html(tbody)
  }

  this.refreshDistributeTable = function() {
    // 填充分布式
    if(this.progressList.length<=0) {
      $('#data .no-data').show()
    } else{
      $('#data .no-data').hide()
    }
    var tbody = ""
    var start = (this.currentPage-1)* this.pagesize
    start = start < 0 ? 0 : start
    var end = (this.currentPage)*this.pagesize
    end =  end > this.progressList.length ? this.progressList.length : end
    for(var i=start; i<end; i++){
      var task = this.progressList[i]
      if(task.output_html) {
        var lastTd = '<td><a href="%s" target="_blank"><img src="static/image/step_%s.svg" alt="%s"/></td>'.format(task.reportLink, task.status, task.status)
      }
      else{
        var lastTd = '<td><img src="static/image/step_%s.svg" alt="%s"/>'.format(task.status, task.status)
      }
      tbody += '<tr><td>%s</td>'.format(task.index) +
                  '<td>%s</td>'.format(getDateTime(task.start_time)) +
                  '<td class="script" title="%s"><span class="script-path">%s</span></td>'.format(task.air.abspath, task.air_name) +
                  '<td class="device"><a href="%s">%s</a></td>'.format(task.devLink, task.device_show) +
                  '<td>%s</td>'.format(task.time) + lastTd +
                "</tr>"
    }
    $('#data .table tbody').html(tbody)
  }

  this.generateDistibuteData = function() {
    // 构造分布式的数据
    this.progressList =[]
    var that = this
    var i = 1
    this.progress.forEach(function(proc) {
      proc.tasks.forEach(function(task) {
        task.devLink = "?device=%s#detail".format(proc.no)
        task.reportLink = linkToSimpleReport(task, proc, that.data.type)
        task.device_show = proc.device.show
        task.air_name = task.air.basename
        that.progressList.push(task)
      })
    })
    this.progressList.sort(sortArr('start_time'))
    this.progressList.forEach(function (task) {
      task.index = i++
    })
    this.originalProgressList = this.progressList
  }

  this.generateParallelData = function() {
    // 生成“数据” -> 并行表格数据 [[ script, status, task]]
    tableData = []
    var that = this
    this.progress.forEach(function(proc, j) {
      that.data.scripts.forEach(function(script, i) {
        task = findTask(proc.tasks, script)
        if(!tableData[i])
          tableData[i] = []
        tableData[i][j+2] = task || {status: 'unfinished'}
      })
    })
    // 统计成功率
    this.data.scripts.forEach(function(script, i) {
      tableData[i][0] = script
      tableData[i][1] = that.countOccurences(tableData[i], 'success') / (tableData[i].length-2)
    })
    // 把失败率较高的[脚本]前排
    this.sortScriptStatus(tableData)
    return tableData
  }

  this.countOccurences = function (arr, val) {
    // 统计task数组中，status = val 的个数
    count = 0
    arr.forEach(function(item) {
      if(item.status == val)
        count ++
    })
    return count
  }

  this.sortScriptStatus = function (arr) {
    // 对arr进行排序, 失败多script的靠前排，成功多的靠后排
    for(var i=0; i<arr.length; i++) {
      for(var j=0;j<arr.length-i-1; j++) {
        // arr[j][1] 成功率
        if(arr[j][1] > arr[j+1][1]) {
          var tmp = arr[j]
          arr[j] = arr[j+1]
          arr[j+1] = tmp
        }
      }
    }
  }

  this.init_pagenation = function() {
    // 分布式 生成分页控件  
    this.paging = new Paging();
    var that = this
    var page = $('#distribute-page')
    page.empty()
    var list_len = this.progressList.length
    if(list_len>10) {
      this.paging.init({
        target:'#distribute-page',
        pagesize: this.pagesize,
        count: list_len,
        prevTpl: "<",
        nextTpl: ">",
        toolbar:true,
        pageSizeList: list_len>100 ? [15, 30, 50, 100, list_len] : [15, 30, 50, 100],
        changePagesize:function(ps) {
          that.pagesize = parseInt(ps)
          that.currentPage = 1
          that.refreshDistributeTable()
        },
        callback:function(p) {
          that.currentPage = parseInt(p)
          that.refreshDistributeTable()
        }
      });
      page.prepend('<span class="scripts-total"><span lang="en">Total </span><span class="steps-account">%s</span></span>'.format(list_len))
    }
  }
}

function DetailPage() {
  // 详情页
  this.initUI = function(data) {
    this.device_container = $('#dev-list')
    this.script_container = $('#script-list')
    this.dev_infos_container = $('#detail .dev-infos')
    this.resetData(data)
    this.fillDeviceList()
    this.addListener()
  }

  this.resetData = function(data) {
    search = urlArgs()
    dev = search.device || 0
    this.device_no = 'dec'
    this.device_duration = 'acc'
    this.device_status = 'acc'
    this.script_no = 'dec'
    this.script_name = 'acc'
    this.script_duration = 'acc'
    this.script_status = 'acc'
    this.device = data.devices
    this.progress = data.progress
    this.data = data
    this.pagesize = 10
    this.currentPage = 1
    this.fillScriptList(dev)
  }

  this.addListener = function() {
    // 绑定事件
    var that = this
    $("#dev-list").delegate('.dev',"click", function(e) {
      num = e.currentTarget.getAttribute('index')
      that.fillScriptList(num)
    })
    $('#device-order').click(function() {
      that.progress.sort(sortArr('no', that.device_no == 'acc'))
      that.device_no = that.device_no == 'acc' ? 'dec' : 'acc'
      that.resetDeviceList()
    })
    $('#device-duration').click(function() {
      that.progress.sort(sortArr('delta', that.device_duration == 'acc'))
      that.device_duration = that.device_duration == 'acc' ? 'dec' : 'acc'
      that.resetDeviceList()
    })
    $('#device-status').click(function() {
      sortProgressStatus(that.progress, that.device_status == 'acc')
      that.device_status = that.device_status == 'acc' ? 'dec' : 'acc'
      that.resetDeviceList()
    })
    $('#script-order').click(function() {
      that.proc.tasks.sort(sortArr('no', that.script_no == 'acc'))
      that.script_no = that.script_no == 'acc' ? 'dec' : 'acc'
      that.jumpToFirstPage()
    })
    $('#script-name').click(function() {
      that.proc.tasks.sort(sortArr('air', that.script_name == 'acc', 'relpath'))
      that.script_name = that.script_name == 'acc' ? 'dec' : 'acc'
      that.jumpToFirstPage()
    })
    $('#script-duration').click(function() {
      that.proc.tasks.sort(sortArr('delta', that.script_duration == 'acc'))
      that.script_duration = that.script_duration == 'acc' ? 'dec' : 'acc'
      that.jumpToFirstPage()
    })
    $('#script-status').click(function() {
      that.proc.tasks.sort(sortArr('status', that.script_status == 'acc'))
      that.script_status = that.script_status == 'acc' ? 'dec' : 'acc'
      that.jumpToFirstPage()
    })
    $('#script-list').delegate('.task-rerun-icon', 'click',function() {
      var script = $(this).parent('.script')
      if (script.hasClass('fold'))
        script.removeClass('fold')
      else
        script.addClass('fold')
    })
  }

  this.resetDeviceList = function() {
    // 点击排序之后，刷新设备列表和右边的详情
    this.fillDeviceList()
    this.fillScriptList(0)
  }

  this.fillDeviceList = function() {
    var that = this
    var fragment = this.progress.map(function(proc, i) {
      statusBar = that.generateBarStatus(proc)
      return '<div class="dev" index=%s>'.format(proc.no) +
                '<div title="%s" class="dev-show">'.format(proc.device.connect) +
                  '<span># %s <span class="indent">%s</span></span></div>'.format(proc.no + 1, proc.device.show) +
                '<div class="right"><div class="status-bar">%s</div>'.format(statusBar) +
                '<div class="dev-duration">%s</div>'.format(proc.time) +
             '</div></div>'
    })
    this.device_container.html(fragment)
  }

  this.generateBarStatus = function(proc) {
    proc['unfinished'] = proc.amount - proc.accomplished - proc.running
    statusBar = ''
    statuss = ['success', 'failed', 'running', 'unfinished']
    statuss.forEach(function(status) {
      if(proc[status])
        statusBar += '<div class="bar %s" style="width:%s%">%s</div>'.format(status, proc[status]/proc.amount * 100, proc[status])
    })
    return statusBar
  }

  this.fillScriptList = function(dev) {
    num = parseInt(dev)
    if(!isNaN(num) && num>=0 && num< this.progress.length) {
      this.proc = this.findProgressByIndex(num)
      if(this.proc) {
        $('#dev-list .dev').removeClass('active')
        $('#dev-list .dev[index=%s]'.format(this.proc.no)).addClass('active')
        this.dev_infos_container.html(this.fillDeviceInfos())
        this.resetPaging()
        this.init_pagenation()
        this.fillScripts()
      }
    }
    // 设置代码高亮
    if($('pre.trace').length>0) {
      hljs.highlightBlock($('pre.trace')[0], null, false);
    }
  }

  this.findProgressByIndex = function(num) {
    for(var i=0;i<this.progress.length; i++) {
      if(this.progress[i].no == num)
        return this.progress[i]
    }
    return null
  }

  this.fillDeviceInfos = function() {
    fmt = '<div class="dev-info %s"><span lang="en">%s : </span><span class="dev-info-val">%s</span></div>'
    statusFragment = fmt.format('status' + (this.proc.device.status!='device' ? ' error': ''), 'Status', this.proc.device.status)
    return fmt.format('', 'Device', this.proc.device.show) +
           fmt.format('', 'Connect', this.proc.device.connect) +
           fmt.format('', 'Accomplished', this.proc.accomplished) +
           fmt.format('rate', 'Rate', this.proc.amount>0 ? ((this.proc.rate * 100).toFixed(2) + '%') : "--") +
           fmt.format('succeed', 'Succeed', this.proc.success) +
           fmt.format('failed', 'Failed', this.proc.failed) +
           fmt.format('', 'Start', this.proc.start_time ? getDateTime(this.proc.start_time) : "--") +
           fmt.format('', 'End', this.proc.end_time ? getDateTime(this.proc.end_time): "--") + statusFragment +
           fmt.format('', 'Time', this.proc.time)
  }

  this.fillScripts = function() {
    // 使用this.proc.tasks 填充右边的脚本列表
    var that = this
    this.window_width = window.innerWidth
    if(this.proc.tasks.length == 0)
      var fragment = "<div class='error-info'>No scripts are running on this device</div>"
    else {
      var start = (this.currentPage-1)* this.pagesize
      start = start < 0 ? 0 : start
      var end = (this.currentPage)*this.pagesize
      end =  end>this.proc.tasks.length ? this.proc.tasks.length : end
      var fragment = ''
      for(var i=start; i < end; i++) {
        var task = this.proc.tasks[i]
        var script_class = 'script fold'
        var script_status = '<img src="static/image/step_%s.svg" alt="%s"/>'.format(task.status, task.status)
        var script_order = '<span># %s </span>'.format(task.no + 1)
        var script_rerun_icon = ''
        var script_rerun  = ''
        if(that.data.task_type != "script") {
          script_class += ' install'
          var script_title = ''
          var script_path = '<span> %s</span>'.format(that.data.package_options.package_file_path)
          var infos = '<div class="info"><span class="desc" lang="en">Package:</span> %s</div>'.format(that.data.package_options.package_name)+
                     '<div class="info"><span class="desc" lang="en">Password:</span> %s</div>'.format(that.data.package_options.ov_code)
          if(task.error)
            infos += '<div class="error-info">%s</div>'.format(that.get_hljs(task.error))
        } else {
          var script_title = task.air.abspath
          var infos = '<div class="error-info">%s</div>'.format(that.getTaskError(task))
          var script_path = that.getTaskHtml(task)
        }
        if (task.rerun && task.rerun>1) {
          script_rerun_icon = '<div class="task-rerun-icon"></div>'
          for(j=task.history.length-1; j>=0; j--) {
            script_rerun += that.getTaskHtml(task.history[j], true)
            
          }
          script_rerun = '<div class="task-rerun">' +script_rerun+ '</div>'
        }
        fragment += '<div class="%s" title="%s">'.format(script_class, script_title) +
                        script_status + script_order + script_path + script_rerun_icon + script_rerun +
                    '</div>' + infos
      }
    }
    this.script_container.html(fragment)
  }

  this.getTaskHtml = function(task, show_rerun_no) {
    if(task.output_html)
      var script_path ='<a class="script-path" href="%s" target="_blank">%s</a>'.format(linkToSimpleReport(task, this.proc, this.data.type), this.shortScript(task.air.relpath))
    else
      var script_path ='<span class="script-path"> %s</span>'.format(this.shortScript(task.air.relpath))
    return '<div class="script-content">' +
              script_path +
              (show_rerun_no || (task.rerun && task.rerun>1) ? '<div class="task-rerun-no">%s</div>'.format(task.rerun) :"") +
              '<div class="task-duration">%s</div>'.format(task.time) +
           '</div>'
  }

  this.resetPaging = function() {
    this.currentPage = 1
    this.pagesize = 10
  }

  this.get_hljs = function(error) {
    if (error) 
      return '<pre class="trace"><code class="python">%s</code></pre>'.format(error)
    return ""
  }

  this.getTaskError = function(task) {
    var msg = task.output_html ? '' :
                task.status=='running' ?
                  'Test is not finished' :
                  (task.error || "log.html is not found")
    if (task.terminated)
      msg += (msg=='' ? '' : '\n') + 'Task terminated because of timeout'
    return msg
  }

  this.shortScript = function(path) {
    len = this.window_width< 1300 ? 30 : this.window_width< 1500 ? 40 : this.window_width< 1800 ? 60 : 100
    return path.length > len ? "..." + path.substr(-len) : path
  }


  this.jumpToFirstPage = function(){
    if (this.proc.tasks.length > 10) {
      this.paging.go(1)
    } else {
      this.fillScripts()
    }
  }

  this.init_pagenation = function() {
    //生成分页控件  
    this.paging = new Paging();
    var that = this
    var page = $('#script-page')
    page.empty()
    var list_len = this.proc.tasks.length
    if(list_len>10) {
      this.paging.init({
        target:'#script-page',
        pagesize: this.pagesize,
        count: list_len,
        prevTpl: "<",
        nextTpl: ">",
        toolbar:true,
        pageSizeList: list_len>100 ? [10, 20, 50, 100, list_len] : [10, 20, 50, 100],
        changePagesize:function(ps) {
          that.pagesize = parseInt(ps)
          that.currentPage = 1
          that.paging.go(1)
        },
        callback:function(p) {
          that.currentPage = parseInt(p)
          that.fillScripts()
        }
      });
      page.prepend('<span class="scripts-total"><span lang="en">Total </span><span class="steps-account">%s</span></span>'.format(list_len))
    }
  }
}

String.prototype.format= function() {
  var args = Array.prototype.slice.call(arguments);
  var count=0;
  return this.replace(/%s/g,function(s,i) {
    return args[count++];
  });
}


Date.prototype.Format = function (fmt) {
  var o = {
    "M+": this.getMonth() + 1, //月份 
    "d+": this.getDate(), //日 
    "h+": this.getHours(), //小时 
    "m+": this.getMinutes(), //分 
    "s+": this.getSeconds(), //秒 
    "q+": Math.floor((this.getMonth() + 3) / 3), //季度 
    "S": this.getMilliseconds() //毫秒 
  };
  if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
  for (var k in o)
  if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
  return fmt;
}


function getDateTime(timestamp) {
  return (new Date(timestamp * 1000)).Format("yyyy-MM-dd hh:mm:ss")
}

function getDelta(delta) {
  // 计算消耗时间，end - start，以0:1:6'22'' 格式
  delta = parseInt((delta)*1000)
  ms = delta % 1000
  delta = parseInt(delta / 1000)
  s = delta % 60
  delta = parseInt(delta/ 60)
  m = delta % 60
  h = parseInt(delta/ 60)

  msg = ''
  if(h == 0)
    if(m == 0)
      if(s==0)
        msg =  ms + "ms"
      else
        msg = s + "s " + ms + "ms"
    else
      msg = m + 'min ' + s + "s " + ms + "ms"
  else
    msg = h + 'hr ' + m + 'min ' + s + "s " + ms + "ms"
  return msg
}


function findTask(tasks, script) {
  // 在一个手机运行记录中查找script
  for(var i=0; i<tasks.length; i++) {
    if(tasks[i].air.abspath == script.abspath)
      return tasks[i]
  }
  return null
}


function sortArr(attr, rev, attr1) {
  //第二个参数没有传递 默认升序排列
  if(rev ==  undefined) {
      rev = 1;
  }else{
      rev = (rev) ? 1 : -1;
  }
  return function(a,b) {
    if (attr1){
      a = a[attr][attr1];
      b = b[attr][attr1];
    } else{
      a = a[attr];
      b = b[attr];
    }
    a = typeof(a)=='string' ? a.toLowerCase() : a
    b = typeof(b)=='string' ? b.toLowerCase() : b
    if(a < b) {
        return rev * -1;
    }
    if(a > b) {
        return rev * 1;
    }
    return 0;
  }
}

function urlArgs() {
  var args = {};
  var query = location.search.substring(1);
  var pairs = query.split("&");
  for(var i = 0;i < pairs.length; i++) {
      var pos = pairs[i].indexOf("=");
      if(pos == -1) continue;
      var name = pairs[i].substring(0, pos);
      var value = pairs[i].substring(pos + 1);
      value = decodeURIComponent(value);
      args[name] = value;
  }
  return args;
}

function sortProgressStatus(progress, ascending) {
  // 对progress进行排序,失败多的靠前排，成功多的靠后排
  ascending = ascending==undefined ? true : ascending
  for(var i=0; i<progress.length; i++) {
    for(var j=0;j<progress.length-i-1; j++) {
      var condition = progress[j].failed < progress[j+1].failed || progress[j].success>progress[j+1].success
      condition = ascending ? condition : !condition
      if(condition) {
        var tmp = progress[j]
        progress[j] = progress[j+1]
        progress[j+1] = tmp
      }
    }
  }
}


function linkToSimpleReport(task, proc, type) {
  var search = '?type=%s'.format(type) +
            '&device_no=%s'.format(task.proc_no + 1) +
            '&script_no=%s'.format(task.no + 1) +
            '&device=%s'.format(task.device.show) +
            '&accomplished=%s'.format(proc.accomplished) +
            '&succeed=%s'.format(proc.success) +
            '&status=%s'.format(task.status=='success' ? 'Passed': 'Failed') +
            '&connect=%s'.format(task.device.connect) +
            '&back=%s'.format(location.href)
  return task.output_html + search
}


(function() {
  router = new Router([
    {
      name: 'overview',
      icon: 'home.svg',
      controller: new Overview()
    }, {
      name: 'data',
      icon: 'data.svg',
      controller: new DataPage()
    }, {
      name: 'detail',
      icon: 'detail.svg',
      controller: new DetailPage(),
      needSaerch: true
    }
  ], $('#nav'))
  router.init()
}())
