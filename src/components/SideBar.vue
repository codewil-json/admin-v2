<template>
  <nav class="sidebar">
    <h3 class="sidebar-title">Blog</h3>
    <ul class="nav-list">
      <li><router-link to="/categories">Categorias</router-link></li>
      <li><router-link to="/posts">Posts</router-link></li>
    </ul>
    <div class="logout-wrap">
      <button class="logout" @click="handleLogout">Sair</button>
    </div>
  </nav>
</template>

<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

const handleLogout = () => {
  try {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
  } catch (e) {
    console.error('Failed to clear storage during logout', e)
  }
  router.push({ name: 'login' })
}
</script>

<style scoped>
.sidebar {
  width: 220px;
  padding: 16px;
  border-right: 1px solid #e6edf3;
}
.sidebar-title {
  margin: 0 0 12px;
  font-size: 14px;
  color: #111827;
}
.nav-list {
  list-style: none;
  padding: 0;
  margin: 0;
}
.nav-list li {
  margin: 8px 0;
}
.nav-list a {
  color: #1f2937;
  text-decoration: none;
  font-size: 14px;
}
.nav-list a.router-link-active {
  font-weight: 600;
}
.logout-wrap {
  margin-top: 18px;
}
.logout {
  display: inline-block;
  padding: 8px 12px;
  border: 0;
  background: #ef4444;
  color: #fff;
  border-radius: 6px;
  cursor: pointer;
  font-size: 13px;
}
.logout:hover { opacity: 0.95 }
</style>
