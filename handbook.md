[toc]
# 一 、地图界面
## 1.1事件展示
显示地图区域中一周之内的公共安全事件，如下图所示，展示了5个事件标注
![](https://cdn.jsdelivr.net/gh/beifeng5620/StaticPic@1.0.1/safety-events-plantform/images/howToUse/1.jpg)
### 1.1.1事件详情
点击标注即可查看事件的详细信息，如图所示
![](https://cdn.jsdelivr.net/gh/beifeng5620/StaticPic@1.0.1/safety-events-plantform/images/howToUse/9.jpg)
### 1.1.2事件提交
在地图上点击鼠标右键唤出右键菜单，即可在当前位置提交事件,如图所示
![](https://cdn.jsdelivr.net/gh/beifeng5620/StaticPic@1.0.1/safety-events-plantform/images/howToUse/10.jpg)
事件提交页面如图所示
![](https://cdn.jsdelivr.net/gh/beifeng5620/StaticPic@1.0.1/safety-events-plantform/images/howToUse/11.jpg)
选择事件类型
![](https://cdn.jsdelivr.net/gh/beifeng5620/StaticPic@1.0.1/safety-events-plantform/images/howToUse/12.jpg)
选择事件发生时间
![](https://cdn.jsdelivr.net/gh/beifeng5620/StaticPic@1.0.1/safety-events-plantform/images/howToUse/13.jpg)
填写事件详情和联系方式后，点击提交即可提交事件到审核
![](https://cdn.jsdelivr.net/gh/beifeng5620/StaticPic@1.0.1/safety-events-plantform/images/howToUse/14.jpg)

## 1.2定位功能
点击右上方城市列表选择器，选择城市即可转到目标城市
![](https://cdn.jsdelivr.net/gh/beifeng5620/StaticPic@1.0.1/safety-events-plantform/images/howToUse/2.jpg)
或者点击右下方定位按钮，即可根据IP定位到当前城市
![](https://cdn.jsdelivr.net/gh/beifeng5620/StaticPic@1.0.1/safety-events-plantform/images/howToUse/3.jpg)
成功定位
![](https://cdn.jsdelivr.net/gh/beifeng5620/StaticPic@1.0.1/safety-events-plantform/images/howToUse/4.jpg)

## 1.3搜索功能
**（支持地点搜索、行政区域搜索、交通线路搜索）**
在左上方的输入框输入关键字后，
点击搜索按钮即可展示目标地点的相关信息
例如
### 1.3.1.地点搜索
输入忠仑公园，点击右侧蓝色搜索按钮后，出现待选项
![](https://cdn.jsdelivr.net/gh/beifeng5620/StaticPic@1.0.1/safety-events-plantform/images/howToUse/5.jpg)
选中一项后，会跳转到目标地点，并打上标记
![](https://cdn.jsdelivr.net/gh/beifeng5620/StaticPic@1.0.1/safety-events-plantform/images/howToUse/6.jpg)
清除输入框后，标记即可自动消失
###1.3.2.行政区域搜索
步骤同上，标注如图
![](https://cdn.jsdelivr.net/gh/beifeng5620/StaticPic@1.0.1/safety-events-plantform/images/howToUse/7.jpg)
###1.3.3.交通线路搜索
步骤同上，标注如图
![](https://cdn.jsdelivr.net/gh/beifeng5620/StaticPic@1.0.1/safety-events-plantform/images/howToUse/8.jpg)


# 二、抽屉界面
## 2.1抽屉展示
### 2.1.1点击地图左侧中部蓝色按钮拉出抽屉
如图所示
![](https://cdn.jsdelivr.net/gh/beifeng5620/StaticPic@1.0.1/safety-events-plantform/images/howToUse/15.jpg)
界面如下
![](https://cdn.jsdelivr.net/gh/beifeng5620/StaticPic@1.0.1/safety-events-plantform/images/howToUse/16.jpg)
说明如下
- 面板
    - 地图展示
    - 图表分析：展示当前地图区域中，一周之内的事件图表分析
    - 提交事件：可以提交任意地点的事件到审核
    - 使用指南
    - FAQ
    - 新闻
    - 联系

### 2.1.2图表分析
展示当前地图区域中，一周之内的事件图表分析
使用堆叠图和南丁格尔图展示，如图所示
![](https://cdn.jsdelivr.net/gh/beifeng5620/StaticPic@1.0.1/safety-events-plantform/images/howToUse/17.jpg)
![](https://cdn.jsdelivr.net/gh/beifeng5620/StaticPic@1.0.1/safety-events-plantform/images/howToUse/18.jpg)
###2.1.3事件提交
操作同前，地点自选（使用BD09ll坐标系），如图所示
![](https://cdn.jsdelivr.net/gh/beifeng5620/StaticPic@1.0.1/safety-events-plantform/images/howToUse/19.jpg)

# 三、API接口说明
## 3.1接口
### 3.1.1批量提交事件接口
```
域名(或ip:8080)/batchImportEvents/{uid}
```
1).需要申请uid，否则无法批量提交事件,发送邮件到beifeng666@gmail.com申请。
2).提交参数events格式如下：
```
[
    {
        lng:118,
        lat:24,
        time:2020-05-09 21:13:00,
        eventTypeId:1,
        contact:test@qq.com,
        flag:0,
        details:test
    },
    ...,
    {
        lng:118,
        lat:24,
        time:2020-05-09 21:13:00,
        eventTypeId:1,
        contact:test@qq.com,
        flag:0,
        details:test
    }
]
```
events对象数组说明：
参数 | 说明 |
:-: | :-: |
lng | BD09ll坐标系经度 |
lat | BD09ll坐标系纬度|
time | 事件发生时间，格式yyyy-MM-dd HH:mm:ss|
eventTypeId | 事件类型id|
contact | 联系方式|
flag | 事件处理标志，0未处理，1已处理|
details | 事件详情|

### 3.1.2事件获取接口
```
域名(或ip:8080)/getAllMarker
```
1).以当前时间为基准，返回之前一周内的事件
2).可选提交参数如下：
```
tlLng,tlLat,brLng,brLat
```
参数说明（不提交参数则返回所有事件，提交则返回范围内事件）
参数 | 说明 |
:-: | :-: |
tlLng | 矩形左上角BD09ll坐标系经度|
tlLat | 矩形左上角BD09ll坐标系纬度|
brLng | 矩形右下角BD09ll坐标系经度|
brLat | 矩形右下角BD09ll坐标系纬度|

### 3.1.3事件类型获取接口
```
域名(或ip:8080)/getAllEvent
```
1).返回所有事件的id和名称

### 3.1.4图表信息获取接口
```
域名(或ip:8080)/getChartsInfo
```
1).以当前时间为基准，返回之前一周内的事件分析信息
2).可选提交参数如下：
```
tlLng,tlLat,brLng,brLat
```
参数说明（不提交参数则返回所有，提交则返回范围内）
参数 | 说明 |
:-: | :-: |
tlLng | 矩形左上角BD09ll坐标系经度|
tlLat | 矩形左上角BD09ll坐标系纬度|
brLng | 矩形右下角BD09ll坐标系经度|
brLat | 矩形右下角BD09ll坐标系纬度|

### 3.1.5事件提交审核接口
```
域名(或ip:8080)/submitEvent
```
1).提交事件到后台审核
2).提交参数如下：
```
lng,lat,eventType,time,contact,details
```
参数说明（不提交参数则返回所有，提交则返回范围内）
参数 | 说明 |
:-: | :-: |
lng | 事件发生地的BD09ll坐标系经度|
lat | 事件发生地的BD09ll坐标系纬度|
eventType | 事件类型id|
time | 事件发生时间|
contact | 联系方式|
details | 事件细节|

# 四、其他
- 基于百度地图API开发: [百度地图API JavaScript API v2.0](http://lbsyun.baidu.com/index.php?title=jspopular/guide/widget)
- 基于Echarts的图表分析:[堆叠图](https://echarts.apache.org/examples/zh/editor.html?c=bar-y-category-stack) [南丁格尔图](https://echarts.apache.org/examples/zh/editor.html?c=doc-example/tutorial-styling-step5)
- 基于LayUI开发: [LayUI](https://www.layui.com/doc/)
- 搜索功能参考:[朵朵视野-轨迹经纬度拾取系统](https://duoduoview.com/getPoints/)
- 抽屉栏参考:[使用 HTML & CSS 制作左侧滑动导航条](https://www.bilibili.com/video/BV19a4y1t7BG)
- 接口后台参考:[尚硅谷SpringBoot顶尖教程](https://www.bilibili.com/video/BV1gW411W76m)
- 参考百度地图Vue组件化开发:[Vue Baidu Map](https://dafrok.github.io/vue-baidu-map/#/zh/index)
- 参考Vue.js到前端工程化: [webpack打包，以及Vue-cli3和Element-UI的使用](https://www.bilibili.com/video/BV1xJ41157m8)