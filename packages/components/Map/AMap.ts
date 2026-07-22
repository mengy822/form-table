export default function MapLoader({
  key = '78c0e9587a42052fad5633f7b17bf38c',
  version = '2.0',
  plugins = [
    'AMap.Geocoder',
    'AMap.MouseTool',
    'AMap.CircleEditor',
    'AMap.DistrictSearch',
    'AMap.MarkerCluster',
  ],
}) {
  return new Promise((resolve, reject) => {
    if (window.AMap) {
      resolve(window.AMap)
    } else {
      window._AMapSecurityConfig = {
        securityJsCode: '4fc272887892466d150156bee580b0c3',
      }
      const script = document.createElement('script')
      script.type = 'text/javascript'
      script.async = true
      // script.src ='https://webapi.amap.com/maps?v=1.4.15&key=e75a53fe54d8a6f5ac22cfa27932b81b&plugin=AMap.Geocoder,AMap.MouseTool,AMap.CircleEditor&callback=initAMap'
      script.src = `https://webapi.amap.com/maps?v=${version}&key=${key}&plugin=${plugins.join(',')}&callback=initAMap`

      // script.src = 'http://webapi.amap.com/ui/1.0/main.js'
      script.onerror = reject
      document.head.appendChild(script)
    }

    window.initAMap = () => {
      resolve(window.AMap)
    }
  })
}
export const getAddress = (lat, lng) => {
  return new Promise((resolve, reject) => {
    fetch(
      'https://restapi.amap.com/v3/geocode/regeo?' +
        'platform=JS&' +
        'logversion=2.0&' +
        'key=fea3f2c8a9af2793a6198ddcc9746c6f&' +
        'sdkversion=2.3.5.6&' +
        'appname=http%253A%252F%252F172.16.18.229%252Fzhny%252F' +
        '&csid=402C949C-0BFA-4848-A2E0-1AA567216249' +
        'language=zh_cn&location=' +
        lng +
        ',' +
        lat +
        '&radius=1000',
    )
      .then((res) => res.json())
      .then((res) => {
        if (res.info == 'ok'.toUpperCase()) resolve(res.regeocode.formatted_address)
        else {
          resolve('未知位置')
        }
      })
  })
}
