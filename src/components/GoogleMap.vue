<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { Loader } from '@googlemaps/js-api-loader'
import { extractBrandFromName } from '../utils/brand'

interface Props {
  center?: google.maps.LatLngLiteral
  zoom?: number
}

const props = withDefaults(defineProps<Props>(), {
  center: () => ({ lat: -23.55052, lng: -46.633308 }),
  zoom: 14
})

const mapRef = ref<HTMLDivElement | null>(null)
let map: google.maps.Map | null = null
const markersList = ref<google.maps.Marker[]>([])

const darkMapStyle: google.maps.MapTypeStyle[] = [
  { elementType: 'geometry', stylers: [{ color: '#0f172a' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#0f172a' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#94a3b8' }] },
  {
    featureType: 'administrative.locality',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#cbd5e1' }]
  },
  {
    featureType: 'poi',
    stylers: [{ visibility: 'off' }]
  },
  {
    featureType: 'road',
    elementType: 'geometry',
    stylers: [{ color: '#1e293b' }]
  },
  {
    featureType: 'road',
    elementType: 'geometry.stroke',
    stylers: [{ color: '#0f172a' }]
  },
  {
    featureType: 'road.highway',
    elementType: 'geometry',
    stylers: [{ color: '#334155' }]
  },
  {
    featureType: 'road.highway',
    elementType: 'geometry.stroke',
    stylers: [{ color: '#1e293b' }]
  },
  {
    featureType: 'road.highway',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#cbd5e1' }]
  },
  {
    featureType: 'transit',
    elementType: 'geometry',
    stylers: [{ color: '#1e293b' }]
  },
  {
    featureType: 'transit',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#94a3b8' }]
  },
  {
    featureType: 'water',
    elementType: 'geometry',
    stylers: [{ color: '#020617' }]
  },
  {
    featureType: 'water',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#475569' }]
  }
]

interface StationData {
  placeId: string
  name: string
  brand: string
  lat: number
  lng: number
  score: number
  reviewsCount: number
  photoUrl?: string
  priceGas?: string
}

const activeStation = ref<StationData | null>(null)

const getMarkerSymbol = (
  googleMaps: typeof google,
  score: number,
  reviewsCount: number
): google.maps.Symbol => {
  let color = '#10b981'
  if (reviewsCount === 0) {
    color = '#64748b'
  } else if (score < 3.0) {
    color = '#ef4444'
  } else if (score < 4.5) {
    color = '#f59e0b'
  }

  return {
    path: 'M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z',
    fillColor: color,
    fillOpacity: 1,
    strokeColor: '#ffffff',
    strokeWeight: 1.5,
    scale: 1.5,
    anchor: new googleMaps.maps.Point(12, 22)
  }
}

onMounted(async () => {
  if (!mapRef.value) return

  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || ''

  const loader = new Loader({
    apiKey: apiKey,
    version: 'weekly',
    libraries: ['places']
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

    map.addListener('click', () => {
      activeStation.value = null
    })

    const clearMarkers = () => {
      markersList.value.forEach((m) => m.setMap(null))
      markersList.value = []
    }

    const fetchNearbyGasStations = async () => {
      const center = map?.getCenter()
      if (!center) return

      try {
        const { Place } = (await googleInstance.maps.importLibrary(
          'places'
        )) as google.maps.PlacesLibrary

        const request: google.maps.places.SearchNearbyRequest = {
          fields: ['id', 'displayName', 'location', 'photos'],
          locationRestriction: {
            center: center,
            radius: 1500
          },
          includedPrimaryTypes: ['gas_station'],
          maxResultCount: 20
        }

        const { places } = await Place.searchNearby(request)
        if (places && places.length > 0) {
          clearMarkers()

          for (const place of places) {
            if (!place.location) continue

            const placeId = place.id || ''
            const name = place.displayName || 'Posto de Combustível'
            const lat = place.location.lat()
            const lng = place.location.lng()

            let score = 0
            let reviewsCount = 0

            try {
              const res = await fetch(`http://localhost:8080/api/v1/station/${placeId}`)
              if (res.ok) {
                const data = await res.json()
                score = data.score || 0
                reviewsCount = data.reviews_count || 0
              }
            } catch {
              // Silently fallback on network error
            }

            let photoUrl = ''
            if (place.photos && place.photos.length > 0) {
              try {
                photoUrl = place.photos[0].getURI({ maxHeight: 180 }) || ''
              } catch {
                // Ignore photo error
              }
            }

            const station: StationData = {
              placeId,
              name,
              brand: extractBrandFromName(name),
              lat,
              lng,
              score,
              reviewsCount,
              photoUrl,
              priceGas: 'R$ 5,89'
            }

            const marker = new googleInstance.maps.Marker({
              position: place.location,
              map: map,
              title: name,
              icon: getMarkerSymbol(googleInstance, score, reviewsCount)
            })

            marker.addListener('click', (event: google.maps.MapMouseEvent) => {
              activeStation.value = station
              if (event && event.stop) {
                event.stop()
              }
            })

            markersList.value.push(marker)
          }

          console.log(`Loaded ${places.length} real gas stations from modern Places API!`)
        } else {
          console.log('No gas stations found nearby.')
        }
      } catch (error) {
        console.error('Failed to fetch nearby gas stations via modern Places API:', error)
      }
    }

    map.addListener('idle', () => {
      fetchNearbyGasStations()
    })

    console.log('Google Map & Modern Places Library loaded successfully!')
  } catch (error) {
    console.error('Failed to load Google Maps API:', error)
  }
})

onUnmounted(() => {
  markersList.value.forEach((marker) => marker.setMap(null))
  markersList.value = []
  map = null
})
</script>

<template>
  <div class="map-wrapper">
    <div ref="mapRef" class="map-container"></div>

    <!-- Premium Slide-Up Hover Card -->
    <transition name="slide-up">
      <div v-if="activeStation" class="station-hover-card glass-panel">
        <!-- Gas Station Photo Header -->
        <div v-if="activeStation.photoUrl" class="card-image-wrapper">
          <img :src="activeStation.photoUrl" class="card-image" alt="Foto do Posto" />
          <div class="card-image-overlay"></div>
        </div>

        <div class="card-header">
          <h4 class="station-title">{{ activeStation.name }}</h4>
          <span class="station-brand-badge">{{ activeStation.brand }}</span>
        </div>

        <div class="card-body">
          <div v-if="activeStation.reviewsCount > 0" class="rating-info">
            <div class="rating-row">
              <span class="stars-display">
                <span class="star-icon">⭐</span>
                <span class="score-value">{{ activeStation.score.toFixed(1) }}</span>
              </span>
              <span class="reviews-count">({{ activeStation.reviewsCount }} avaliações)</span>
            </div>
            <div class="price-row">
              <span class="price-label">Gasolina:</span>
              <span class="price-value">{{ activeStation.priceGas }}</span>
            </div>
          </div>

          <div v-else class="no-reviews-panel">
            <div class="cta-pulse-badge">
              <span class="pulse-ring"></span>
              <span class="cta-text">✨ Seja o primeiro a avaliar!</span>
            </div>
          </div>
        </div>
      </div>
    </transition>
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

/* Glassmorphism Panel */
.glass-panel {
  background: rgba(15, 23, 42, 0.8);
  backdrop-filter: blur(16px) saturate(180%);
  -webkit-backdrop-filter: blur(16px) saturate(180%);
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow:
    0 12px 30px rgba(0, 0, 0, 0.5),
    inset 0 1px 0 rgba(255, 255, 255, 0.05);
}

.station-hover-card {
  position: absolute;
  bottom: 24px;
  left: 24px;
  right: 24px;
  max-width: 380px;
  margin: 0 auto;
  border-radius: 16px;
  padding: 1.2rem;
  z-index: 10;
  pointer-events: auto; /* Allow interaction inside the card and prevent click-through */
  box-sizing: border-box;
}

@media (min-width: 640px) {
  .station-hover-card {
    left: 50%;
    right: auto;
    width: 360px;
    transform: translateX(-50%);
  }
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
  margin-bottom: 0.75rem;
}

.station-title {
  margin: 0;
  font-family: 'Outfit', sans-serif;
  font-size: 1.05rem;
  font-weight: 700;
  color: #ffffff;
  line-height: 1.3;
}

.station-brand-badge {
  background: rgba(59, 130, 246, 0.15);
  border: 1px solid rgba(59, 130, 246, 0.25);
  color: #60a5fa;
  font-size: 0.7rem;
  font-weight: 700;
  padding: 0.25rem 0.6rem;
  border-radius: 6px;
  text-transform: uppercase;
  letter-spacing: 0.03em;
  white-space: nowrap;
}

.card-body {
  font-family: 'Outfit', sans-serif;
}

.rating-info {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.rating-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.stars-display {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.star-icon {
  color: #fbbf24;
  font-size: 0.9rem;
}

.score-value {
  font-weight: 700;
  font-size: 0.95rem;
  color: #ffffff;
}

.reviews-count {
  font-size: 0.75rem;
  color: #94a3b8;
}

.price-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: rgba(255, 255, 255, 0.03);
  padding: 0.4rem 0.75rem;
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.05);
  margin-top: 0.25rem;
}

.price-label {
  font-size: 0.8rem;
  color: #94a3b8;
  font-weight: 500;
}

.price-value {
  font-size: 0.85rem;
  color: #10b981;
  font-weight: 700;
}

/* Call-to-action for no reviews */
.no-reviews-panel {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 0.25rem 0;
}

.cta-pulse-badge {
  position: relative;
  display: flex;
  align-items: center;
  background: linear-gradient(135deg, rgba(147, 51, 234, 0.15) 0%, rgba(59, 130, 246, 0.15) 100%);
  border: 1px solid rgba(147, 51, 234, 0.3);
  padding: 0.5rem 1rem;
  border-radius: 10px;
  overflow: hidden;
}

.cta-text {
  font-size: 0.85rem;
  font-weight: 700;
  color: #d8b4fe;
  text-shadow: 0 0 10px rgba(168, 85, 247, 0.3);
  z-index: 2;
}

.pulse-ring {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(147, 51, 234, 0.1);
  border-radius: inherit;
  animation: badge-pulse 2s infinite ease-in-out;
  pointer-events: none;
  z-index: 1;
}

@keyframes badge-pulse {
  0% {
    transform: scale(0.95);
    opacity: 0.5;
  }
  50% {
    transform: scale(1.05);
    opacity: 0.8;
  }
  100% {
    transform: scale(0.95);
    opacity: 0.5;
  }
}

/* Slide up Transition */
.slide-up-enter-active,
.slide-up-leave-active {
  transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}

.slide-up-enter-from {
  opacity: 0;
  transform: translate3d(0, 30px, 0);
}

@media (min-width: 640px) {
  .slide-up-enter-from {
    opacity: 0;
    transform: translate3d(-50%, 30px, 0);
  }
}

.slide-up-leave-to {
  opacity: 0;
  transform: translate3d(0, 20px, 0);
}

@media (min-width: 640px) {
  .slide-up-leave-to {
    opacity: 0;
    transform: translate3d(-50%, 20px, 0);
  }
}

/* Card Image Styles */
.card-image-wrapper {
  position: relative;
  width: calc(100% + 2.4rem); /* account for card 1.2rem left/right padding */
  height: 140px;
  margin-top: -1.2rem; /* negative margin to flush against card top/sides */
  margin-left: -1.2rem;
  margin-right: -1.2rem;
  margin-bottom: 0.75rem;
  overflow: hidden;
  border-top-left-radius: 16px;
  border-top-right-radius: 16px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.card-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}

.station-hover-card:hover .card-image {
  transform: scale(1.05); /* subtle zoom on card hover */
}

.card-image-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(to bottom, rgba(15, 23, 42, 0) 40%, rgba(15, 23, 42, 0.85) 100%);
  pointer-events: none;
}
</style>
