<template>  
            <div  class="cv-map" id='map' ref="map"></div>
</template>

<script>
import {Gaode,Baidu,Google,Gis} from '../../mapmethods'
import { getMapScript, createScript, createStyle,asyncDownloadScript } from '../../scriptHelp.js'
export default {
    name:'mapType',
    props: {
        mapname: {
            default:'BaiduMap'
        },
         //插件 [{js:'', css:''}]
        plugins: {
            type: Array,
            default() { return [] }
        },
        // 地图缩放的层级范围
        zooms: {
            type: Array,
            default() {
                return [3, 18]
            }
        },
        language: {
            type:String,
            default(){
                return 'zh-CN'
            }
        },
        mapTypes:{
            type:Boolean,
            default:false
        },
       // 地图加载完成的回调
        mapLoaded: Function,

    },
    computed: {
        _mapMethods() {
            return this.$refs['map'].mapMethods;
        },
          _map() {
            return this.$refs['map']
        }
    },
    data() {
        return {
            map: null,
            mapMethods: null,
            // 控件名称集合
            controls: ['ScaleControl', 'NavigationControl', 'OverviewMapControl'],
            localElements: {
                styles: [],
                scripts: []
            },
            //gis
            layer:null,
            lineLayer:null,
            polygonLayer:null,
            prjCoordSys:null,
            url : "/gao/iserver/services/map-ugcv5-DCJBASEZGHA/rest/maps/DCJ_BASE_ZGHA",
            tileVersions : null,
            visibleScales: null,
        }
    },
   
     mounted() {
        
         switch (this.mapname) {
             case 'CvBaiduMap':
                   getMapScript('BMap', '//api.map.baidu.com/api?v=2.0&ak=8GrVRotzGKj3xzIRu07hCzx2')
                 break;
             case 'CvGaodeMap':
                  getMapScript('AMap', 'http://webapi.amap.com/maps?v=1.4.2&key=edfc1f354a8b8203758949cf999b8b4b')
                 break;
             case 'Gis':
                 break;
             case 'CvGoogleMap':
                 getMapScript('google', `http://ditu.google.cn/maps/api/js?key=AIzaSyDMvlx7bDzZPe-7Tf7pmmeV-V8oMaYjRac&sensor=true&language=${this.language}&libraries=drawing`)
                 break;
         }
            setTimeout(() => {
                this.mapInitial()
            }, 2000);
    },
    methods: {
        mapInitial() {
            switch (this.mapname) {
                case 'CvBaiduMap':
                    this.BaiduMapInit()
                    break;
                 case 'CvGaodeMap':
                    this.GaodeMapInit()
                    break;
                 case 'Gis':
                    this.GisInit()
                    break;
                 case 'CvGoogleMap':
                debugger
                    this.GoogleInit()
                    break;
            
            }
        },
/** google*/
   GoogleInit(){
         let myOptions = {
                zoom: 12,
                center: {lat:31.22, lng:121.48},
                fullscreenControl:false,
                mapTypeControl: false,//Map类型控件的初始启用/禁用状态。
                
            };
            this.map = new google.maps.Map(this._map,myOptions);
            this.mapMethods = new Google(this.map);
         
            var timer = setTimeout( _ => {
                clearTimeout(timer);
                timer = null;

                typeof this.mapLoaded == 'function' && this.mapLoaded();
                // this.controlGroups_Load();
            }, 200)
        } ,
/**baidu */
        BaiduMapInit(){
            this.BaiaddPlugins();
             this.map = new BMap.Map(this._map, { enableMapClick:false });
             // 定位当前的城市位置
            var city = new BMap.LocalCity();
            city.get( result => {
                this.mapMethods = new Baidu(this.map);
                this.map.centerAndZoom(result.name, 9);

                var timer = setTimeout( _ => {
                    clearTimeout(timer);
                    timer = null;

                    typeof this.mapLoaded == 'function' && this.mapLoaded();
                    this.BaicontrolGroups_Load();
                }, 200)
            });
            this.map.enableScrollWheelZoom();

        },
        /**
         * 地图控件的组合
         * 比例尺 平移控件 添加地图缩略图
         */
        BaicontrolGroups() {
            const { map } = this;

            return {
                // 比例尺
                ScaleControl(){
                    const top_right_control = new BMap.ScaleControl({
                        anchor: BMAP_ANCHOR_BOTTOM_LEFT,
                        offset: new BMap.Size(20, 70)
                    });
                    map.addControl(top_right_control);
                },
                // 平移控件
                NavigationControl(){
                    const top_left_navigation = new BMap.NavigationControl({
                        anchor: BMAP_ANCHOR_BOTTOM_RIGHT,
                        offset: new BMap.Size(20, 150),
                        type: BMAP_NAVIGATION_CONTROL_SMALL
                    });
                    map.addControl(top_left_navigation);
                },
                // 添加地图缩略图
                OverviewMapControl(){
                    const overViewOpen = new BMap.OverviewMapControl({isOpen:true, anchor: BMAP_ANCHOR_BOTTOM_RIGHT});
                    map.addControl(overViewOpen);
                }
            }
        },
        /**
         * 加载控件的时候需要延时，不然地图会有黑色长条出现
         */
        BaicontrolGroups_Load() {
            const controlMethods = this.BaicontrolGroups();
            var timer = setTimeout( _ => {
                clearTimeout(timer);
                timer = null;
                this.controls.forEach(control => {
                    controlMethods[control]();
                });
            }, 100)
        },
        BaiaddPlugins() {
            if(!global.$baiduPlugins) {
                global.$baiduPlugins = [
                    {	
                        css: 'http://api.map.baidu.com/library/DrawingManager/1.4/src/DrawingManager_min.css',
                        js: 'http://api.map.baidu.com/library/DrawingManager/1.4/src/DrawingManager_min.js'
                    },
                    {
                        css: 'http://api.map.baidu.com/library/SearchInfoWindow/1.4/src/SearchInfoWindow_min.css',
                        js: 'http://api.map.baidu.com/library/SearchInfoWindow/1.4/src/SearchInfoWindow_min.js'
                    },
                    {
                        js: 'http://api.map.baidu.com/library/TextIconOverlay/1.2/src/TextIconOverlay_min.js'
                    },
                    {
                        js: 'http://api.map.baidu.com/library/RectangleZoom/1.2/src/RectangleZoom_min.js'
                    },
                    {
                        js: 'http://api.map.baidu.com/library/DistanceTool/1.2/src/DistanceTool_min.js'
                    }
                ];

                global.$baiduPlugins.forEach(plugin => {
                    this.localElements.styles.push(createStyle(plugin.css));
                    this.localElements.scripts.push(createScript(plugin.js));
                })
            }
        },
/**gaode */
        GaodeMapInit(){
            this.map = new AMap.Map(this._map, { resizeEnable: true });
            this.mapMethods = new Gaode(this.map);

            var timer = setTimeout( _ => {
                clearTimeout(timer);
                timer = null;

                typeof this.mapLoaded == 'function' && this.mapLoaded();
                this.GaocontrolGroups_Load();
            }, 200)
        },
          /**
         * 地图控件的组合
         * 比例尺 平移控件 添加地图缩略图
         */
        GaocontrolGroups() {
            const { map } = this;

            return {
                // 比例尺
                ScaleControl() {
                    map.plugin(["AMap.Scale"], function() {
                        var scale = new AMap.Scale({
                        offset: new AMap.Pixel(20, 60)
                        });
                        map.addControl(scale);
                        scale.show();
                    });
                },
                // 平移控件
                NavigationControl() {
                    map.plugin(["AMap.ToolBar"], function() {
                        //加载工具条
                        var tool = new AMap.ToolBar({
                        position: "RB",
                        offset: new AMap.Pixel(20, 120),
                        ruler: false
                        });
                        map.addControl(tool);
                    });
                },
                CityListControl() {},
                // 添加地图缩略图
                OverviewMapControl(isControl) {
                    map.plugin(["AMap.OverView"], function() {
                        const view = new AMap.OverView({
                            isOpen: true
                        });
                        isControl && map.addControl(view);
                    });
                }
            }
        },

        /**
         * 加载控件的时候需要延时
         */
        GaocontrolGroups_Load() {
            const controlMethods = this.GaocontrolGroups();
            var timer = setTimeout( _ => {
                clearTimeout(timer);
                timer = null;
                this.controls.forEach(control => {
                    controlMethods[control](true);
                });
            }, 100)
        },
/**gis */
        async GisInit(){
             await asyncDownloadScript("map1","./static/js/SuperMap-8.1.1-14426.js")
         await asyncDownloadScript("map0","./static/js/SuperMap_Plot-8.1.1-14426.js")
           await asyncDownloadScript("map2","./static/js/SuperMap_zh-CN.js")
        setTimeout(() => {
            this.Gisbor()
        }, 200);
      },
      Gisbor(){
          SuperMap.ImgPath =
                "/gao/iserver/services/map-ugcv5-DCJBASEZGHA/rest/static/javascriptForMaps/resource/img/";
            let options = {};
            if (this.prjCoordSys != null && this.prjCoordSys != "") {
                options.projection = this.prjCoordSys; // 给客户端传递动态投影参数
            }
            if (this.visibleScales) {
                this.map = new SuperMap.Map('map', {
                    controls: [],
                    scales: this.visibleScales,
                    theme: null
                });
            } else {
                this.map = new SuperMap.Map('map', {
                    controls: [],
                    theme: null
                });
            }
            
            const navigation = new SuperMap.Control.Navigation({
                dragPanOptions: {
                    enableKinetic: true
                }
            });
             
            this.map.addControl(navigation);
            const lastTileVersionName =
                this.tileVersions == null ?
                null :
                this.tileVersions[this.tileVersions.length - 1].name;
            if (lastTileVersionName == null) {
                this.layer = new SuperMap.Layer.TiledDynamicRESTLayer(
                   'map',
                    this.url, {},
                    options
                );
            } else {
                this.layer = new SuperMap.Layer.TiledDynamicRESTLayer(
                   'map',
                    this.url, {
                        tileversion: lastTileVersionName
                    }, {
                        scales: this.visibleScales
                    }
                );
            }
             
            this.lineLayer = new SuperMap.Layer.Vector("lineLayer");
           this.polygonLayer = new SuperMap.Layer.Vector("polygonLayer");

            this.layer.events.on({
                layerInitialized: this.addlayer
            });
      },
      addlayer() {
           
          
            this.map.addLayers([this.layer, this.lineLayer, this.polygonLayer]);
            const lonlat = this.layer.maxExtent.getCenterLonLat();
            const lon = lonlat.lon;
            const lat = lonlat.lat;
            this.map.setCenter(new SuperMap.LonLat(lon, lat));
            this.mapMethods= new Gis(this.map)
            var timer = setTimeout(_ => {
                clearTimeout(timer);
                timer =null;
                typeof this.mapLoaded == 'function' && this.mapLoaded();
            },2000);
            
            this.map.zoomIn();
            this.map.zoomIn();
        }
    },

}
</script>

<style lang="scss">
    @import '../../../theme/mixins/map.scss';
    .mmm{
        height: 100%;
         .cv-map {
        @include base-map;
	    // position: static !important;
    }
    }
   
.mapbase {
}
</style>


