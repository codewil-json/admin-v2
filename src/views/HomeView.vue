<template>
  <div class="layout">
    <SideBar />
    <main class="main">
      <h1>Home</h1>
      <p>Área principal. Selecione uma opção no menu à esquerda.</p>
    </main>
  </div>
</template>

<script setup>
import SideBar from '@/components/SideBar.vue'
</script>

<style scoped>
.layout {
  display: flex;
  min-height: 100vh;
}
.main {
  flex: 1;
  padding: 20px;
}
</style>
