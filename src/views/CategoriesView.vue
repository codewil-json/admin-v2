<template>
  <div class="layout">
    <SideBar />
    <main class="main">
      <div class="header">
        <div>
          <p class="eyebrow">Gerenciamento</p>
          <h1>Categorias</h1>
        </div>
      </div>

      <section class="card">
        <h2>{{ isEditing ? 'Editar categoria' : 'Nova categoria' }}</h2>

        <form class="category-form" @submit.prevent="submitCategory">
          <div class="field">
            <label for="category-name">Nome</label>
            <input id="category-name" v-model="form.name" type="text" placeholder="Ex: Tecnologia" maxlength="80" required />
          </div>

          <div class="actions-row">
            <button type="submit" class="primary-button">
              {{ isEditing ? 'Salvar alterações' : 'Adicionar categoria' }}
            </button>

            <button v-if="isEditing" type="button" class="secondary-button" @click="cancelEdit">
              Cancelar
            </button>
          </div>
        </form>
      </section>

      <section class="card">
        <div class="list-header">
          <h2>Categorias cadastradas</h2>
          <span>{{ categories.length }}</span>
        </div>

        <p v-if="error" class="message error">{{ error }}</p>
        <p v-else-if="message" class="message success">{{ message }}</p>

        <div v-if="loading" class="empty-state">Carregando categorias...</div>
        <ul v-else-if="categories.length" class="categories-list">
          <li v-for="category in categories" :key="category._id || category.slug">
            <div class="category-info">
              <strong>{{ category.name }}</strong>
              <small>{{ category.slug }}</small>
            </div>

            <div class="item-actions">
              <button type="button" class="secondary-button" @click="startEdit(category)">
                Editar
              </button>
              <button type="button" class="danger-button" @click="deleteCategory(category.slug)">
                Excluir
              </button>
            </div>
          </li>
        </ul>
        <p v-else class="empty-state">Nenhuma categoria cadastrada.</p>
      </section>
    </main>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import SideBar from '@/components/SideBar.vue'
import api from '@/services/api'

const categories = ref([])
const loading = ref(false)
const isEditing = ref(false)
const editingSlug = ref('')
const error = ref('')
const message = ref('')

const form = ref({
  name: ''
})

const normalizeError = (err) =>
  err.response?.data?.message ||
  err.response?.data?.error ||
  err.message ||
  'Erro inesperado. Tente novamente.'

const loadCategories = async () => {
  loading.value = true
  error.value = ''

  try {
    const response = await api.get('/categories')
    categories.value = response.data
  } catch (err) {
    error.value = normalizeError(err)
  } finally {
    loading.value = false
  }
}

const submitCategory = async () => {
  const name = form.value.name.trim()

  if (!name) {
    error.value = 'Informe o nome da categoria.'
    return
  }

  try {
    error.value = ''
    message.value = ''

    if (isEditing.value) {
      await api.put(`/categories/${editingSlug.value}`, { name })
      message.value = 'Categoria atualizada com sucesso.'
    } else {
      await api.post('/categories', { name })
      message.value = 'Categoria criada com sucesso.'
    }

    form.value.name = ''
    isEditing.value = false
    editingSlug.value = ''

    await loadCategories()
  } catch (err) {
    error.value = normalizeError(err)
  }
}

const startEdit = (category) => {
  isEditing.value = true
  editingSlug.value = category.slug
  form.value.name = category.name
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

const cancelEdit = () => {
  isEditing.value = false
  editingSlug.value = ''
  form.value.name = ''
  error.value = ''
}

const deleteCategory = async (slug) => {
  if (!slug) return

  const confirmed = window.confirm('Deseja realmente remover esta categoria?')
  if (!confirmed) return

  try {
    error.value = ''
    message.value = ''

    await api.delete(`/categories/${slug}`)
    message.value = 'Categoria removida com sucesso.'
    await loadCategories()
  } catch (err) {
    error.value = normalizeError(err)
  }
}

onMounted(() => {
  loadCategories()
})
</script>

<style scoped>
.layout {
  display: flex;
  min-height: 100vh;
  background: #f8fafc;
}

.main {
  flex: 1;
  padding: 32px 24px;
}

.header {
  margin-bottom: 24px;
}

.eyebrow {
  margin: 0 0 6px;
  color: #64748b;
  font-size: 12px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  font-weight: 700;
}

h1 {
  margin: 0;
  color: #111827;
  font-size: 2rem;
}

.card {
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 18px;
  padding: 22px;
  box-shadow: 0 10px 30px rgba(15, 23, 42, 0.04);
  margin-bottom: 20px;
}

.card h2 {
  margin-top: 0;
  margin-bottom: 18px;
  color: #111827;
  font-size: 1.2rem;
}

.category-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.field label {
  color: #374151;
  font-size: 0.9rem;
  font-weight: 600;
}

.field input {
  border: 1px solid #d1d5db;
  border-radius: 10px;
  padding: 12px 14px;
  font-size: 1rem;
}

.actions-row,
.item-actions {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.primary-button,
.secondary-button,
.danger-button {
  border: none;
  border-radius: 10px;
  padding: 10px 16px;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.2s ease;
}

.primary-button:hover,
.secondary-button:hover,
.danger-button:hover {
  opacity: 0.94;
}

.primary-button {
  background: #2563eb;
  color: #fff;
}

.secondary-button {
  background: #e2e8f0;
  color: #0f172a;
}

.danger-button {
  background: #ef4444;
  color: #fff;
}

.list-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 14px;
}

.list-header span {
  background: #dbeafe;
  color: #1d4ed8;
  border-radius: 999px;
  padding: 4px 10px;
  font-size: 0.8rem;
  font-weight: 700;
}

.categories-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.categories-list li {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 14px 16px;
  background: #fafafa;
}

.category-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.category-info strong {
  color: #111827;
}

.category-info small {
  color: #64748b;
}

.message {
  margin: 0 0 12px;
  padding: 10px 12px;
  border-radius: 10px;
  font-size: 0.9rem;
}

.message.success {
  background: #dcfce7;
  color: #166534;
}

.message.error {
  background: #fee2e2;
  color: #991b1b;
}

.empty-state {
  color: #64748b;
  padding: 18px 0;
}

@media (max-width: 768px) {
  .layout {
    flex-direction: column;
  }

  .main {
    padding: 20px 16px;
  }

  .categories-list li {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
