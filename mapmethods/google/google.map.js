
import MarkerClusterer from './markerclusterer'

 var MapApi = (function(win) {
    
    var markerArray=[];
    var trfficMap=null;
    var array = Array.prototype.slice;
    var toString = Object.prototype.toString;
    var hasOwn = Object.prototype.hasOwnProperty;
    var extend = function(c, p) {
            for (var i in p) {
                c[i] = p[i];
            }
            c.parent = p;
            return c;
        }
        /*
         * name: 地图私有方法
         */
    var _selfMap,_self, _openDrawingManager, _rectangledrawendListener, _polygondrawendListener, _circledrawendListener, _linedrawendListener;
    var _map = {
        label: function(point, str, options) {
            var text,
                temp = {
                    position: point, // 指定文本标注所在的地理位置
                    offset: new BMap.Size(-20, 36) //设置文本偏移量
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
        openDrawingManager: function(options) {
            var styleOptions = {
                strokeColor: "red", //边线颜色。
                fillColor: "red", //填充颜色。当参数为空时，圆形将没有填充效果。
                strokeWeight: 3, //边线的宽度，以像素为单位。
                strokeOpacity: 0.8, //边线透明度，取值范围0 - 1。
                fillOpacity: 0.6, //填充的透明度，取值范围0 - 1。
                strokeStyle: 'solid' //边线的样式，solid或dashed 
            };
            var drawingManager = new google.maps.drawing.DrawingManager({
                drawingMode: null,
                //drawingMode: google.maps.drawing.OverlayType.MARKER,
                drawingControl: false,
                drawingControlOptions: {
                    position: google.maps.ControlPosition.TOP_CENTER,
                    drawingModes: ['marker', 'circle', 'polygon', 'polyline', 'rectangle']
                },
                markerOptions: { icon: 'https://developers.google.com/maps/documentation/javascript/examples/full/images/beachflag.png' },
                circleOptions: styleOptions
            });
            //console.log(_selfMap);
            drawingManager.setMap(_selfMap);

            return drawingManager;
        },
        utils: {
            // 将{lng: "", lat: ""} 格式统一转换 {longitude: 116.404, latitude: 39.915}
            transferPointFormat: function(points) {

            },
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
        _selfMap = map;
        _self = this;
        this.MarkerClusterer = new MarkerClusterer(this.map);
    };
    /*
     * name: 地图暴露出去的方法
     */
    MapApi.prototype = {
        point: function(point) {
            // console.log(point)
            return new google.maps.LatLng(point.latitude || point.lat,point.longitude || point.lng);
        },
        // 获得地图的覆盖类(overlay) ----  args[0](图标地址) args[1](图标大小)
        mapAddpoint: function(points, ...args) {
            var size, img, marker, point = _self.point(points)
            if (args.length !== 0) {
                args[1] = undefined ? size = { width: 24, height: 24 } : size = args[1];
                img = {
                    fillColor:args[0].fillColor,
                    strokeColor:args[0].strokeColor,
                }
                
                args[0].path ? (img.path=args[0].path,img.fillOpacity=1) :(img.url=args[0].url);
                marker = new google.maps.Marker({
                    icon: img,
                    position: point
                });
                marker.setTop=function(a,b){

                };
                marker.point = point;
                return marker;
            }
        },

        // 单个点居中
        moveToCenter: function(point, zoom) {
            var minSize = _self.map.getZoom(),
                size, _point,pointCenter;
            point[0] ? _point = point[0] : _point = point;
            (_point.lat||_point.latitude) ? pointCenter=_point :pointCenter={lat:_point.lat(),lng:_point.lng()}
            if (arguments.length === 2) {
                size = Math.max(minSize, zoom);
                _self.map.setCenter(pointCenter);
                _self.map.setZoom(zoom);
            } else {
                _self.map.setCenter(pointCenter);
                _self.map.setZoom(minSize);
            }
        },

        // 从地图添加点(将marker添加到地图)
        addOverlay: function(overlay) {
            markerArray.push(overlay);
            overlay.setMap(_self.map);
        },

        // 从地图上移除点
        removeOverlay: function(overlay) {
            overlay.setMap(null);
        },
        // 清除地图所有点
        clearOverlays: function() {
            for (var i = 0; i < markerArray.length; i++ ) {
                markerArray[i].setMap(null);
            }
            markerArray=[];
        },
        // 添加文字标注
        addLabel: function(marker, text, options = {}) {
        
            return {
                setStyle(opts) {
                    
                }
            }
            // return  marker.setLabel(extend({
            //     color: '#666',
            //     text: text
            // },options));
             
        },
        //设置Markericon
        setIcon: function(marker, url) {
            return  marker.setIcon({
                path:url.path||url.url,
                fillColor:url.fillColor,
                fillOpacity: 1,
                strokeColor:url.strokeColor
            });
        },
        setMapTypes(flag,Roat){
            if(flag){
                Roat ? _self.map.setMapTypeId(google.maps.MapTypeId.HYBRID) : _self.map.setMapTypeId(google.maps.MapTypeId.SATELLITE)
            }else{
                _self.map.setMapTypeId(google.maps.MapTypeId.ROADMAP);
            }
        },
        setTrffic(flag){
            if(flag){
                trfficMap = new google.maps.TrafficLayer();
                trfficMap.setMap(_self.map);
            }else{
                trfficMap.setMap(null);
            }

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
                minLng: Math.max(bounds.getSouthWest().lng(), -180),
                minLat: Math.max(bounds.getSouthWest().lat(),-74),
                maxLng: Math.min(bounds.getNorthEast().lng(), 180),
                maxLat: Math.min(bounds.getNorthEast().lat(),74)
            }
            return  params;
        },
        addListener(bindObj,eventName,fun){
            _self.map.addListener(eventName,fun);
        },
        removeListener(eventName,fun){
            _self.map.removeListener(eventName,fun);
        },
        getBestView: function(views) {
            if(views.length){
                var points=[],bounds = new google.maps.LatLngBounds();
                if (toString.call(views) === '[object Array]') {
                    views.forEach(view => {
                        points.push(view.point ? {lat:view.point.lat(),lng:view.point.lng()} : view);
                    });
                } else {
                    points=views.points;
                }
                points.forEach(item =>{
                    bounds.extend(item);
                })
                _self.map.fitBounds(bounds);
            }
            
        },
        mapPanTo: function(point) {
            _self.map.panTo(point);
        },
         // 改变图标
        setPointIcon: function(marker, icon) {
            var icon= marker.getIcon();
            marker.setIcon({
                path:icon.url||icon.path,
                fillColor:icon.fillColor,
                strokeColor:icon.strokeColor,
                fillOpacity: 1
            });
            return marker;
        },
        // 点改变方向
        setRotation: function(marker, direction) {
            var icon= marker.getIcon();
            marker.setIcon({
                path:icon.url||icon.path,
                fillColor:icon.fillColor,
                strokeColor:icon.strokeColor,
                rotation:direction,
                fillOpacity: 1
            });
            return marker;
        },
        //marker点移动
        setPosition: function(marker, pointObj) {
            marker.setPosition(pointObj);
            return marker;
        },
        closeInfoWindow(infoWindow) {
            infoWindow.close();
        },
        // 测距工具
        distanceTool() {
            alert('谷歌地图该功能需要收费，暂未开通');
            return {
                open() {
                   return null;
                }
            }
        },
        setCity(city){
            _self.map.setCenter({lat:31.22, lng:121.48});
        },
        //显示圆形
        mapAddcircle: function(point, options) {
            var circleOptions = {
                strokeColor: '#20a0ff',
                strokeOpacity: 1,
                strokeWeight: 2,
                fillColor: '#fff',
                fillOpacity: 0.5,
                center: _self.point(point),
                radius: 100
            };
            var Circle = new google.maps.Circle(extend(circleOptions, options));
            Circle.setMap(_self.map);
            _self.getBestView([Circle.getBounds().getNorthEast(), Circle.getBounds().getSouthWest()]);
            markerArray.push(Circle);
            return Circle;
        },
        //显示矩形
        mapAddrectangle: function(rectangle, options) {
            for (var i in rectangle) {
                if (i == 'minLng' || i == 'minLat' || i == 'maxLng' || i == 'maxLat') {
                    //...
                } else {
                    throw new Error('correct format: {minLng: "", minLat: "", maxLng: "", maxLat: ""}')
                }
            }
            var rectangleOptions = {
                strokeColor: '#20a0ff',
                strokeOpacity:1,
                strokeWeight: 2,
                fillColor: '#fff',
                fillOpacity: 0.5,
                map:_self.map,
                bounds: {
                    north: rectangle.maxLat,
                    south: rectangle.minLat,
                    east: rectangle.minLng,
                    west: rectangle.maxLng

                }
            };
            var marker = new google.maps.Rectangle(extend(rectangleOptions,options));
            marker.setMap(_self.map);
            _self.getBestView([marker.getBounds().getNorthEast(), marker.getBounds().getSouthWest()]);
            markerArray.push(marker);
            return marker;
        },
        //显示多边形
        mapAddpolygon: function(point, options) {
            var points = [];
            if (_map.utils.isArray(point)) {
                for (var i = 0, len = point.length; i < len; i++) {
                    points.push(_self.point(point[i]));
                }
            }
            var polygonOptions = extend({
                strokeColor: '#20a0ff',
                strokeOpacity: 1,
                strokeWeight: 2,
                fillColor: '#fff',
                fillOpacity: 0.5,
                paths: points
            }, options);
            var polygons = new google.maps.Polygon(polygonOptions);
            polygons.setMap(_self.map);
            _self.getBestView(points);
            markerArray.push(polygons);
            return polygons;
        },
        //显示路线
        mapAddline: function(point, options) {
            var points = [];
            if (_map.utils.isArray(point)) {
                for (var i = 0, len = point.length; i < len; i++) {
                    points.push(_self.point(point[i]));
                }
            }
            var lineOptions = {

                geodesic: true,
                strokeColor: '#5298ff',
                strokeOpacity: 1,
                strokeWeight: 6,
                path: points
            };
            var line = new google.maps.Polyline(extend(lineOptions, options));
            
            line.setMap(_self.map);
            _self.getBestView(points)
            markerArray.push(line);
            return line;
        },
        //画圆
        onclickCircle: function(callback) {
            _openDrawingManager = null;
            _openDrawingManager = _map.openDrawingManager();
            _openDrawingManager.setDrawingMode(google.maps.drawing.OverlayType.CIRCLE);
            (_circledrawendListener = _openDrawingManager.addListener('overlaycomplete', onCircleDrawend));
            function onCircleDrawend(circleOverlay) {
                var center = circleOverlay.overlay.getCenter();
                var options = {
                    overlay: circleOverlay.overlay,
                    center: { lng: center.lng(), lat: center.lat() },
                    radius: circleOverlay.overlay.getRadius()
                };
                _openDrawingManager.setDrawingMode(null);
                if (_map.utils.isFunction(callback)) {
                    callback(options);
                }
            }
        },
        // 画折线
        onclickLine: function(callback) {
            _openDrawingManager = null;
            _openDrawingManager = _map.openDrawingManager();
            _openDrawingManager.setDrawingMode(google.maps.drawing.OverlayType.POLYLINE);
            (_linedrawendListener == null) &&
            (_linedrawendListener = _openDrawingManager.addListener('overlaycomplete', onLineDrawend));

            function onLineDrawend(lineOverlay) {
                var paths = lineOverlay.overlay.getPath();
                var array = paths.getArray();
                var points = [];
                for (var i = 0; i < array.length; i++) {
                    points.push({ lng: array[i].lng(), lat: array[i].lat() });
                }
                var options = {
                    points: points,
                    overlay: lineOverlay.overlay
                };
                _openDrawingManager.setDrawingMode(null);
                if (_map.utils.isFunction(callback)) {
                    callback(options);
                }
            }
        },
        // 画多边形
        onclickPolygon: function(callback) {
            _openDrawingManager = null;
            _openDrawingManager = _map.openDrawingManager();
            _openDrawingManager.setDrawingMode(google.maps.drawing.OverlayType.POLYGON);
            (_polygondrawendListener == null) &&
            (_polygondrawendListener = _openDrawingManager.addListener('overlaycomplete', onPolygonDrawend));

            function onPolygonDrawend(polygonOverlay) {
                var paths = polygonOverlay.overlay.getPath();
                var array = paths.getArray();
                var potins = [];
                for (var i = 0; i < array.length; i++) {
                    potins.push({ lng: array[i].lng(), lat: array[i].lat() });
                }
                var options = {
                    overlay: polygonOverlay.overlay,
                    points: potins
                };
                _openDrawingManager.setDrawingMode(null);
                if (_map.utils.isFunction(callback)) {
                    callback(options);
                }
            }
        },
        // 画矩形
        onclickRectangle: function(callback) {
            _openDrawingManager = null;
            _openDrawingManager = _map.openDrawingManager();
            _openDrawingManager.setDrawingMode(google.maps.drawing.OverlayType.RECTANGLE);
            (_rectangledrawendListener == null) &&
            (_rectangledrawendListener = _openDrawingManager.addListener('overlaycomplete', onRectangleDrawend));

            function onRectangleDrawend(rectangleOverlay) {

                var bounds = rectangleOverlay.overlay.getBounds();
                var params = {
                    minLng: bounds.getSouthWest().lng(),
                    minLat: bounds.getSouthWest().lat(),
                    maxLng: bounds.getNorthEast().lng(),
                    maxLat: bounds.getNorthEast().lat()
                };
                var options = {
                    params: params,
                    overlay: rectangleOverlay.overlay
                };
                _openDrawingManager.setDrawingMode(null);
                if (_map.utils.isFunction(callback)) {
                    callback(options);
                }
            }
        },
         // 拉框放大
         rectangleZoom:function() {
            _self.onclickRectangle(options =>{
                let zoom=_self.getZoom();
                _self.getBestView([options.overlay.getBounds().getNorthEast(), options.overlay.getBounds().getSouthWest()]);
                _self.setZoom(zoom+2);
                _self.removeOverlay(options.overlay);
                _rectangledrawendListener=null;
            });
            return {
                open() {
                    return null;
                }
            }
            
        },
        Geocoder: function(location) {
            var myGeo = new google.maps.places.PlacesService(_selfMap);
            myGeo.textSearch({query:location},_ => {
                _.forEach(ele => {
                    _selfMap.removeOverlay(ele.marker)
                });
            });
        },
        // 画点
        onclickPoint: function(callback) {
            _openDrawingManager = null;
            _openDrawingManager = _map.openDrawingManager();
            _openDrawingManager.setDrawingMode(google.maps.drawing.OverlayType.MARKER);
            (_rectangledrawendListener == null) &&
            (_rectangledrawendListener = _openDrawingManager.addListener('overlaycomplete', onMarkerDrawend));

            function onMarkerDrawend(markerOverlay) {
                var options = {};
                var point = markerOverlay.overlay.getPosition()
                options.points = { lng: point.lng(), lat: point.lat() }
                _openDrawingManager.setDrawingMode(null);
                if (_map.utils.isFunction(callback)) {
                    callback(options);
                }
            }

        },
        infoWindow:function(content,options,point){
            var infowindow = new google.maps.InfoWindow({
                content: content,
                position: point
            });
            markerArray.push(infowindow);
            return infowindow;
        },
        
        //打开信息窗
        openInfoWindow(content, options, point) {
            var infowindow = _self.infoWindow(content, options,point);
            infowindow.open(_self.map);
            markerArray.push(infowindow);
            return infowindow;
        },
        cvOpenInfoWindow: function(infoWindow, point) {
            infoWindow.open(_self.map);
        },
        //点击覆盖物打开弹窗
        overlayClickOpenInfoWindow(overlay, point, content, callback, options) {
            _self.addEventListener(overlay, 'click',  function() {
                var infoWindow = _self.openInfoWindow(content, options, point);
                if (_map.utils.isFunction(callback)) {
                    callback(infoWindow);
                }
            });
        },
        //是否开启编辑
        overlayEdit: function(overlay, flag) {
            overlay.setEditable(flag);
        },
        //获取圆形的数据
        getCircleOptions(overlay) {
            var center = overlay.getCenter();
            var options = {
                overlay: overlay,
                center: { lng: center.lng(), lat: center.lat() },
                radius: overlay.getRadius()
            };
            return options;
        },
        //获取多边形数据
        getPolygonOptions(overlay) {
            var paths = overlay.getPath();
            var array = paths.getArray();
            var potins = [];
            for (var i = 0; i < array.length; i++) {
                potins.push({ lng: array[i].lng(), lat: array[i].lat() });
            }
            var options = {
                overlay: overlay,
                points: potins
            };
            return options;
        },
        //获取折线的数据
        getLineOptions(overlay) {
            var paths = overlay.getPath();
            var array = paths.getArray();
            var points = [];
            for (var i = 0; i < array.length; i++) {
                points.push({ lng: array[i].lng(), lat: array[i].lat() });
            }
            var options = {
                points: points,
                overlay: overlay
            };
            return options;
        },
        addEventListener: function(target, eventName, handler) {
            if (eventName == 'clickclose') {
                eventName = 'closeclick'
            }
            target.addListener(eventName, handler);
        },
         /**
         * 删除时间的监听
         */
        removeEventListener: function(target, eventName, handler){
            if (eventName == 'clickclose') {
                eventName = 'closeclick'
            }
            target.removeListener(eventName, handler);
        },
         /**
         * 聚合方法 添加， 删除
         * @params {Array} markers: 多个或单个覆盖物数组
         */
        markerClustererAddMarker: function(marker) {
            return _self.MarkerClusterer.addMarker(marker);
        },
        markerClustererremoveMarker: function(marker) {
            return _self.MarkerClusterer.removeMarker(marker);
        },
        markerClustererAddMarkers: function(markers) {
            return _self.MarkerClusterer.addMarkers(markers);
        },
        markerClustererremoveMarkers: function(markers) {
            return _self.MarkerClusterer.removeMarkers(markers);
        },
        markerClustererClearAll: function() {
            return _self.MarkerClusterer.clearMarkers();
        },
    }
    return MapApi;
})(window)
export default MapApi;