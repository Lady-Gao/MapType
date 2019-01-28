export default class Gis {
  constructor(map) {
    this.map = map;
    this.markers = new SuperMap.Layer.Markers("Markers");
    this.markerSD = new SuperMap.Layer.Markers("markerSD");
    this.lineLayer = new SuperMap.Layer.Vector("lineLayer")

    this.map.addLayer(this.markerSD);
    this.map.addLayer(this.markers);
    this.map.addLayer(this.lineLayer);
    this.clusterLayer = new SuperMap.Layer.ClusterLayer("Cluster");
    this.map.addLayers([this.clusterLayer]);
    this.select = new SuperMap.Control.SelectCluster(this.clusterLayer);
    //   //将控件添加到map上
    this.map.addControl(this.select);
    //   setTimeout(() => {
    //   //激活控件。
    this.select.activate();
    //    }, 500);
    this.extend = function (c, p) {
      for (var i in p) {
        c[i] = p[i];
      }
      c.parent = p;
      return c;
    }
    var self = this
    this.map.Smap = {
      label: function (point, str, options) {
        var text,
          temp = {
            position: point, // 指定文本标注所在的地理位置
            offset: new SuperMap.Size(options.x || -20, options.y || 36) //设置文本偏移量
          };
        text = new SuperMap.Feature.ShapeParameters.Label(str, temp); // 创建文本标注对象
        text.style(self.extend({
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
      utils: {
        isArray: function (obj) {
          return toString.call(obj) === '[object Array]'
        },
        isFunction: function (obj) {
          return toString.call(obj) === '[object Function]'
        }
      }

    }
  }

  /**
   * 获取点的地图对象实例
   * @param {Object} point: {lng: , lat: } 经纬度对象
   * @return {Constructor} 返回地图点的实例
   */
  point(point) {
    // return new SuperMap.Geometry.Point(point.lng, point.lat)
    return new SuperMap.LonLat(point.lng, point.lat)
  }

  /**
   * 设置marker地图点的图标
   * @param {String} url: 图片路径 
   * @param {Number} width: 图片宽度 
   * @param {Number} height: 图片高度 
   * @return {Constructor} 返回图标的实例(Icon)
   */
  setIcon(url, width, height) {


    const size = new SuperMap.Size(width, height);
    const offset = new SuperMap.Pixel(-(size.w / 2), -(size.h / 2));
    return new SuperMap.Icon(url, size, offset);
  }
  // /**
  //  * 设置marker图标位置
  //  *@param {Object} city: Icon实例 
  //  *@param {Object} point: {longitude: , latitude: } 经纬度对象
  //  */
  // addMarker(overlay) {
  //     this.markerSD.addMarker(new SuperMap.Marker(new SuperMap.LonLat(overlay.point.x, overlay.point.y), overlay.icon))
  // }
  setCity(point) {
    this.map.setCenter(new SuperMap.LonLat(point.x, point.y), 1);
  }

  /**
   * 设置传入的marker点的最佳视野(居中)
   * @param {Array} views: [marker, marker ...] 
   * @return {Void}
   */
  getBestView(views) {
    if (views.name == "lineLayer") return
    var points = [];
    if (toString.call(views) === '[object Array]') {
      if (views.length > 2) {
        views.forEach(view => {
          points.push(view.point ? view.point : view);
        })
        this.setViewport(points);
      }
    } else {
      this.setViewport(views.pointList);
      // throw new Error('views is should be Array')
    }


  }
  /**
   * 多点居中
   *[{ lon: 479871.4833645800, lat: 521993.0550288700}, { lon: 480218.2064312500, lat:521825.9210122000 }, {
   *lon: 480054.1647645800, lat: 521902.1210122000
   *}]
   */
  setViewport(views) {
    let bounds = new SuperMap.Bounds();
    let point
    // if (views.longitude) {

    //     bounds.extend(new SuperMap.LonLat(views.longitude, views.latitude));
    //     point = bounds.getCenterPixel()

    // } else if (views || views.pointList) {
    let lonMax = Math.max.apply(Math, views.map(function (o) {
      return o.lng || o.lon;
    }))
    //最小值
    let lonMin = Math.min.apply(Math, views.map(function (o) {
      return o.lng || o.lon;
    }))
    //最大值
    let latMax = Math.max.apply(Math, views.map(function (o) {
      return o.lat
    }))
    //最小值
    let latMin = Math.min.apply(Math, views.map(function (o) {
      return o.lat
    }))
    bounds.extend(new SuperMap.LonLat(lonMin, latMax));
    bounds.extend(new SuperMap.LonLat(lonMax, latMin));
    point = bounds.getCenterPixel()
    // }
    setTimeout(() => {
      this.map.setCenter(new SuperMap.LonLat(point.x, point.y));
    }, 1000)
  }
  lonMlatM(viewList) {

    return {
      lonMin,
      latMax,
      lonMax,
      latMin
    }
  }
  /**
   * 单个点的居中
   * @param {Constructor} point: 点的实例对象 
   * @param {Number} zoom: 地图层级 
   */
  moveToCenter(point, zoom) {
    //获取当前缩放比例级别
    let minSize = this.map.getZoom();
    let size;
    let _point;
    point[0] ? _point = point[0] : _point = point;;
    if (arguments.length === 2) {
      size = Math.max(minSize, zoom);
      this.map.setCenter(new SuperMap.LonLat(_point.lon, _point.lat), size);
    } else {
      this.map.setCenter(new SuperMap.LonLat(_point.lon, _point.lat), minSize);
    }

  }

  /**
   * 设置地图的模式 2d or 3d
   * @param {Boolean} flag: 2d 或者其他的一个标识 
   * @param {?} Roat
   * @author: zhangchangyu 
   */
  setMapTypes(flag, Roat) {}

  /**
   * 给地图覆盖物添加事件绑定
   * @param {Overlay} bindObj: 地图上面需要绑定事件的覆盖物 
   * @param {Event} eventName: 事件名称 
   * @param {Function} fn 
   * @return {Void}
   */
  addEventListener(bindObj, eventName, fn) {

    // console.log(bindObj, eventName, fn)
    bindObj.events.register(eventName, bindObj, fn);
    // this.markers.events.register(eventName,bindObj,fn);

    // this.markers.events.un({
    //     [eventName]: fn,
    //     'scope': bindObj
    // });
  };


  removeListener(bindObj, eventName, fn) {
    this.markers.events.un({
      [eventName]: fn,
      'scope': bindObj
    })
    // bindObj.events.unregister(eventName, bindObj, fn);
  }



  /**
   * 获取地图的当前层级
   * @return {Void}
   */
  getZoom() {
    return this.map.getZoom()
  }

  /**
   * 设置地图的当前层级
   * @param {Number} n: 层级大小
   * @return {Void}
   */
  setZoom(n) {
    this.map.zoomTo(parseInt(n))
  }

  /**
   * 获取地图视野的对角经纬度
   * @return {Object} {minLng, minLat, maxLng, maxLat}
   */
  getBounds() {
    return new SuperMap.Bounds()
  }

  /**
   * 本地搜索区域
   * @param {Any} location: 输入的内容 
   */
  Geocoder(location) {
    var myGeo = new SuperMap.Control.SearchCity({
      defaultPosition: this.map
    });
    //  myGeo.search(location);
    //  myGeo.setMarkersSetCallback(_ => {
    //      _.forEach(ele => {
    //          this.map.removeOverlay(ele.marker)
    //      });
    //  })

  }

  /**
   * 将生成的marker点 添加到地图上显示
   * @param {Constructor} overlay: 点的实例对象 
   */
  addOverlay(overlay) {
    this.markers.addMarker(overlay);
  }

  /**
   * 从地图上去除指定的marker点
   * @param {Constructor} overlay 
   */
  removeOverlay(overlay) {
    if (overlay.vh) return
    this.markers.removeMarker(overlay);
  }

  /**
   * 清除当前视图中已经绘制的要素， 但是不清空存储
   */
  clearMarkers() {
    this.markers.clearCluster()
  }
  /**
   * 清除地图上所有覆盖物
   */
  clearOverlays() {
    this.markers.clearMarkers()
  }

  /**
   * 改变marker的图标
   * @param {Constructor} marker: 覆盖物实例 
   * @param {Constructor} icon: Icon实例
   * @return {Constructor} marker
   */
  setPointIcon(marker, icon) {
    marker.icon.url = icon;
    return marker;

  }

  /**
   * 改变marker的位置
   * @param {Constructor} marker: 覆盖物实例
   * @param {Constructor} point: 点的实例对象
   * @return {Constructor} marker 
   */
  setPosition(marker, point) {

    marker.lonlat.lat = point.lat;
    marker.lonlat.lon = point.lon;
    return marker;

  }

  /**
   * 改变marker的方向
   * @param {Constructor} marker 
   * @param {Number} direction 
   */
  setRotation(marker, direction) {
    var point = marker.point;
    var rotateOrigin = point;
    // point.rotate(parseInt(direction),rotateOrigin);
    // marker = new SuperMap.Marker(point);
    marker.point = point;
    return marker;

  }

  /**
   * 是否开启编辑功能
   * @param {Constructor} overlay: 覆盖物实例 
   * @param {Boolean} flag 
   */
  overlayEdit(overlay, flag) {}

  /**
   * 拉框放大
   * @param {Object} options: 
   */
  rectangleZoom(options) {


  }

  /**
   * 
   * @param {Object} options: 自定义属性
   */
  distanceTool(options) {}

  /**
   * 创建交通流量图层实例    
   * @param {*} flag 
   */
  setTrffic(flag) {}

  /**
   * 聚合方法 添加， 删除
   * @params {Array} markers: 多个或单个覆盖物数组
   *new SuperMap.Feature.Vector
   */
  markerClustererAddMarkers(markers) {
    this.clusterLayer.addFeatures(markers);
  }

  markerClustererAddMarker(marker) {
    this.markers.addMarker(marker);
    // this.clusterLayer.addFeatures(marker);

  }

  markerClustererremoveMarkers(markers) {
    this.map.removeMarker(markers);
  }

  markerClustererremoveMarker(marker) {
    this.markers.removeMarker(marker)
  }

  /**
   * 清除所有marker点
   */
  markerClustererClearAll() {
    this.map.clearMarkers()
  }

  /**
   * 显示路线
   */
  // mapAddline(point, options) {
  //     var points = [],
  //         defs = {
  //             strokeColor: "#5298ff",
  //             strokeWeight: 6,
  //             strokeOpacity: 1
  //         };
  //     if (this.map.Smap.utils.isArray(point)) {
  //         for (var i = 0, len = point.length; i < len; i++) {
  //             points.push(this.point(point[i]))
  //         }
  //        const Vector = new SuperMap.Layer.Vector(points, this.extend(defs, options));;
  //         this.map.addLayer(Vector);
  //         this.getBestView(points);
  //         Vector.points = points;
  //         return Vector;
  //     }

  // }
  /**
   * 获取经纬度点的覆盖类
   * @param {Object} point: 经纬度对象 {lng, lat} 
   * @param {String} url: 覆盖物的图片路径 
   * @param {Object} size: 覆盖物的大小 {width, height} 
   * @return {Constructor} 返回覆盖物的对象(实例)
   */
  mapAddpoint(points, ...args) {
    // let size,
    let size,
      myicon,
      point = this.point({
        lng: points.longitude,
        lat: points.latitude
      }),
      marker;
    if (args.length !== 0) {
      args[1] == undefined ? size = {
        width: 12,
        height: 12
      } : size = args[1];
      myicon = this.setIcon(args[0].url, size.width, size.height);
      marker = new SuperMap.Marker(point, myicon);
    }
    marker.point = point;
    return marker;

  }

}