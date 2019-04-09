import mapboxgl from 'mapbox-gl'

console.log('this is main js for piece - helloworld in project mapbox')

// 初始化地图
var map // 当前map对象
mapboxgl.accessToken = 'pk.eyJ1Ijoic2hpeXVodSIsImEiOiJjanB3ZG4xZzAxMWRwNDNtemw3Mmh6dXNzIn0.c_gfXw7nNIG1c4Wefkw59A'
// 定位在杭州
map = new mapboxgl.Map({
  container: 'mapContainer',
  style: 'mapbox://styles/mapbox/streets-v11',
  center: [120.22220882069132, 30.218116279551907],
  zoom: 15.15
})

// 当地图渲染完成时，生成一个层
map.on('load', function () {
  // 添加一个地标
  map.addLayer({
    id: 'AH',
    type: 'symbol',
    source: {
      'type': 'geojson',
      'data': {
        'type': 'FeatureCollection',
        'features': [{
          type: 'Feature',
          properties: {
            description: '<div>某公司</div>',
            icon: 'theatre'
          },
          geometry: {
            type: 'Point',
            coordinates: [120.22220882069132, 30.218116279551907]
          }
        }]
      }
    },
    'layout': {
      'icon-image': '{icon}-15',
      'icon-allow-overlap': true
    }
  })
})

let popup = new mapboxgl.Popup()
console.log(popup)

map.on('mouseleave', 'AH', function (e) {
  map.getCanvas().style.cursor = ''
  popup.remove()
})

map.on('mouseenter', 'AH', function (e) {
  map.getCanvas().style.cursor = 'pointer'
  let coordinates = e.features[0].geometry.coordinates.slice()
  coordinates[1] += 0.0002
  let description = e.features[0].properties.description

  popup.setLngLat(coordinates)
    .setHTML(description)
    .addTo(map)
})

map.on('click', 'AH', function (e) {
})

//   // When a click event occurs on a feature in the places layer, open a popup at the
//   // location of the feature, with description HTML from its properties.
//   map.on('click', 'places', function (e) {
//     var coordinates = e.features[0].geometry.coordinates.slice()
//     var description = e.features[0].properties.description

//     // Ensure that if the map is zoomed out such that multiple
//     // copies of the feature are visible, the popup appears
//     // over the copy being pointed to.
//     while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
//       coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360
//     }

//     new mapboxgl.Popup()
//       .setLngLat(coordinates)
//       .setHTML(description)
//       .addTo(map)
//   })

//   // Change the cursor to a pointer when the mouse is over the places layer.
//   map.on('mouseenter', 'places', function () {
//     map.getCanvas().style.cursor = 'pointer'
//   })

//   // Change it back to a pointer when it leaves.
//   map.on('mouseleave', 'places', function () {
//     map.getCanvas().style.cursor = ''
//   })
// })
