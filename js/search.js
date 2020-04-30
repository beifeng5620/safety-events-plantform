$(function() {
    // 区域覆盖层参数
    var mapOption = {
        borderColor: 'rgba(255,0,0,0.8)',
        fillColor: 'rgba(255,0,0,0.8)',
        borderWidth: 1,
        borderType: 'solid'
    }

    // 标记数组
    var markersArray = [];

    // 根据名称搜索位置，然后区域和交通路线
    function searchByStationName(keyword) {
        $('.search-info').html('<p class="search-keyword">数据搜索中，请稍后...</p>').slideDown(100);
        // 百度地图搜索方法
        var localSearch = new BMap.LocalSearch(map);
        localSearch.enableAutoViewport();
        localSearch.setSearchCompleteCallback(function(searchResult) {
                console.log(searchResult)
                if (searchResult.Ir.length == 0) {
                    $('.search-info').html('<p class="search-keyword">搜索数据为空，请更换搜索条件</p>').slideDown(100);
                    return false;
                }
                var filterSearchResult = [];
                var filterSearchResultTitle = [];
                searchResult.Ir.forEach(function(item) {
                        if (filterSearchResultTitle.indexOf(item.title) == -1) {
                            item.type = 'point';
                            filterSearchResult.push(item);
                            filterSearchResultTitle.push(item.title);
                        }
                    })
                    // 搜索出来结果后默认以第一个为中心搜索
                console.log(filterSearchResult)
                map.centerAndZoom(filterSearchResult[0].point, 13); // 中心点
                searchArea(keyword, filterSearchResult);
            })
            // 执行搜索事件
        localSearch.search(keyword);
    }
    // 搜索列表初始化
    function searchListInit(filterSearchResult, searchLineName) {
        var html = "";
        var num = 0;
        filterSearchResult.forEach(function(child, index) {
            if (child.type == 'area') {
                html += '<div class="search-list clearfix special" data-index=' + index + '>' +
                    '<div class="list-l">行政区域</div>' +
                    '<div class="list-r">' +
                    ' <p class="title">' + child.title + '</p>' +
                    '</div>' +
                    '</div>'
            }
            if (child.type == 'line') {
                html += '<div class="search-list clearfix special" data-index=' + index + '>' +
                    '<div class="list-l">交通线路</div>' +
                    '<div class="list-r">' +
                    ' <p class="title">' + searchLineName + '</p>' +
                    '</div>' +
                    '</div>'
            }
            if (child.type == 'point') {
                num++;
                //var childStr = JSON.stringify(child, index);
                html += '<div class="search-list clearfix" data-index=' + index + '>' +
                    '<div class="list-l l-' + num + '"></div>' +
                    '<div class="list-r">' +
                    ' <p class="title">' + child.title + '</p>' +
                    ' <p class="address">' + child.address + '</p>' +
                    ' <p class="lat-long">' +
                    ' 经度：<span class="long">' + child.point.lng + '</span>' +
                    ' 纬度：<span class="lat">' + child.point.lat + '</span>' +
                    ' </p>' +
                    '</div>' +
                    '</div>'
            }
        })
        $('.search-info').html(html).slideDown(100);
        // 添加点击事件
        searchListClickFun(filterSearchResult, searchLineName);
    }
    // 区域搜索方法
    // 获取区级块的轨迹信息
    function searchArea(keyword, filterSearchResult) {
        var bdary = new BMap.Boundary(map);
        var strokeColorArray = mapOption.borderColor.split(',');
        var strokeColor = mapOption.borderColor.indexOf('rgba') != -1 ?
            'rgb(' + [strokeColorArray[0].split('(')[1], strokeColorArray[1], strokeColorArray[2]].join(',') + ')' :
            mapOption.borderColor;
        var strokeOpacity = strokeColorArray[3].split(')')[0];
        var fillColorArray = mapOption.fillColor.split(',');
        var fillColor = mapOption.fillColor.indexOf('rgba') != -1 ?
            'rgb(' + [fillColorArray[0].split('(')[1], fillColorArray[1], fillColorArray[2]].join(',') + ')' :
            mapOption.fillColor;
        var fillOpacity = fillColorArray[3].split(')')[0];
        bdary.get(keyword, function(rs) {
            var count = rs.boundaries.length;
            if (count == 0) {
                searchLine(keyword, filterSearchResult);
                return false;
            }
            filterSearchResult.splice(0, 0, {
                title: keyword,
                type: 'area',
                travelInfo: []
            })
            for (var i = 0; i < count; i++) {
                var ply = new BMap.Polygon(rs.boundaries[i], {
                    strokeWeight: mapOption.borderWidth,
                    strokeColor: strokeColor,
                    fillColor: fillColor,
                    fillOpacity: fillOpacity
                })
                filterSearchResult[0].travelInfo.push({
                        ply: ply,
                        locationInfo: rs.boundaries[i]
                    })
                    //map.addOerlay(ply);
            }
            searchLine(keyword, filterSearchResult);
        })
    }
    // 公交线路搜索
    function searchLine(keyword, filterSearchResult) {
        var searchLineName = '';
        var busline = new BMap.BusLineSearch(map, {
            onGetBusListComplete: function(result) {
                if (result) {
                    var fstLine = result.getBusListItem(0);
                    if (fstLine && fstLine.name.indexOf('-') != -1) {
                        searchLineName = fstLine.name;
                        transit.search(fstLine.name.split('-')[0].split('(')[1], fstLine.name.split('-')[1].split(')')[0])
                    } else {
                        searchListInit(filterSearchResult)
                    }
                }
            }
        })
        busline.getBusList(keyword);
        var transit = new BMap.TransitRoute(map, {
            onSearchComplete: function(result) {
                if (transit.getStatus() == BMAP_STATUS_SUCCESS) {
                    // 直接获取第一个方案
                    var plan = result.getPlan(0);
                    // 遍历所有公交线路
                    var allLinePath = [];
                    for (i = 0; i < plan.getNumLines(); i++) {
                        allLinePath = allLinePath.concat(plan.getLine(i).getPath());
                        addLine(plan.getLine(i).getPath(), allLinePath);
                    }
                    // 最后根据公交线路的点设置地图视野
                    //map.setViewport(allLinePath);
                } else {
                    searchListInit(filterSearchResult, searchLineName)
                }
            }
        });

        function addLine(path, allLinePath) {
            var strokeColorArray = mapOption.borderColor.split(',');
            var strokeColor = mapOption.borderColor.indexOf('rgba') != -1 ?
                'rgb(' + [strokeColorArray[0].split('(')[1], strokeColorArray[1], strokeColorArray[2]].join(',') + ')' :
                mapOption.borderColor;
            var strokeOpacity = strokeColorArray[3].split(')')[0];
            var fillColorArray = mapOption.fillColor.split(',');
            var fillColor = mapOption.fillColor.indexOf('rgba') != -1 ?
                'rgb(' + [fillColorArray[0].split('(')[1], fillColorArray[1], fillColorArray[2]].join(',') + ')' :
                mapOption.fillColor;
            var fillOpacity = fillColorArray[3].split(')')[0];
            var ply = new BMap.Polyline(path, {
                strokeColor: strokeColor,
                strokeOpacity: strokeOpacity,
                strokeWeight: mapOption.borderWidth,
                enableClicking: false
            });
            filterSearchResult.splice(0, 0, {
                title: keyword,
                type: 'line',
                travelInfo: [{
                    ply: ply,
                    locationInfo: allLinePath
                }]
            })
            searchListInit(filterSearchResult, searchLineName)
                //map.addOverlay(ply)
        }
    }
    // 搜索列表请求事件
    function searchListClickFun(filterSearchResult, searchLineName) {
        $('.search-list').click(function() {
            var index = $(this).data('index');
            var newMarkType = null;
            if (filterSearchResult[index].type == 'line') {
                newMarkType = '交通线路';
            }
            if (filterSearchResult[index].type == 'area') {
                newMarkType = '行政区域';
            }
            if (filterSearchResult[index].type == 'point') {
                newMarkType = '点坐标';
            }
            // 标记点
            if (filterSearchResult[index].type == 'point') {
                var mk = new BMap.Marker(filterSearchResult[index].point);
                map.addOverlay(mk);
                markersArray.splice(0, 0, mk);
                map.centerAndZoom(filterSearchResult[index].point, 13);
            }
            if (filterSearchResult[index].type == 'area') {
                var location = [];
                var overlay = [];
                filterSearchResult[index].travelInfo.forEach(function(item) {
                    var locationInfo = [];
                    item.locationInfo.split(';').forEach(function(item1) {
                        locationInfo.push({
                            lng: Number(item1.split(',')[0]),
                            lat: Number(item1.split(',')[1])
                        })
                    })
                    location.push({
                        locationInfo: locationInfo,
                        name: filterSearchResult[index].title + '[行政区域]'
                    })
                    overlay.push(item.ply);
                })

                // 默认将页面在第一个区域居中
                map.setViewport(location[0].locationInfo);
                overlay.forEach(function(item) {
                    map.addOverlay(item);
                    markersArray.splice(0, 0, item);
                })
            }
            if (filterSearchResult[index].type == 'line') {
                var location = [];
                var overlay = [];
                filterSearchResult[index].travelInfo.forEach(function(item) {
                    location.push({
                        locationInfo: item.locationInfo,
                        name: searchLineName + '[交通线路]'
                    })
                    overlay.push(item.ply);
                })

                // 默认将页面在第一个区域居中
                map.setViewport(filterSearchResult[index].travelInfo[0].locationInfo);
                overlay.forEach(function(item) {
                    map.addOverlay(item);
                    markersArray.splice(0, 0, item);
                })
            }
        })
    }
    // 搜索方法
    function searchFun() {
        var searchValue = $('.search-input').val();
        if (!searchValue) {
            alert('搜索关键字为空，请输入您要搜索的关键字')
            return false;
        }
        // 执行搜索事件
        searchByStationName(searchValue);
    }
    // 搜索按钮点击事件
    $('.search-btn').click(function() {
        searchFun();
    })
    $('.search-input').on('keydown', function(e) {
        if (e.keyCode == 13) {
            searchFun();
        } else {
            $('.search-info').slideUp(100, function() {
                $('.search-info').html('');
            })
        }
    })
    $('.search-input').on('click', function(e) {
        if ($('.search-list').length > 0) {
            $('.search-info').slideDown(100);
        }
    })
    $('.search-input').on('input', function(e) {
        if ($(this).val().length == 0) {
            markersArray.forEach(item =>
                map.removeOverlay(item)
            )
        }
    })

    // 初始化函数
    function init() {
        var screenWidth = $(window).width();
        var windowHeight = $(window).height();
        var searchInfoHeight = windowHeight - 54;
        $('.search-info').css({
            maxHeight: searchInfoHeight + 'px'
        })

        // 手动去除百度logo
        var mapInterval = setInterval(function() {
            if ($('.anchorBL').length != 0 && $('.BMap_cpyCtrl').length != 0) {
                $('.anchorBL').remove();
                $('.BMap_cpyCtrl').remove();
                clearInterval(mapInterval)
            }
        }, 10)
    }
    init();
    $(window).resize(function() {
        init();
    })
})