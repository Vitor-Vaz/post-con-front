<script setup lang="ts">
import { ref, watch } from 'vue'
import { createReviewWithStation } from '../services/api'

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

interface Props {
  isOpen: boolean
  station: StationData | null
}

const props = defineProps<Props>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'success', placeId: string, rating: number): void
}>()

const rating = ref<number>(0)
const hoverRating = ref<number>(0)
const isSubmitting = ref(false)
const submitStatus = ref<'idle' | 'success' | 'error'>('idle')
const errorMessage = ref('')

// Reset form when modal opens/closes
watch(
  () => props.isOpen,
  (newVal) => {
    if (newVal) {
      rating.value = 0
      hoverRating.value = 0
      submitStatus.value = 'idle'
      errorMessage.value = ''
    }
  }
)

const handleStarClick = (value: number) => {
  rating.value = value
}

const handleStarHover = (value: number) => {
  hoverRating.value = value
}

const handleStarLeave = () => {
  hoverRating.value = 0
}

const handleSubmit = async () => {
  if (!props.station) return
  if (rating.value === 0) {
    errorMessage.value = 'Por favor, selecione uma nota de 1 a 5 estrelas.'
    return
  }

  isSubmitting.value = true
  submitStatus.value = 'idle'
  errorMessage.value = ''

  try {
    await createReviewWithStation({
      place_id: props.station.placeId,
      rating: rating.value,
      station: {
        name: props.station.name,
        address: props.station.address,
        latitude: props.station.lat,
        longitude: props.station.lng
      }
    })

    submitStatus.value = 'success'
    setTimeout(() => {
      emit('success', props.station!.placeId, rating.value)
    }, 1800) // Delay to let user see success animation
  } catch (error: any) {
    submitStatus.value = 'error'
    errorMessage.value = error.message || 'Erro inesperado ao cadastrar o posto.'
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <transition name="fade">
    <div v-if="isOpen" class="modal-overlay" @click.self="emit('close')">
      <transition name="zoom">
        <div v-if="isOpen" class="modal-card glass-panel" role="dialog" aria-modal="true">
          <!-- Close button -->
          <button class="close-btn" @click="emit('close')" :disabled="isSubmitting">
            &times;
          </button>

          <!-- Normal Form State -->
          <div v-if="submitStatus !== 'success'" class="form-container">
            <header class="modal-header">
              <span class="modal-icon">✨</span>
              <h2>Adicionar Novo Posto</h2>
              <p class="modal-desc">
                Este posto ainda não foi avaliado no PostoConfiável. Seja o primeiro a registrar e avaliar!
              </p>
            </header>

            <div v-if="station" class="station-details-card">
              <div class="station-meta">
                <span class="brand-badge">{{ station.brand }}</span>
                <h3 class="station-name">{{ station.name }}</h3>
                <p v-if="station.address" class="station-address">
                  📍 {{ station.address }}
                </p>
                <div class="geo-coords">
                  <span>Lat: {{ station.lat.toFixed(5) }}</span>
                  <span>Lng: {{ station.lng.toFixed(5) }}</span>
                </div>
              </div>
            </div>

            <div class="form-group rating-group">
              <label class="group-label">Qual é a sua avaliação geral?</label>
              
              <div class="stars-selector" @mouseleave="handleStarLeave">
                <button
                  v-for="index in 5"
                  :key="index"
                  type="button"
                  class="star-selector-btn"
                  :class="{
                    'filled': index <= (hoverRating || rating),
                    'active': index <= rating
                  }"
                  @click="handleStarClick(index)"
                  @mouseover="handleStarHover(index)"
                >
                  ★
                </button>
              </div>
              <span v-if="rating > 0" class="rating-text">
                Nota: <strong class="highlight-score">{{ rating }}.0</strong> / 5.0
              </span>
              <span v-else class="rating-text hint">
                Passe o mouse e selecione a pontuação
              </span>
            </div>

            <!-- Error message banner -->
            <transition name="slide-fade">
              <div v-if="errorMessage" class="error-banner">
                <span class="error-icon">⚠️</span>
                <span class="error-text">{{ errorMessage }}</span>
              </div>
            </transition>

            <footer class="modal-actions">
              <button
                type="button"
                class="btn btn-secondary"
                @click="emit('close')"
                :disabled="isSubmitting"
              >
                Cancelar
              </button>
              <button
                type="button"
                class="btn btn-primary"
                @click="handleSubmit"
                :disabled="isSubmitting || rating === 0"
              >
                <span v-if="isSubmitting" class="spinner"></span>
                <span v-else>Confirmar & Salvar</span>
              </button>
            </footer>
          </div>

          <!-- Animated Success State -->
          <div v-else class="success-container animate-fade-in">
            <div class="success-icon-wrapper">
              <div class="success-checkmark">
                <div class="checkmark-circle"></div>
                <div class="checkmark-stem"></div>
                <div class="checkmark-kick"></div>
              </div>
            </div>
            <h3>Posto Cadastrado!</h3>
            <p class="success-message">
              Sua avaliação de <strong>{{ rating }}.0 estrelas</strong> foi salva com sucesso. Obrigado por contribuir para um abastecimento mais confiável!
            </p>
          </div>
        </div>
      </transition>
    </div>
  </transition>
</template>

<style scoped>
/* Modal overlay with dark backdrop blur */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(2, 6, 23, 0.75);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
  padding: 1.5rem;
}

/* Glassmorphic card styling */
.glass-panel {
  background: rgba(15, 23, 42, 0.85);
  backdrop-filter: blur(20px) saturate(180%);
  -webkit-backdrop-filter: blur(20px) saturate(180%);
  border: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow:
    0 24px 60px rgba(0, 0, 0, 0.75),
    inset 0 1px 0 rgba(255, 255, 255, 0.05);
}

.modal-card {
  position: relative;
  width: 100%;
  max-width: 480px;
  border-radius: 24px;
  padding: 2.2rem;
  box-sizing: border-box;
  overflow: hidden;
}

/* Close button */
.close-btn {
  position: absolute;
  top: 1.25rem;
  right: 1.25rem;
  background: transparent;
  border: none;
  font-size: 1.8rem;
  color: #64748b;
  cursor: pointer;
  line-height: 1;
  padding: 0.25rem;
  transition: color 0.2s ease;
  z-index: 5;
}

.close-btn:hover {
  color: #ffffff;
}

.close-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

/* Header */
.modal-header {
  text-align: center;
  margin-bottom: 1.5rem;
  font-family: 'Outfit', sans-serif;
}

.modal-icon {
  font-size: 2.2rem;
  display: block;
  margin-bottom: 0.5rem;
}

.modal-header h2 {
  font-size: 1.5rem;
  font-weight: 800;
  color: #ffffff;
  margin: 0 0 0.5rem 0;
}

.modal-desc {
  font-size: 0.85rem;
  color: #94a3b8;
  line-height: 1.5;
  margin: 0;
}

/* Station Details Card */
.station-details-card {
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.04);
  border-radius: 16px;
  padding: 1.25rem;
  margin-bottom: 1.75rem;
  font-family: 'Outfit', sans-serif;
}

.brand-badge {
  display: inline-block;
  background: rgba(59, 130, 246, 0.15);
  border: 1px solid rgba(59, 130, 246, 0.25);
  color: #60a5fa;
  font-size: 0.65rem;
  font-weight: 700;
  padding: 0.2rem 0.5rem;
  border-radius: 6px;
  text-transform: uppercase;
  margin-bottom: 0.5rem;
}

.station-name {
  font-size: 1.15rem;
  font-weight: 700;
  color: #ffffff;
  margin: 0 0 0.4rem 0;
  line-height: 1.3;
}

.station-address {
  font-size: 0.8rem;
  color: #cbd5e1;
  margin: 0 0 0.6rem 0;
  line-height: 1.4;
}

.geo-coords {
  display: flex;
  gap: 1rem;
  font-size: 0.7rem;
  color: #475569;
}

/* Star Rating System */
.rating-group {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 2rem;
  font-family: 'Outfit', sans-serif;
}

.group-label {
  font-size: 0.9rem;
  font-weight: 600;
  color: #e2e8f0;
}

.stars-selector {
  display: flex;
  gap: 0.5rem;
  font-size: 2.2rem;
}

.star-selector-btn {
  background: transparent;
  border: none;
  color: #334155;
  cursor: pointer;
  padding: 0;
  transition: all 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.star-selector-btn:hover {
  transform: scale(1.2);
}

.star-selector-btn.filled {
  color: #fbbf24;
  text-shadow: 0 0 10px rgba(251, 191, 36, 0.3);
}

.star-selector-btn.active {
  transform: scale(1.08);
}

.rating-text {
  font-size: 0.8rem;
  color: #94a3b8;
  transition: all 0.2s ease;
}

.rating-text.hint {
  color: #475569;
}

.highlight-score {
  color: #fbbf24;
  font-size: 0.95rem;
}

/* Error Banner */
.error-banner {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.25);
  border-radius: 12px;
  padding: 0.75rem 1rem;
  margin-bottom: 1.5rem;
  box-sizing: border-box;
}

.error-icon {
  font-size: 1.1rem;
}

.error-text {
  font-size: 0.8rem;
  color: #fca5a5;
  line-height: 1.4;
}

/* Action Buttons */
.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  margin-top: 1.5rem;
}

.btn {
  font-family: 'Outfit', sans-serif;
  font-size: 0.875rem;
  font-weight: 700;
  padding: 0.75rem 1.5rem;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.btn-secondary {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.05);
  color: #94a3b8;
}

.btn-secondary:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.06);
  color: #ffffff;
  border-color: rgba(255, 255, 255, 0.1);
}

.btn-primary {
  background: linear-gradient(135deg, #2563eb 0%, #7c3aed 100%);
  color: #ffffff;
  box-shadow: 0 4px 14px rgba(37, 99, 235, 0.3);
}

.btn-primary:hover:not(:disabled) {
  background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%);
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(37, 99, 235, 0.4);
}

.btn-primary:active:not(:disabled) {
  transform: translateY(0);
}

/* Spinning loading indicator */
.spinner {
  width: 14px;
  height: 14px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: #ffffff;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* Success View */
.success-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 1.5rem 0.5rem;
  font-family: 'Outfit', sans-serif;
}

.success-icon-wrapper {
  margin-bottom: 1.5rem;
}

.success-checkmark {
  width: 72px;
  height: 72px;
  position: relative;
}

.checkmark-circle {
  width: 72px;
  height: 72px;
  border: 3px solid rgba(16, 185, 129, 0.2);
  border-radius: 50%;
  position: absolute;
  top: 0;
  left: 0;
  box-sizing: border-box;
  animation: circle-pulse 1.5s ease-out infinite;
}

.checkmark-stem {
  width: 4px;
  height: 24px;
  background-color: #10b981;
  position: absolute;
  left: 36px;
  top: 18px;
  transform: rotate(45deg);
  transform-origin: bottom right;
  border-radius: 2px;
  animation: draw-stem 0.4s ease-out forwards;
}

.checkmark-kick {
  width: 12px;
  height: 4px;
  background-color: #10b981;
  position: absolute;
  left: 26px;
  top: 38px;
  transform: rotate(45deg);
  transform-origin: top left;
  border-radius: 2px;
  animation: draw-kick 0.4s 0.2s ease-out forwards;
}

@keyframes circle-pulse {
  0% {
    transform: scale(0.98);
    border-color: rgba(16, 185, 129, 0.3);
  }
  50% {
    transform: scale(1.05);
    border-color: rgba(16, 185, 129, 0.6);
    box-shadow: 0 0 16px rgba(16, 185, 129, 0.3);
  }
  100% {
    transform: scale(0.98);
    border-color: rgba(16, 185, 129, 0.3);
  }
}

.success-container h3 {
  font-size: 1.5rem;
  font-weight: 800;
  color: #10b981;
  margin: 0 0 0.75rem 0;
}

.success-message {
  font-size: 0.9rem;
  color: #cbd5e1;
  line-height: 1.6;
  margin: 0;
}

/* Transitions and Animations */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.zoom-enter-active,
.zoom-leave-active {
  transition: all 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.zoom-enter-from,
.zoom-leave-to {
  opacity: 0;
  transform: scale(0.9) translateY(12px);
}

.slide-fade-enter-active,
.slide-fade-leave-active {
  transition: all 0.25s ease-out;
}

.slide-fade-enter-from,
.slide-fade-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}

.animate-fade-in {
  animation: fade-in-up 0.5s ease-out forwards;
}

@keyframes fade-in-up {
  from {
    opacity: 0;
    transform: translateY(12px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
