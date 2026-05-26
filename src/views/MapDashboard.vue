<script setup lang="ts">
import { ref } from 'vue'
import GoogleMap from '../components/GoogleMap.vue'
import AddStationReviewModal from '../components/AddStationReviewModal.vue'

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
  address?: string
}

const isModalOpen = ref(false)
const selectedStation = ref<StationData | null>(null)
const mapKey = ref(0)

const handleOpenAddReview = (station: StationData) => {
  selectedStation.value = station
  isModalOpen.value = true
}

const handleReviewSuccess = () => {
  isModalOpen.value = false
  // Increment map key to force GoogleMap component reload, fetching new state from backend
  mapKey.value++
}
</script>

<template>
  <div class="dashboard-wrapper">
    <!-- Huge Header Section -->
    <header class="hero-header">
      <div class="badge animate-fade">Fase 2: Mapa Ativo</div>
      <h1 class="main-title">Posto<span class="highlight">Confiável</span></h1>
      <p class="subtitle">
        Encontre combustível de qualidade com avaliações reais e contexto de veículo.
      </p>
    </header>

    <!-- Main Content Layout -->
    <main class="content-grid">
      <!-- Search & Filters Panel (Sidebar) -->
      <section class="sidebar-panel glass-card">
        <div class="panel-header">
          <span class="panel-icon">🔍</span>
          <h2>Pesquisa & Filtros</h2>
        </div>

        <p class="panel-desc">
          Encontre postos específicos ou filtre por combustíveis e melhores avaliações.
        </p>

        <div class="search-box">
          <span class="search-icon">📍</span>
          <input
            type="text"
            placeholder="Pesquisar posto ou local..."
            class="search-input"
            disabled
          />
        </div>

        <div class="divider"></div>

        <div class="filter-group">
          <h3>Tipo de Combustível</h3>
          <div class="filter-tags">
            <button class="tag active">Todos</button>
            <button class="tag">Gasolina Comum</button>
            <button class="tag">Gasolina Aditivada</button>
            <button class="tag">Etanol</button>
            <button class="tag">Diesel</button>
          </div>
        </div>

        <div class="filter-group">
          <h3>Avaliação Mínima</h3>
          <div class="rating-filters">
            <button class="rating-btn active">Qualquer nota</button>
            <button class="rating-btn">⭐ 4.5+ Excelente</button>
            <button class="rating-btn">⭐ 4.0+ Bom</button>
          </div>
        </div>
      </section>

      <!-- Large Map Component Container -->
      <section class="map-panel glass-card">
        <div class="map-header">
          <div class="map-title-area">
            <span class="map-icon">🗺️</span>
            <h3>Visualização Geográfica</h3>
          </div>
          <div class="map-status">
            <span class="pulse-dot"></span>
            <span>Google Maps Live</span>
          </div>
        </div>

        <!-- The actual Map wrapper -->
        <div class="map-wrapper-card">
          <GoogleMap :key="mapKey" @open-add-review="handleOpenAddReview" />
        </div>
      </section>
    </main>

    <!-- Modal for adding station with first review -->
    <AddStationReviewModal
      :is-open="isModalOpen"
      :station="selectedStation"
      @close="isModalOpen = false"
      @success="handleReviewSuccess"
    />
  </div>
</template>

<style scoped>
.dashboard-wrapper {
  max-width: 1300px;
  margin: 0 auto;
  padding: 3rem 2rem;
  display: flex;
  flex-direction: column;
  gap: 3rem;
  box-sizing: border-box;
}

/* Hero Header styling */
.hero-header {
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
}

.badge {
  display: inline-block;
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(147, 51, 234, 0.1) 100%);
  border: 1px solid rgba(59, 130, 246, 0.2);
  color: #60a5fa;
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.05em;
  padding: 0.4rem 1.2rem;
  border-radius: 100px;
  text-transform: uppercase;
}

.main-title {
  font-size: 3.8rem;
  font-weight: 800;
  margin: 0;
  letter-spacing: -0.03em;
  line-height: 1.1;
  color: #ffffff;
  text-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
}

.highlight {
  background: linear-gradient(135deg, #3b82f6 0%, #a855f7 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.subtitle {
  color: #94a3b8;
  font-size: 1.25rem;
  max-width: 600px;
  margin: 0;
  line-height: 1.6;
}

/* Grid Layout */
.content-grid {
  display: grid;
  grid-template-columns: 380px 1fr;
  gap: 2rem;
  align-items: start;
}

@media (max-width: 1024px) {
  .content-grid {
    grid-template-columns: 1fr;
  }
}

/* Premium Card container */
.glass-card {
  background: rgba(15, 23, 42, 0.45);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 24px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
  transition: all 0.3s ease;
}

.glass-card:hover {
  border-color: rgba(59, 130, 246, 0.2);
  box-shadow: 0 30px 60px rgba(59, 130, 246, 0.05);
}

/* Sidebar Styling */
.sidebar-panel {
  padding: 2rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.panel-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.panel-icon {
  font-size: 1.25rem;
}

.panel-header h2 {
  font-size: 1.25rem;
  font-weight: 700;
  color: #ffffff;
  margin: 0;
}

.panel-desc {
  font-size: 0.875rem;
  color: #64748b;
  margin: 0;
  line-height: 1.5;
}

.search-box {
  display: flex;
  align-items: center;
  background: rgba(0, 0, 0, 0.25);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 14px;
  padding: 0.8rem 1rem;
  gap: 0.75rem;
}

.search-icon {
  font-size: 1.1rem;
}

.search-input {
  background: transparent;
  border: none;
  color: #ffffff;
  font-size: 0.9rem;
  outline: none;
  width: 100%;
}

.search-input::placeholder {
  color: #475569;
}

.divider {
  height: 1px;
  background: rgba(255, 255, 255, 0.06);
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.filter-group h3 {
  font-size: 0.85rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: #94a3b8;
  margin: 0;
}

.filter-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.tag {
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.05);
  color: #94a3b8;
  padding: 0.4rem 0.8rem;
  border-radius: 8px;
  font-size: 0.8rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.tag:hover {
  background: rgba(255, 255, 255, 0.05);
  color: #ffffff;
  border-color: rgba(255, 255, 255, 0.1);
}

.tag.active {
  background: rgba(59, 130, 246, 0.1);
  border-color: rgba(59, 130, 246, 0.3);
  color: #60a5fa;
}

.rating-filters {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.rating-btn {
  text-align: left;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.05);
  color: #94a3b8;
  padding: 0.6rem 1rem;
  border-radius: 10px;
  font-size: 0.85rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.rating-btn:hover {
  background: rgba(255, 255, 255, 0.05);
  color: #ffffff;
}

.rating-btn.active {
  background: rgba(59, 130, 246, 0.1);
  border-color: rgba(59, 130, 246, 0.3);
  color: #60a5fa;
}

/* Map Panel (Large Card container for the map) */
.map-panel {
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  height: 620px; /* Keep it very large, but clear height */
}

.map-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.map-title-area {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.map-icon {
  font-size: 1.2rem;
}

.map-title-area h3 {
  font-size: 1rem;
  font-weight: 600;
  color: #ffffff;
  margin: 0;
}

.map-status {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.75rem;
  font-weight: 500;
  color: #94a3b8;
  background: rgba(255, 255, 255, 0.03);
  padding: 0.3rem 0.75rem;
  border-radius: 100px;
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.pulse-dot {
  width: 6px;
  height: 6px;
  background-color: #10b981;
  border-radius: 50%;
  box-shadow: 0 0 6px #10b981;
  animation: pulse 1.8s infinite;
}

@keyframes pulse {
  0% {
    transform: scale(0.95);
    box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7);
  }
  70% {
    transform: scale(1);
    box-shadow: 0 0 0 5px rgba(16, 185, 129, 0);
  }
  100% {
    transform: scale(0.95);
    box-shadow: 0 0 0 0 rgba(16, 185, 129, 0);
  }
}

.map-wrapper-card {
  flex: 1;
  border-radius: 16px;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.05);
}
</style>
