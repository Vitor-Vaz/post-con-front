<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { Loader } from '@googlemaps/js-api-loader'

interface Props {
  center?: google.maps.LatLngLiteral
  zoom?: number
}

const props = withDefaults(defineProps<Props>(), {
  center: () => ({ lat: -23.55052, lng: -46.633308 }), // São Paulo, SP - Brasil
  zoom: 14
})

const mapRef = ref<HTMLDivElement | null>(null)
let map: google.maps.Map | null = null
const markersList = ref<google.maps.Marker[]>([])

// Sleek Dark Mode Styling with Hidden Default POIs (Points of Interest)
const darkMapStyle: google.maps.MapTypeStyle[] = [
  { elementType: "geometry", stylers: [{ color: "#0f172a" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#0f172a" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#94a3b8" }] },
  {
    featureType: "administrative.locality",
    elementType: "labels.text.fill",
    stylers: [{ color: "#cbd5e1" }]
  },
  // HIDE ALL GENERIC POINTS OF INTEREST (POIs) to keep map clean!
  {
    featureType: "poi",
    stylers: [{ visibility: "off" }]
  },
  {
    featureType: "road",
    elementType: "geometry",
    stylers: [{ color: "#1e293b" }]
  },
  {
    featureType: "road",
    elementType: "geometry.stroke",
    stylers: [{ color: "#0f172a" }]
  },
  {
    featureType: "road.highway",
    elementType: "geometry",
    stylers: [{ color: "#334155" }]
  },
  {
    featureType: "road.highway",
    elementType: "geometry.stroke",
    stylers: [{ color: "#1e293b" }]
  },
  {
    featureType: "road.highway",
    elementType: "labels.text.fill",
    stylers: [{ color: "#cbd5e1" }]
  },
  {
    featureType: "transit",
    elementType: "geometry",
    stylers: [{ color: "#1e293b" }]
  },
  {
    featureType: "transit.style",
    elementType: "labels.text.fill",
    stylers: [{ color: "#94a3b8" }]
  },
  {
    featureType: "water",
    elementType: "geometry",
    stylers: [{ color: "#020617" }]
  },
  {
    featureType: "water",
    elementType: "labels.text.fill",
    stylers: [{ color: "#475569" }]
  }
]

// Mock Gas Stations to render as custom premium pins
const mockGasStations = [
  {
    name: "Posto Petrobras - Consolação",
    brand: "Petrobras",
    lat: -23.553,
    lng: -46.638,
    score: 4.8,
    reviewsCount: 142,
    priceGas: "R$ 5,79"
  },
  {
    name: "Posto Ipiranga - Bela Vista",
    brand: "Ipiranga",
    lat: -23.547,
    lng: -46.631,
    score: 3.9,
    reviewsCount: 89,
    priceGas: "R$ 5,85"
  },
  {
    name: "Posto Shell - Liberdade",
    brand: "Shell",
    lat: -23.556,
    lng: -46.627,
    score: 2.8,
    reviewsCount: 54,
    priceGas: "R$ 5,99"
  }
]

// Generate premium custom SVG marker pins matching our trust scores
const getMarkerSymbol = (googleMaps: typeof google, score: number): google.maps.Symbol => {
  let color = "#10b981" // Green: trusted (> 4.5)
  if (score < 3.0) {
    color = "#ef4444" // Red: alert (< 3.0)
  } else if (score < 4.5) {
    color = "#f59e0b" // Yellow/Orange: average (3.0 - 4.5)
  }

  return {
    path: 'M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z',
    fillColor: color,
    fillOpacity: 1,
    strokeColor: '#ffffff',
    strokeWeight: 1.5,
    scale: 1.5,
    anchor: new googleMaps.Point(12, 22)
  }
}

onMounted(async () => {
  if (!mapRef.value) return

  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || ''

  const loader = new Loader({
    apiKey: apiKey,
    version: "weekly",
    libraries: ["places"]
  })

  try {
    const googleInstance = await loader.load()
    map = new googleInstance.maps.Map(mapRef.value, {
      center: props.center,
      zoom: props.zoom,
      styles: darkMapStyle,
      disableDefaultUI: false,
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: false
    })

    // Create a single InfoWindow to reuse across markers
    const infoWindow = new googleInstance.maps.InfoWindow()

    // Add Mock Gas Stations as custom colored markers
    mockGasStations.forEach((station) => {
      const marker = new googleInstance.maps.Marker({
        position: { lat: station.lat, lng: station.lng },
        map: map,
        title: station.name,
        icon: getMarkerSymbol(googleInstance, station.score)
      })

      // Elegant HTML layout inside the InfoWindow
      const contentString = `
        <div style="color: #0f172a; font-family: 'Outfit', sans-serif; padding: 0.5rem; max-width: 240px;">
          <h4 style="margin: 0 0 0.25rem 0; font-size: 0.95rem; font-weight: 700; color: #1e293b;">${station.name}</h4>
          <p style="margin: 0 0 0.5rem 0; font-size: 0.75rem; color: #64748b; font-weight: 500;">Bandeira: ${station.brand}</p>
          <div style="display: flex; align-items: center; justify-content: space-between; margin-top: 0.5rem; border-top: 1px solid #f1f5f9; padding-top: 0.5rem;">
            <span style="font-weight: 700; font-size: 0.85rem; color: ${station.score >= 4.5 ? '#10b981' : station.score >= 3.0 ? '#d97706' : '#ef4444'}">
              ⭐ ${station.score.toFixed(1)} <span style="font-weight: 400; font-size: 0.7rem; color: #94a3b8;">(${station.reviewsCount})</span>
            </span>
            <span style="background: #e0f2fe; color: #0369a1; padding: 0.2rem 0.5rem; border-radius: 6px; font-size: 0.75rem; font-weight: 700;">
              Gas: ${station.priceGas}
            </span>
          </div>
        </div>
      `

      marker.addListener("click", () => {
        infoWindow.setContent(contentString)
        infoWindow.open(map, marker)
      })

      markersList.value.push(marker)
    })

    console.log("Google Map & Mock Gas Stations loaded successfully!")
  } catch (error) {
    console.error("Failed to load Google Maps API:", error)
  }
})

onUnmounted(() => {
  // Clear all markers from map
  markersList.value.forEach(marker => marker.setMap(null))
  markersList.value = []
  map = null
})
</script>

<template>
  <div class="map-wrapper">
    <div ref="mapRef" class="map-container"></div>
  </div>
</template>

<style scoped>
.map-wrapper {
  position: relative;
  width: 100%;
  height: 100%;
}

.map-container {
  width: 100%;
  height: 100%;
  border-radius: inherit;
}
</style>
