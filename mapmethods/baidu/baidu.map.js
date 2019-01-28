import MarkerClusterer from './markercluster'
// 地图纠偏方法
import gcoord from 'gcoord'

var MapApi = (function(win) {
    var array = Array.prototype.slice;
    var toString = Object.prototype.toString;
    var hasOwn = Object.prototype.hasOwnProperty;
    var trfficMap=null;
    // 浅拷贝
    var extend = function(c, p) {
            for (var i in p) { c[i] = p[i]; }
            c.parent = p;
            return c;
        }
        /*
         * name: 地图私有方法
         */
    var _selfMap, _openDrawingManager, _self,
        _rectangledrawendListener, _polygondrawendListener, _circledrawendListener, _linedrawendListener;
    var _map = {
        label: function(point, str, options) {
            var text,
                temp = {
                    position: point, // 指定文本标注所在的地理位置
                    offset: new BMap.Size(options.x || -20,options.y || 36) //设置文本偏移量
                };
            text = new BMap.Label(str, temp); // 创建文本标注对象
            text.setStyle(extend({
                color: "#666",
                fontSize: "12px",
                height: "24px",
                lineHeight: "24px",
                minWidth: "66px",
                fontFamily: "宋体",
                backgroundColor: "#f8f8f8",
                borderColor: "#dddbd5",
                boxShadow: "2px",
                textAlign: "center"
            }, options));
            return text;
        },
        //实例化鼠标绘制工具
        openDrawingManager: function(options) {
            var styleOptions = {
                strokeColor: "red", //边线颜色。
                fillColor: "red", //填充颜色。当参数为空时，圆形将没有填充效果。
                strokeWeight: 3, //边线的宽度，以像素为单位。
                strokeOpacity: 0.8, //边线透明度，取值范围0 - 1。
                fillOpacity: 0.6, //填充的透明度，取值范围0 - 1。
                strokeStyle: 'solid' //边线的样式，solid或dashed 
            };
            return new BMapLib.DrawingManager(_selfMap, {
                isOpen: false, //是否开启绘制模式
                enableDrawingTool: false, //是否显示工具栏
                drawingToolOptions: {
                    anchor: BMAP_ANCHOR_TOP_RIGHT, //位置
                    offset: new BMap.Size(5, 5), //偏离值
                    scale: 0.8 //工具栏缩放比例
                },
                circleOptions: styleOptions, //圆的样式
                polylineOptions: styleOptions, //线的样式
                polygonOptions: styleOptions, //多边形的样式
                rectangleOptions: styleOptions //矩形的样式
            });
        },
        // 多边形公共函数
        polygonPublic: function(name) {
            _openDrawingManager = null;
            _openDrawingManager = _map.openDrawingManager();
            _openDrawingManager.setDrawingMode(name);
        },
        utils: {
            isArray: function(obj) {
                return toString.call(obj) === '[object Array]'
            },
            isFunction: function(obj) {
                return toString.call(obj) === '[object Function]'
            }
        }
    }

    var MapApi = function MapApi(map) {
        this.map = map;
        this.MarkerClusterer = new MarkerClusterer(this.map, {
            maxZoom: 15
        });
        _selfMap = map;
        _self = this;
    };

    /*
     * name: 地图暴露出去的方法
     */
    MapApi.prototype = {

        // 获得点的地图对象 -- 格式: {longitude: 116.404, latitude: 39.915}
        point: function(point) {
            return new BMap.Point(point.longitude || point.lng, point.latitude || point.lat)
        },
        setText:function(point,name,style){
            var temp = {
                position: point, // 指定文本标注所在的地理位置
                offset: new BMap.Size(0, 0) //设置文本偏移量
            };
            var text = new BMap.Label(name, temp);
            text.setStyle({
                'background-color':'#fff',
                'border':'solid 1px #0088ff',
                'padding':'10px 20px'
            });
            return text;
        },
        // 设置地图点的图标
        setIcon: function(url, width, height) {
            return new BMap.Icon(url, new BMap.Size(width, height))
        },
        setCity:function(city){
            _self.map.centerAndZoom(city);
        },
        // 获得几个点的最佳视野[marker, marker]
        getBestView: function(views) {
            var points = [];
            if (toString.call(views) === '[object Array]') {
                views.forEach(view => {
                    points.push(view.point ? view.point : view);
                })
                _self.map.setViewport(points);
            } else {
                _self.map.setViewport(views.points);
                // throw new Error('views is should be Array')
            }
        },
        //热力图
        //@params {Array} points: point点数组
        heatMap(points){
            var  heatmap;
            heatmap = new BMapLib.HeatmapOverlay({
                "radius":25,
                "visible":true,
                'gradient':{
                    0.4: '#409EFF',
                    0.9: 'yellow',
                    1.0: 'red'
                }
            });
            _self.map.addOverlay(heatmap);
            heatmap.setDataSet({data:points,max:points.count});
        },
        setMapTypes(flag,Roat){
            if(flag){
                Roat ? _self.map.setMapType(BMAP_HYBRID_MAP) : _self.map.setMapType(BMAP_SATELLITE_MAP)
            }else{
                _self.map.setMapType(BMAP_NORMAL_MAP);
            }
        },
        addListener(bindObj,eventName,fun){
            _self.map.addEventListener(eventName,fun);
        },
        removeListener(eventName,fun){
            _self.map.removeEventListener(eventName,fun);
        },

        // 获得地图的覆盖类(overlay) ----  args[0](图标地址) args[1](图标大小)
        mapAddpoint: function(points, ...args) {
            let size,
                myicon,
                point = _self.point({ lng: points.longitude, lat: points.latitude }),
                marker = new BMap.Marker(point);
            if (args.length !== 0) {
                args[1] == undefined ? size = { width: 32, height: 32 } : size = args[1];
                myicon = args[0] ? _self.setIcon(args[0], size.width, size.height) : null;
                marker = new BMap.Marker(point, {
                    icon: myicon
                });
            }
            marker.point = point;
            return marker;
        },
        //获取地图当前层级
        getZoom(){
            return _self.map.getZoom();
        },
        //设置地图当前层级
        setZoom(number){
            _self.map.setZoom(number);
        },
        //获取地图视野的对角经纬度
        getBounds(){
            let bounds=_self.map.getBounds();
            let params={
                minLng: Math.max(bounds.getSouthWest().lng, -180),
                minLat: Math.max(bounds.getSouthWest().lat,-74),
                maxLng: Math.min(bounds.getNorthEast().lng, 180),
                maxLat: Math.min(bounds.getNorthEast().lat,74)
            }
            return  params;
        },

        // 单个点居中
        moveToCenter: function(point, zoom) {
            var minSize = _self.map.getZoom(),
                size, _point;
            point[0] ? _point = point[0] : _point = point;;
            if (arguments.length === 2) {
                size = Math.max(minSize, zoom);
                _self.map.centerAndZoom(_point, zoom);
            } else {
                _self.map.centerAndZoom(_point, minSize);
            }
        },
        //本地搜索区域
        Geocoder: function(location) {
            var myGeo = new BMap.LocalSearch(_selfMap, {
                renderOptions: { map: _selfMap }
            });
            myGeo.search(location);
            myGeo.setMarkersSetCallback(_ => {
                _.forEach(ele => {
                    _selfMap.removeOverlay(ele.marker)
                });
            })
        },
        mapPanTo: function(point) {
            this.map.panTo(point);
        },
        // 从地图添加点(将marker添加到地图)
        addOverlay: function(overlay) {
            _self.map.addOverlay(overlay);
        },

        // 从地图上移除覆盖物
        removeOverlay: function(overlay) {
            _self.map.removeOverlay(overlay);
        },
        // 清除地图所有点
        clearOverlays: function() {
            _self.map.clearOverlays();
        },
        // 添加文字标注
        addLabel: function(marker, text, options = {}) {
            var label = _map.label(marker.point, text, options);
            marker.setLabel(label);
            return label;
        },
        //显示圆形 -- 自带显示最佳视野
        mapAddcircle: function(point, radius, options) {
            var pt = this.point(point),
                options = options || {},
                defs = {
                    strokeColor: '#20a0ff',
                    strokeWeight: 2,
                    strokeOpacity: 0.5
                };
            var marker = new BMap.Circle(pt, radius, extend(defs, options));
            this.map.addOverlay(marker);
            this.getBestView([marker.getBounds().getSouthWest(), marker.getBounds().getNorthEast()]);
            //this.map.setZoom(16);
            return marker;
        },
        //显示矩形 -- {minLng: "", minLat: "", maxLng: "", maxLat: ""}
        mapAddrectangle: function(rectangle, options) {
            for (var i in rectangle) {
                if (i == 'minLng' || i == 'minLat' || i == 'maxLng' || i == 'maxLat') {
                    //...
                } else {
                    throw new Error('correct format: {minLng: "", minLat: "", maxLng: "", maxLat: ""}')
                }
            }
            var leftTop = this.point({ lng: rectangle.minLng, lat: rectangle.minLat }),
                rightBottom = this.point({ lng: rectangle.maxLng, lat: rectangle.maxLat }),
                defs = {
                    strokeColor: '#20a0ff',
                    strokeWeight: 2,
                    strokeOpacity: 1
                };
            var marker = new BMap.Polygon([
                this.point({ lng: rectangle.minLng, lat: rectangle.minLat }),
                this.point({ lng: rectangle.maxLng, lat: rectangle.minLat }),
                this.point({ lng: rectangle.maxLng, lat: rectangle.maxLat }),
                this.point({ lng: rectangle.minLng, lat: rectangle.maxLat })
            ], extend(defs, options));
            this.map.addOverlay(marker);
            this.getBestView([leftTop, rightBottom]);
            return marker;
        },
        //显示多边形
        mapAddpolygon: function(point, options) {
            var points = [],
                defs = {
                    strokeColor: "blue",
                    strokeWeight: 2,
                    strokeOpacity: 0.5
                };
            if (_map.utils.isArray(point)) {
                for (var i = 0, len = point.length; i < len; i++) {
                    points.push(this.point(point[i]))
                }
                var marker = new BMap.Polygon(points, extend(defs, options));
                marker.points = points;
                this.addOverlay(marker);
                this.getBestView(marker);
                return marker;
            }
        },
        //显示路线
        mapAddline: function(point, options) {
            var points = [],
                defs = {
                    strokeColor: "#5298ff",
                    strokeWeight: 6,
                    strokeOpacity: 1
                };
            if (_map.utils.isArray(point)) {
                for (var i = 0, len = point.length; i < len; i++) {
                    points.push(this.point(point[i]))
                }
                var marker = new BMap.Polyline(points, extend(defs, options));
                this.addOverlay(marker);
                this.getBestView(points);
                marker.points = points;
                return marker;
            }
        },
        //画圆
        onclickCircle: function(callback) {
            _map.polygonPublic(BMAP_DRAWING_CIRCLE);
            (_circledrawendListener == null) &&
            (_circledrawendListener = _openDrawingManager.addEventListener('overlaycomplete', onCircleDrawend));
            _openDrawingManager.open();

            function onCircleDrawend(circleOverlay) {
                var options = {
                    points: circleOverlay.overlay.getPath(),
                    overlay: circleOverlay.overlay,
                    center: circleOverlay.overlay.point,
                    radius: circleOverlay.overlay.getRadius()
                };
                _openDrawingManager.close();
                if (_map.utils.isFunction(callback)) {
                    callback(options);
                }
            }
        },
        // 画折线
        onclickLine: function(callback) {
            _map.polygonPublic(BMAP_DRAWING_POLYLINE);
            (_linedrawendListener == null) &&
            (_linedrawendListener = _openDrawingManager.addEventListener('overlaycomplete', onLineDrawend));
            _openDrawingManager.open();

            function onLineDrawend(lineOverlay) {
                var options = {
                    points: lineOverlay.overlay.getPath(),
                    overlay: lineOverlay.overlay
                };
                _openDrawingManager.close();
                if (_map.utils.isFunction(callback)) {
                    callback(options);
                }
            }
        },
        // 画多边形
        onclickPolygon: function(callback) {
            _map.polygonPublic(BMAP_DRAWING_POLYGON);
            (_polygondrawendListener == null) &&
            (_polygondrawendListener = _openDrawingManager.addEventListener('overlaycomplete', onPolygonDrawend));
            _openDrawingManager.open();

            function onPolygonDrawend(polygonOverlay) {
                var options = {
                    points: polygonOverlay.overlay.getPath(),
                    overlay: polygonOverlay.overlay
                };
                _openDrawingManager.close();
                if (_map.utils.isFunction(callback)) {
                    callback(options);
                }
            }
        },
        // 画矩形
        onclickRectangle: function(callback) {
            _map.polygonPublic(BMAP_DRAWING_RECTANGLE);
            (_rectangledrawendListener == null) &&
            (_rectangledrawendListener = _openDrawingManager.addEventListener('overlaycomplete', onRectangleDrawend));
            _openDrawingManager.open();

            function onRectangleDrawend(rectangleOverlay) {
                var options = {};
                var params = {
                    minLng: rectangleOverlay.overlay.getPath()[0].lng,
                    minLat: rectangleOverlay.overlay.getPath()[2].lat,
                    maxLng: rectangleOverlay.overlay.getPath()[2].lng,
                    maxLat: rectangleOverlay.overlay.getPath()[0].lat
                };
                options.points = rectangleOverlay.overlay.getPath();
                options.params = params;
                options.overlay = rectangleOverlay.overlay
                _openDrawingManager.close();
                if (_map.utils.isFunction(callback)) {
                    callback(options);
                }
            }
        },
        // 创建信息窗口对象 
        infoWindow: function(content, options) {
            var defs = {
                width: 0, // 信息窗口宽度
                height: 0, // 信息窗口高度
                title: "", // 信息窗口标题
                offset: new BMap.Size(-10, -20)
            };
            return new BMap.InfoWindow(content, extend(defs, options))
        },
        // 打开信息窗口
        openInfoWindow: function(content, options, point) {
            var infoWindow = _self.infoWindow(content, options);
            _self.map.openInfoWindow(infoWindow, point);
            return infoWindow;
        },
        cvOpenInfoWindow: function(infoWindow, point) {
            _self.map.openInfoWindow(infoWindow, point);
        },
        closeInfoWindow: function(infoWindow) {
            infoWindow.close();
        },
        //点击覆盖物打开弹窗
        overlayClickOpenInfoWindow(overlay, point, content, callback, options) {
            overlay.addEventListener('click', function() {
                var infoWindow = _self.openInfoWindow(content, options, point);
                if (_map.utils.isFunction(callback)) {
                    callback(infoWindow);
                }
            });
        },
        // 路书功能
        lushu: function(points, content, speed, icon, landmarkPois, num) {
            let img = _self.setIcon(icon, 32, 32);
            if (arguments.length == 6) {
                return new BMapLib.LuShu(_self.map, points, {
                    defaultContent: content,
                    speed: speed,
                    autoView: true,
                    icon: img,
                    enableRotation: true,
                    landmarkPois: landmarkPois
                }, num)
            } else {
                throw new Error('map,content,speed,icon,landmarkPois must be')
            }
        },
        //修改覆盖物样式
        changeStyle:function (marker,options) { 
            options.fillColor && marker.setFillColor(options.fillColor)
            options.strokeColor && marker.setStrokeColor(options.strokeColor)
            options.strokeOpacity && marker.setStrokeOpacity(options.strokeOpacity)
            options.fillOpacity && marker.setFillOpacity(options.fillOpacity)
            options.strokeWeight && marker.setStrokeWeight(options.strokeWeight)
            options.strokeStyle && marker.setStrokeStyle(options.strokeStyle)
            return marker
         },
        //是否开启编辑
        overlayEdit: function(overlay, flag) {
            if (flag)
                overlay.enableEditing();
            else
                overlay.disableEditing();
        },
        // 改变图标
        setPointIcon: function(marker, icon) {
            marker.setIcon(icon);
            return marker;
        },
        //marker点移动
        setPosition: function(marker, pointObj) {
            marker.setPosition(pointObj);
            return marker;
        },
        // 点改变方向
        setRotation: function(marker, direction) {
            marker.setRotation(direction);
            return marker;
        },
        //获取圆形的数据
        getCircleOptions(overlay) {
            var options = {
                points: overlay.getPath(),
                overlay: overlay,
                center: overlay.point,
                radius: overlay.getRadius()
            };
            return options;
        },
        //获取多边形数据
        getPolygonOptions(overlay) {
            var options = {
                points: overlay.getPath(),
                overlay: overlay
            };
            return options;
        },
        getLineOptions(overlay) {
            var options = {
                points: overlay.getPath(),
                overlay: overlay
            };
            return options;
        },
        // 拉框放大
        rectangleZoom(options) {
            let defs = {
                autoClose: true
            };
            return new BMapLib.RectangleZoom(_self.map, extend(defs, options));
        },
        // 测距工具
        distanceTool(options) {
            let defs = {
                lineColor: '#5498ff',
                opacity: 1
            }
            return new BMapLib.DistanceTool(_self.map, extend(defs, options));
        },
        setTrffic(flag){
            if(flag){
                trfficMap = new BMap.TrafficLayer();        // 创建交通流量图层实例    
                _self.map.addTileLayer(trfficMap); 
            }else{
                _self.map.removeTileLayer(trfficMap); 
            }
              
        },

        /**
         * 聚合方法 添加， 删除
         * @params {Array} markers: 多个或单个覆盖物数组
         */
        markerClustererAddMarkers: function(markers) {
            return _self.MarkerClusterer.addMarkers(markers);
        },
        markerClustererAddMarker: function(marker) {
            return _self.MarkerClusterer.addMarker(marker);
        },
        markerClustererremoveMarkers: function(markers) {
            return _self.MarkerClusterer.removeMarkers(markers);
        },
        markerClustererremoveMarker: function(marker) {
            return _self.MarkerClusterer.removeMarker(marker);
        },
        markerClustererClearAll: function() {
            return _self.MarkerClusterer.clearMarkers();
        },
        transform: function(wgLat, wgLon) {
            var results = gcoord.transform([wgLon, wgLat], gcoord.WGS84, gcoord.BD09);
            return {
                lng: results[0],
                lat: results[1]
            }
        },

        /**
         * 各种事件的封装
         */
        addEventListener: function(target, eventName, handler) {
            target.addEventListener(eventName, handler);
        },
        /**
         * 删除时间的监听
         */
        removeEventListener: function(target, eventName, handler){
            target.removeEventListener(eventName, handler);
        },

        /**
         * 地图样式自定义
         * @param {json} json：地图自定义样式JSON
         */
        setMapStyle:function(json){
            _selfMap.setMapStyle({
                styleJson:json
            })
        }

    }
    return MapApi;

})(window)

export default MapApi;