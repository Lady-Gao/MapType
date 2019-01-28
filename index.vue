<template>  
       
        <mapType mapname='GaodeMap' @mapLoaded='mapLoaded'>
            <!-- <WhichMap mapname='BaiduMap'  />> -->
            <!-- <WhichMap mapname='Gis' />> -->
            <!-- <WhichMap mapname='GoogleMap' />> -->
            <!-- <WhichMap mapname='GaodeMap' />> -->
        </mapType>
        
</template>

<script>
import mapType from "./mapType";
export default {
    components:{
        mapType
    },
    methods: {
         // 地图加载完成的回调
        mapLoaded() {
            
        },
    },
}
</script>

<style lang="scss">
  

</style>


