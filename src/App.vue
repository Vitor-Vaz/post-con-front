<script setup lang="ts">
import { ref } from 'vue'

const count = ref(0)
</script>

<template>
  <div class="container">
    <div class="glow-effect"></div>
    <div class="card">
      <div class="badge">VUE 3 + TYPESCRIPT</div>
      <h1>PostoConfiável</h1>
      <p class="subtitle">Front-End Inicializado com Sucesso 🚀</p>
      
      <div class="divider"></div>
      
      <p class="description">
        Este é o ponto de partida do front-end do <strong>PostoConfiável</strong>, estruturado com Vite, Vue 3 e TypeScript.
      </p>

      <div class="interactive-area">
        <button @click="count++" class="btn-primary">
          Cliques de Teste: {{ count }}
        </button>
      </div>

      <div class="tech-stack">
        <span class="tech-item">⚡ Vite</span>
        <span class="tech-item">🟢 Vue 3</span>
        <span class="tech-item">🔷 TypeScript</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.container {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 80vh;
  z-index: 1;
}

.glow-effect {
  position: absolute;
  width: 300px;
  height: 300px;
  background: radial-gradient(circle, rgba(59, 130, 246, 0.15) 0%, rgba(0, 0, 0, 0) 70%);
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: -1;
  pointer-events: none;
}

.card {
  background: rgba(15, 23, 42, 0.6);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 24px;
  padding: 3rem 2.5rem;
  max-width: 500px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.card:hover {
  transform: translateY(-5px);
  border-color: rgba(59, 130, 246, 0.3);
  box-shadow: 0 30px 60px rgba(59, 130, 246, 0.1);
}

.badge {
  display: inline-block;
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(147, 51, 234, 0.1) 100%);
  border: 1px solid rgba(59, 130, 246, 0.2);
  color: #60a5fa;
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 0.05em;
  padding: 0.4rem 1rem;
  border-radius: 100px;
  margin-bottom: 1.5rem;
  text-transform: uppercase;
}

h1 {
  font-size: 2.5rem;
  font-weight: 800;
  margin: 0 0 0.5rem 0;
  background: linear-gradient(135deg, #ffffff 0%, #94a3b8 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.subtitle {
  color: #3b82f6;
  font-size: 1.1rem;
  font-weight: 600;
  margin: 0;
}

.divider {
  height: 1px;
  background: linear-gradient(90deg, rgba(255, 255, 255, 0) 0%, rgba(255, 255, 255, 0.1) 50%, rgba(255, 255, 255, 0) 100%);
  margin: 2rem 0;
}

.description {
  color: #94a3b8;
  font-size: 0.95rem;
  line-height: 1.6;
  margin-bottom: 2rem;
}

.interactive-area {
  margin-bottom: 2.5rem;
}

.btn-primary {
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  border: none;
  color: white;
  padding: 0.8rem 2rem;
  font-size: 0.95rem;
  font-weight: 600;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(59, 130, 246, 0.4);
}

.btn-primary:active {
  transform: translateY(0);
}

.tech-stack {
  display: flex;
  justify-content: center;
  gap: 1rem;
}

.tech-item {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.05);
  padding: 0.4rem 0.8rem;
  border-radius: 8px;
  font-size: 0.8rem;
  color: #94a3b8;
}
</style>
