<script setup lang="ts">
import MapDashboard from './views/MapDashboard.vue'
</script>

<template>
  <MapDashboard />
</template>

<style>
/* Reset global application spacing */
body {
  margin: 0;
  padding: 0;
  background: radial-gradient(circle at top, #0f172a 0%, #020617 100%);
  color: #e2e8f0;
  min-height: 100vh;
}

#app {
  max-width: none;
  margin: 0;
  padding: 0;
  width: 100%;
}
</style>
