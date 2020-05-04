 // 创建地图实例
 var map = new BMap.Map("container", {
     enableMapClick: false
 });
 // 初始化地图，设置中心点坐标(默认天安门)和地图级别 
 map.centerAndZoom(new BMap.Point(116.404, 39.915), 13);
 // 允许鼠标缩放
 map.enableScrollWheelZoom(true);

 // 添加城市列表控件
 var size = new BMap.Size(10, 20);
 map.addControl(new BMap.CityListControl({
     anchor: BMAP_ANCHOR_TOP_RIGHT,
     offset: size,
     //切换城市之前事件
     onChangeBefore: function() {
         alert('before');
     },
     //切换城市之后事件
     onChangeAfter: function() {
         alert('after');
     }
 }));
 // 添加定位控件
 var geolocationControl = new BMap.GeolocationControl({
     anchor: BMAP_ANCHOR_BOTTOM_RIGHT
 });
 geolocationControl.addEventListener("locationSuccess", function(e) {
     // 定位成功事件
     var address = '';
     address += e.addressComponent.province;
     address += e.addressComponent.city;
     address += e.addressComponent.district;
     address += e.addressComponent.street;
     address += e.addressComponent.streetNumber;
     alert("当前定位地址为：" + address);
     getAllMarkers();
 });
 geolocationControl.addEventListener("locationError", function(e) {
     // 定位失败事件
     alert(e.message);
 });
 map.addControl(geolocationControl);

 getLocation();

 function getLocation() {
     // 使用的场景是用户首次访问页面，这时候layui可能没加载好，所以这里重新加载一下再使用
     layui.use(['layer'], function() {
         var layer = layui.layer;
         var loading = layer.load(2);
         // 自动获取定位
         var geolocation = new BMap.Geolocation();
         geolocation.getCurrentPosition(function(r) {
             layer.close(loading);
             if (this.getStatus() == BMAP_STATUS_SUCCESS) {
                 map.panTo(new BMap.Point(r.point.lng, r.point.lat));
                 getAllMarkers();
             } else {
                 alert('failed' + this.getStatus());
             }
         });
     });
 }

 function getAllMarkers() {
     var rect = getRect();
     $.ajax({
         type: "post",
         url: "http://localhost/getAllMarker",
         data: {
             tlLng: rect.topLeft.lng,
             tlLat: rect.topLeft.lat,
             brLng: rect.bottomRight.lng,
             brLat: rect.bottomRight.lat
         },
         dataType: "json",
         success: function(resp) {
             var markers = new Array(resp.count);
             for (var i = 0; i < resp.count; i++) {
                 (function() {
                     var markerInfo = resp.markers[i];
                     // 创建标注点
                     var pt = new BMap.Point(markerInfo.pt.lng, markerInfo.pt.lat);
                     // 创建图标
                     var myIcon = new BMap.Icon(`./images/pin/${markerInfo.type}.svg`, new BMap.Size(47, 35));
                     // 创建标注
                     markers[i] = new BMap.Marker(pt, {
                         icon: myIcon
                     });
                     // 事件监听
                     markers[i].addEventListener("click", function() {
                         var opts = {
                                 width: 200, // 信息窗口宽度
                                 height: 100, // 信息窗口高度
                                 title: markerInfo.typeName // 信息窗口标题
                             }
                             // 创建信息窗口对象 
                         var infoWindow = new BMap.InfoWindow(`发生时间:${markerInfo.time}详情:${markerInfo.details}`, opts);
                         // 开启信息窗口
                         map.openInfoWindow(infoWindow, pt);
                     });
                     // 将标注添加到地图中
                     map.addOverlay(markers[i]);
                 })();
             }
         }
     });
 }

 // 监听地图的右键点击事件 存右键点击时的坐标
 var rightclickPoint = {};
 map.addEventListener("rightclick", function(e) {
     rightclickPoint = {
         lng: e.point.lng,
         lat: e.point.lat
     };
 });
 // 右键菜单
 var menu = new BMap.ContextMenu();
 var txtMenuItem = [{
     text: '放大',
     callback: function() {
         map.zoomIn();
     }
 }, {
     text: '缩小',
     callback: function() {
         map.zoomOut();
     }
 }, {
     // 定义菜单项的显示文本
     text: '提交事件',
     // 定义菜单项点击触发的回调函数
     callback: function(e) {
         // 回调函数的event对象只有拿到地图的坐标，没有经纬度
         // 所以需要地图监听右键点击事件，拿到经纬度传到这里
         //  alert('点击的经纬度：' + JSON.stringify(rightclickPoint));
         uploadEvent(rightclickPoint);
     }
 }];
 for (var i = 0; i < txtMenuItem.length; i++) {
     // 添加菜单项实例
     menu.addItem(new BMap.MenuItem(
         // 传入菜单项的显示文本           
         txtMenuItem[i].text,
         // 传入菜单项的回调函数
         txtMenuItem[i].callback, {
             // 指定菜单项的宽度
             width: 300,
             // 指定菜单项dom的id
             id: 'menu' + i
         }
     ));
 }
 map.addContextMenu(menu);

 // clickPoint右击地图的点击位置，如果有传的话就不用输入坐标，否则输入坐标
 function uploadEvent(clickPoint) {
     $.ajax({
         type: "get",
         url: "http://localhost/getAllEvent",
         data: {},
         dataType: "json",
         success: function(resp) {
             renderEventSubmitForm(resp, clickPoint)
         }
     });
 }

 // 渲染提交事件的页面，event是事件类型，clickPoint地图点击的经纬度
 function renderEventSubmitForm(event, clickPoint) {
     var options = "";
     for (var i = 0; i < event.count; i++) {
         options += `<option value="${event.type[i].id}">${event.type[i].name}</option>`;
     }
     var formDiv = `
           <form class="layui-form" action="">
              <div class="layui-form-item">
                  <label class="layui-form-label" style="box-sizing:content-box">经度(BD09ll)</label>
                  <div class="layui-input-block">
                      <input type="text" name="lng" required lay-verify="required" placeholder="请输入BD09ll坐标系下的经度" autocomplete="off" class="layui-input" ${clickPoint?'disabled':''} value="${clickPoint?clickPoint.lng:''}">
                  </div>
              </div>
              <div class="layui-form-item">
                  <label class="layui-form-label" style="box-sizing:content-box">纬度(BD09ll)</label>
                  <div class="layui-input-block">
                      <input type="text" name="lat" required lay-verify="required" placeholder="请输入BD09ll坐标系下的纬度" autocomplete="off" class="layui-input" ${clickPoint?'disabled':''} value="${clickPoint?clickPoint.lat:''}">
                  </div>
              </div>
              <div class="layui-form-item">
                  <label class="layui-form-label" style="box-sizing:content-box">事件类型</label>
                  <div class="layui-input-block">
                      <select name="eventType" lay-verify="required">
                  <option value=""></option>
              ` + options +
         `
                  </select>
                  </div>
              </div>
              <div class="layui-form-item">
                  <label class="layui-form-label" style="box-sizing:content-box">发生时间</label>
                  <div class="layui-input-block">
                      <input type="text" name="time" required lay-verify="required" placeholder="请选择时间" autocomplete="off" class="layui-input" id="timePicker">
                  </div>
              </div>
              <div class="layui-form-item">
              <label class="layui-form-label" style="box-sizing:content-box">详情</label>
                <div class="layui-input-block">
                    <input type="text" name="details" required lay-verify="required" placeholder="请填写事件详情" autocomplete="off" class="layui-input">
                </div>
              </div>
              <div class="layui-form-item">
                  <label class="layui-form-label" style="box-sizing:content-box">联系方式</label>
                  <div class="layui-input-block">
                      <input type="text" name="contact" required lay-verify="required" placeholder="请填写您的联系方式" autocomplete="off" class="layui-input">
                  </div>
              </div>
              <div class="layui-form-item">
                  <div class="layui-input-block">
                      <button class="layui-btn" lay-submit lay-filter="formDemo">立即提交</button>
                      <button type="reset" class="layui-btn layui-btn-primary" id="_reset">重置</button>
                  </div>
              </div>
          </form>
           `;
     layer.open({
         type: 1,
         area: ['100%', '100%'], // 解决时间组件不能选取的BUG （框架的问题）
         shadeClose: true, // 点击遮罩关闭
         content: formDiv,
         success: function(layero, index) {
             // 解决下拉框的只显示一次的BUG （框架的问题）
             $('#_reset').click();
         }
     });

     //Demo
     layui.use('form', function() {
         var form = layui.form;

         //监听提交
         form.on('submit(formDemo)', function(data) {
             layer.msg(JSON.stringify(data.field));
             console.log(JSON.stringify(data.field));
             console.log(data.field);
             $.ajax({
                 type: "post",
                 url: "http://localhost/submitEvent",
                 data: data.field,
                 success: function(resp) {
                     layer.msg(resp)
                 }
             });
             return false;
         });
     });
     layui.use('laydate', function() {
         var laydate = layui.laydate;

         //执行一个laydate实例
         laydate.render({
             elem: '#timePicker', //指定元素
             type: 'datetime'
         });
     });
 }

 function getRect() {
     var rect = map.getSize();
     var bottomRightPx = new BMap.Pixel(rect.width, rect.height);
     var topLeftPx = new BMap.Pixel(0, 0);
     var bottomRightPt = map.pixelToPoint(bottomRightPx);
     var topLeftPt = map.pixelToPoint(topLeftPx);
     return {
         topLeft: {
             lng: topLeftPt.lng,
             lat: topLeftPt.lat
         },
         bottomRight: {
             lng: bottomRightPt.lng,
             lat: bottomRightPt.lat
         }
     };
 }

 function getCharts() {
     var chartsDiv = `
     <div id="stackedBarChart" style="width: 100%;height:500px;"></div>
     <div id="NightingaleRoseChart" style="width: 100%;height:400px;"></div>
    `;

     layer.open({
         type: 1,
         area: ['100%', '100%'],
         shadeClose: true,
         content: chartsDiv,
         success: function(layero, index) {
             initCharts();
         }
     });
 }


 function initCharts() {
     var legendData = [];
     var seriesData = [];
     var pieData = [];
     $.ajax({
         type: "get",
         url: "http://localhost/getChartsInfo",
         data: getRect(), // 区域信息
         dataType: "json",
         async: false,
         success: function(resp) {
             for (var i = 0; i < resp.count; i++) {
                 legendData.push(resp.type[i].name);
                 seriesData.push({
                     name: resp.type[i].name,
                     type: 'bar',
                     stack: '总量',
                     label: {
                         show: true,
                         position: 'insideRight'
                     },
                     data: resp.type[i].weeklyHappened
                 })
                 pieData.push({
                     value: resp.type[i].weeklyHappened.reduce(function(prev, cur, index, array) {
                         return prev + cur;
                     }),
                     name: resp.type[i].name
                 })
             }
         }
     });
     var maxCnt = 0;
     pieData.forEach(function(item, index, array) {
         if (item.value > maxCnt) {
             maxCnt = item.value;
         }
     });
     var myChart = echarts.init(document.getElementById('stackedBarChart'));
     var myChart2 = echarts.init(document.getElementById('NightingaleRoseChart'));
     var option = {
         tooltip: {
             trigger: 'axis',
             axisPointer: {
                 type: 'shadow'
             }
         },
         legend: {
             data: legendData
         },
         grid: {
             left: '3%',
             right: '4%',
             bottom: '3%',
             containLabel: true
         },
         xAxis: {
             type: 'value'
         },
         yAxis: {
             type: 'category',
             data: ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
         },
         series: seriesData
     };
     var option2 = {
         tooltip: {
             trigger: 'item'
         },
         visualMap: {
             show: false,
             max: maxCnt * 1.5, // 使最多的不显示为纯白色
             inRange: {
                 colorLightness: [0, 1]
             }
         },
         series: [{
             name: '事件构成',
             type: 'pie',
             radius: '55%',
             data: pieData,
             roseType: 'angle'
         }]
     };
     myChart.setOption(option);
     myChart2.setOption(option2);
 }