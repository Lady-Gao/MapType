import AirportBase from './AirportBase'

export default class AirportDraw extends AirportBase {
  constructor(map) {
    super(map);
    this.map = map;

  }

  /**
   * 给marker添加文字标注
   * @param {Constructor} marker: 覆盖物的实例对象 
   * @param {String} text: 文字 
   * @param {Object} options: 个性化属性 
   * @return {Object} 返回当前的文字标注对象(label)
   */
  addLabel(marker, text, options) {
    var options = arguments.length > 2 && arguments[2] != undefined ? arguments[2] : {};
    marker.setLabel = function () {

    };
    marker.setTop = function () {

    };
    return {
      setStyle: function setStyle(opts) {
        marker.setLabel({})
      }
    }
  }

  /**
   * 显示圆形覆盖物(要能显示最佳视野)
   * @param {Object} point: 点的经纬度对象 {longitude: , latitude: }
   * @param {Number} radius: 圆的半经
   * @param {Object} options: 自定义属性
   * @return {Constructor} 生成圆覆盖物的实例
   */
  mapAddcircle(point, radius, options) {
    var options = options || {},
      defs = {
        strokeColor: "#20a0ff",
        lineWidth: 2,
        opacity: 0.5
      };
    var circle = new SuperMap.Feature.ShapeParameters.Circle(point.lon || point.longitude, point.lat || point.latitude, radius);
    circle.style = Object.assign(defs, options);
    this.getBestView(point)
    return circle;
  }

  /**
   * 显示矩形的覆盖物(要能显示最佳视野)
   * @param {Object} point: {minLng: "", minLat: "",width:,height}
   * @param {*} options 
   * @return {Constructor} 生成矩形覆盖物的实例
   */
  mapAddrectangle(point, options) {
    for (var i in point) {
      if (i == 'minLng' || i == "minLat" || i == 'width' || i == "height") {

      } else {
        throw new Error('correct format :{minLng: "", minLat: "",width: "",height :""} ');
      }
    }
    var options = options || {},
      defs = {
        strokeColor: "#20a0ff",
        strokeWidth: 2,
        strokeOpacity: 1
      };
    var rectangle = new SuperMap.Feature.ShapeParameters.Rectangle(point.minLng, point.minLat, point.width, point.height);
    rectangle.style = Object.assign(defs, options);
    this.getBestView(point);
    return rectangle;

  }

  /**
   * 显示多边形的覆盖物(要能显示最佳视野)
   * @param {Array} points: [{longitude: , latitude: }, ...] 
   * @param {*} options 
   * @return {Constructor} 生成多边形覆盖物的实例
   */
  mapAddpolygon(points, options) {
    var options = options || {},
      point = [],
      defs = {
        strokeColor: "#20a0ff",
        strokeWidth: 2,
        strokeOpacity: 0.5
      };
    if (points.length > 0) {
      for (var i = 0, len = points.length; i < len; i++) {
        point.push(this.point(points[i]))
      }
    }
    var polygon = new SuperMap.Feature.ShapeParameters.Polygon(point);
    polygon.style = Object.assign(defs, options);
    this.getBestView(points);
    return polygon;

  }

  /**
   * 显示路线的覆盖物(要能显示最佳视野)
   * @param {Array} points: [{longitude: , latitude: }, ...] 
   * @param {*} options 
   * @return {Constructor} 生成路线覆盖物的实例
   */
  mapAddline(points, options) {
    var options = options || {},
      point = [],
      defs = {
        strokeColor: "#5298ff",
        strokeWidth: 2,
        strokeOpacity: 1
      };
    if (points.length > 0) {
      for (var i = 0, len = points.length; i < len; i++) {
        point.push(this.point(points[i]))
      }
    }
    // var line = new SuperMap.Feature.ShapeParameters.Line(point);
    let style = Object.assign(defs, options);
    let list = points.map(item => {
      return new SuperMap.Geometry.Point(item.lng, item.lat)
    })
    var geometry = new SuperMap.Geometry.LineString(list);
    var feature = new SuperMap.Feature.Vector(geometry, null, style);
    this.lineLayer.addFeatures(feature, style);
    this.getBestView(points);
    return feature;
  }
  removeLine() {
    this.lineLayer.removeAllFeatures();
  }
  //从当前图层中删除feature。
  removeFeatures(feature) {
    this.lineLayer.removeFeatures(feature.feature)
  }

  /**
   * 绘制圆形
   * @param {Function} callback: 
   * @argument {Object} options: {points(所有路径), overlay(覆盖物), center(中心点坐标), radius(半径)} 
   */
  onclickCircle(callback) {

  }

  /**
   * 绘制折线
   * @param {Function} callback 
   * @argument {Object} options: {points(所有路径), overlay(覆盖物)}
   */
  onclickLine(callback) {

  }

  /**
   * 绘制多边形
   * @param {Function} callback 
   * @argument {Object} options: {points(所有路径), overlay(覆盖物)}
   */
  onclickPolygon(callback) {
    // var polygonLayer = new SuperMap.Layer.Vector("polygonLayer");
    // drawPolygon = new SuperMap.Control.DrawFeature(polygonLayer, SuperMap.Handler.Polygon);

  }

  /**
   * 绘制矩形
   * @param {*} callback 
   * @argument {Object} 
   * options: {
   *  points(所有路径), 
   *  params: {minLng, minLat, maxLng, maxLat},
   *  overlay(覆盖物)
   * }
   */
  onclickRectangle(callback) {

  }

  /**
   * 实例化一个新的信息弹框
   * @param {HTML} content: 弹框中的信息模版 
   * @param {Object} options 
   * @param {Object} point:经纬度 
   * @return {Constructor} InfoWindow(弹框实例)
   */
  infoWindow(content, options) {
    return new SuperMap.Popup.FramedCloud(Math.random() * 100, new SuperMap.LonLat(options.lon, options.lat), new SuperMap.Size(370, 210), content, null, true);
  }

  /**
   * 
   * @param {HTML} content 
   * @param {Object} options:
   *  自定义属性 var options = {
   *           width: 0, // 信息窗口宽度
   *          height: 0, // 信息窗口高度
   *           title: "", // 信息窗口标题
   *          offset: new BMap.Size(-10, -20)
   *       };
   * @param {?} point 不知道是Object还是Constructor(查找百度或高德看属性)
   */
  openInfoWindow(content, options, point) {
    // 百度方法参考
    // var infoWindow = _self.infoWindow(content, options);
    // _self.map.openInfoWindow(infoWindow, point); ---- 打开对应的infoWindow的窗口
    // return infoWindow;
    var infoWindow = this.infoWindow(content, options);
    this.map.addPopup(infoWindow);
    return infoWindow;
  }

  cvOpenInfoWindow(infoWindow, point) {
    this.map.addPopup(infoWindow);
  }

  /**
   * 关闭信息弹框
   * @param {Constructor} infoWindow: 需要关闭的弹框实例 
   */
  closeInfoWindow(infoWindow) {
    if (infoWindow) {
      try {

        infoWindow.hide(); //隐藏窗体对象
        infoWindow.destroy(); //消毁窗体对象

      } catch (e) {
        //    console.log(e,"e")
      }
    }
  }
  /**
   * 关闭所有信息弹框
   * 
   */
  removeAllPopup() {
    this.map.removeAllPopup()
  }

  /**
   * 点击覆盖物打开弹框
   * @param {Constructor} overlay: 覆盖物实例 
   * @param {*} point 
   * @param {HTML} content: 弹框的信息模版 
   * @param {Function} callback: 点击之后的回调函数
   * @argument {Constructor}: callback函数的参数(InfoWindow实例) 
   * @param {Object} options: 给信息弹框的自定义属性 
   */
  overlayClickOpenInfoWindow(overlay, point, content, callback, options) {
    overlay.events.on('click', function () {
      var infoWindow = this.openInfoWindow(content, options, point);
      callback(infoWindow);
    })
  }

  /**
   * 经纬度的转换
   * @param {*} wgLat 
   * @param {*} wgLon 
   */
  transform(wgLat, wgLon) {

  }
}