<template>
  <div class="layout">
    <SideBar />
    <main class="main">
      <div class="header">
        <div>
          <p class="eyebrow">Conteúdo</p>
          <h1>Posts</h1>
        </div>
      </div>

      <section class="card list-card">
        <div class="list-header">
          <div>
            <h2>Posts</h2>
            <p>Gerencie o conteúdo do blog e o status de publicação.</p>
          </div>

          <div class="list-summary">
            <span class="summary-badge">{{ posts.length }} total</span>
            <span class="summary-badge success">{{ publishedCount }} publicados</span>
            <button type="button" class="primary-button" @click="openCreateModal">
              <i class="bi bi-plus-lg"></i>
              Novo post
            </button>
          </div>
        </div>

        <p v-if="error" class="message error">{{ error }}</p>
        <p v-else-if="message" class="message success">{{ message }}</p>

        <div v-if="loading" class="empty-state">Carregando posts...</div>

        <div v-else-if="posts.length" class="posts-list">
          <article v-for="post in posts" :key="post.slug" class="post-item">
            <div class="post-header">
              <div>
                <h3>{{ post.title }}</h3>
                <span class="post-slug">{{ post.slug }}</span>
              </div>

              <span class="status-badge" :class="getPostStatusClass(post)">
                {{ getPostStatus(post) }}
              </span>
            </div>

            <div class="post-meta-grid">
              <div>
                <span class="meta-label">Categoria</span>
                <strong>{{ post.category?.name || 'Sem categoria' }}</strong>
              </div>

              <div>
                <span class="meta-label">Data</span>
                <strong>{{ post.date }}</strong>
              </div>

              <div>
                <span class="meta-label">Leitura</span>
                <strong>{{ post.readTime || '—' }}</strong>
              </div>
            </div>

            <p class="description">{{ post.description }}</p>

            <div class="tags">
              <span v-for="tag in post.tags" :key="tag" class="tag">{{ tag }}</span>
            </div>

            <div class="item-actions">
              <button type="button" class="icon-button edit-button" @click="startEdit(post)">
                <i class="bi bi-pencil-square"></i>
                Editar
              </button>

              <button type="button" class="icon-button danger-button" @click="deletePost(post.slug)">
                <i class="bi bi-trash3"></i>
                Remover
              </button>
            </div>
          </article>
        </div>

        <p v-else class="empty-state">Nenhum post encontrado.</p>
      </section>

      <div v-if="isModalOpen" class="modal-backdrop" @click.self="closeModal">
        <div class="modal-panel" role="dialog" aria-modal="true" aria-labelledby="post-modal-title">
          <div class="modal-header">
            <div>
              <p class="eyebrow">Conteúdo</p>
              <h3 id="post-modal-title">{{ isEditing ? 'Editar post' : 'Novo post' }}</h3>
            </div>

            <button type="button" class="close-button" @click="closeModal" aria-label="Fechar modal">
              <i class="bi bi-x-lg"></i>
            </button>
          </div>

          <form class="post-form" @submit.prevent="submitPost">
            <div class="grid two-columns">
              <div class="field">
                <label for="post-slug">Slug</label>
                <input id="post-slug" v-model="form.slug" type="text" placeholder="introducao-ao-nodejs" :disabled="isEditing" required />
              </div>

              <div class="field">
                <label for="post-title">Título</label>
                <input id="post-title" v-model="form.title" type="text" placeholder="Introdução ao Node.js" required />
              </div>
            </div>

            <div class="field">
              <label for="post-description">Descrição</label>
              <textarea id="post-description" v-model="form.description" rows="3" placeholder="Resumo do artigo" required />
            </div>

            <div class="grid three-columns">
              <div class="field">
                <label for="post-category">Categoria</label>
                <select id="post-category" v-model="form.category" required>
                  <option value="">Selecione uma categoria</option>
                  <option v-for="category in categories" :key="category._id || category.slug" :value="category.slug">
                    {{ category.name }}
                  </option>
                </select>
              </div>

              <div class="field">
                <label for="post-date">Data</label>
                <input id="post-date" v-model="form.date" type="date" required />
              </div>

              <div class="field">
                <label for="post-read-time">Tempo de leitura</label>
                <input id="post-read-time" v-model="form.readTime" type="text" placeholder="5 min" required />
              </div>
            </div>

            <div class="field">
              <label for="post-tags">Tags</label>
              <input id="post-tags" v-model="form.tags" type="text" placeholder="node, backend" required />
            </div>

            <div class="field">
              <label for="post-content">Conteúdo</label>
              <ckeditor
                :editor="editor"
                v-model="form.content"
                :config="editorConfig"
                class="ckeditor"
                @ready="onEditorReady"
              />
            </div>

            <div class="actions-row modal-actions">
              <button type="button" class="secondary-button" @click="closeModal">
                Cancelar
              </button>

              <button type="submit" class="primary-button">
                {{ isEditing ? 'Salvar alterações' : 'Publicar post' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import SideBar from '@/components/SideBar.vue'
import api from '@/services/api'
import { Ckeditor } from '@ckeditor/ckeditor5-vue'
import ClassicEditor from '@ckeditor/ckeditor5-build-classic'

const editor = ClassicEditor
const editorConfig = {
  toolbar: [
    'heading',
    '|',
    'bold',
    'italic',
    'underline',
    'link',
    'bulletedList',
    'numberedList',
    '|',
    'outdent',
    'indent',
    '|',
    'blockQuote',
    'insertTable',
    'undo',
    'redo'
  ]
}

const onEditorReady = (instance) => {
  const editable = instance?.ui?.view?.editable?.element

  if (!editable) return

  editable.style.minHeight = '320px'
  editable.style.height = '320px'
  editable.style.borderRadius = '0 0 10px 10px'
}

const posts = ref([])
const categories = ref([])
const loading = ref(false)
const error = ref('')
const message = ref('')
const isEditing = ref(false)
const isModalOpen = ref(false)
const editingSlug = ref('')
const publishedCount = computed(() => posts.value.filter((post) => post.published !== false).length)

const form = ref({
  slug: '',
  title: '',
  description: '',
  category: '',
  date: '',
  readTime: '',
  tags: '',
  content: ''
})

const normalizeError = (err) =>
  err.response?.data?.message ||
  err.response?.data?.error ||
  err.message ||
  'Erro inesperado. Tente novamente.'

const loadCategories = async () => {
  try {
    const response = await api.get('/categories')
    categories.value = response.data
  } catch (err) {
    error.value = normalizeError(err)
  }
}

const loadPosts = async () => {
  loading.value = true
  error.value = ''

  try {
    const response = await api.get('/posts')
    posts.value = response.data
  } catch (err) {
    error.value = normalizeError(err)
  } finally {
    loading.value = false
  }
}

const resetForm = () => {
  form.value = {
    slug: '',
    title: '',
    description: '',
    category: '',
    date: '',
    readTime: '',
    tags: '',
    content: ''
  }
  isEditing.value = false
  editingSlug.value = ''
}

const openCreateModal = () => {
  resetForm()
  isModalOpen.value = true
}

const closeModal = () => {
  isModalOpen.value = false
  resetForm()
  error.value = ''
}

const getPostStatus = (post) => (post.published === false ? 'Rascunho' : 'Publicado')
const getPostStatusClass = (post) => (post.published === false ? 'draft' : 'published')

const submitPost = async () => {
  const payload = {
    slug: form.value.slug.trim(),
    title: form.value.title.trim(),
    description: form.value.description.trim(),
    category: form.value.category,
    date: form.value.date,
    readTime: form.value.readTime.trim(),
    tags: form.value.tags
      .split(',')
      .map((tag) => tag.trim())
      .filter(Boolean),
    content: form.value.content.trim()
  }

  if (!payload.slug || !payload.title || !payload.description || !payload.category || !payload.date || !payload.readTime || !payload.content || payload.tags.length === 0) {
    error.value = 'Preencha todos os campos obrigatórios do post.'
    return
  }

  try {
    error.value = ''
    message.value = ''

    if (isEditing.value) {
      await api.put(`/posts/${editingSlug.value}`, payload)
      message.value = 'Post atualizado com sucesso.'
    } else {
      await api.post('/posts', payload)
      message.value = 'Post publicado com sucesso.'
    }

    closeModal()
    await loadPosts()
  } catch (err) {
    error.value = normalizeError(err)
  }
}

const startEdit = (post) => {
  isEditing.value = true
  editingSlug.value = post.slug
  form.value = {
    slug: post.slug,
    title: post.title,
    description: post.description,
    category: post.category?.slug || post.category?.name || post.category || '',
    date: post.date,
    readTime: post.readTime,
    tags: Array.isArray(post.tags) ? post.tags.join(', ') : '',
    content: post.content
  }
  isModalOpen.value = true
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

const deletePost = async (slug) => {
  if (!slug) return

  const confirmed = window.confirm('Deseja realmente remover este post?')
  if (!confirmed) return

  try {
    error.value = ''
    message.value = ''

    await api.delete(`/posts/${slug}`)
    message.value = 'Post removido com sucesso.'
    await loadPosts()
  } catch (err) {
    error.value = normalizeError(err)
  }
}

onMounted(async () => {
  await loadCategories()
  await loadPosts()
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

.post-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.grid {
  display: grid;
  gap: 16px;
}

.two-columns {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.three-columns {
  grid-template-columns: repeat(3, minmax(0, 1fr));
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

.field input,
.field select,
.field textarea,
.ckeditor {
  width: 100%;
  border: 1px solid #d1d5db;
  border-radius: 10px;
  font-size: 1rem;
  font-family: inherit;
  box-sizing: border-box;
}

.field textarea {
  resize: vertical;
}

.ckeditor {
  display: block;
  overflow: hidden;
  background: #fff;
  min-height: 320px !important;
  height: 320px !important;
}

.ckeditor :deep(.ck-editor__editable) {
  min-height: 280px !important;
  height: 280px !important;
  border: 1px solid #d1d5db;
  border-radius: 0 0 10px 10px;
}

.ckeditor :deep(.ck-toolbar) {
  border: 1px solid #d1d5db;
  border-bottom: none;
  border-radius: 10px 10px 0 0;
  min-height: 44px;
}

.content-preview {
  margin: 0 0 14px;
  color: #374151;
  line-height: 1.7;
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  padding: 14px;
}

.content-preview img {
  max-width: 100%;
  height: auto;
}

.actions-row,
.item-actions {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.icon-button,
.primary-button,
.secondary-button,
.danger-button {
  border: none;
  border-radius: 10px;
  padding: 10px 16px;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.2s ease;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.icon-button:hover,
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

.edit-button {
  background: #e0f2fe;
  color: #075985;
}

.danger-button {
  background: #ef4444;
  color: #fff;
}

.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.55);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  z-index: 50;
}

.modal-panel {
  width: min(960px, 100%);
  max-height: 90vh;
  overflow: auto;
  background: #fff;
  border-radius: 18px;
  box-shadow: 0 30px 80px rgba(15, 23, 42, 0.22);
  padding: 22px;
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 18px;
}

.modal-header h3 {
  margin: 0;
  color: #111827;
  font-size: 1.4rem;
}

.close-button {
  width: 38px;
  height: 38px;
  border: 0;
  border-radius: 10px;
  background: #f1f5f9;
  color: #0f172a;
  cursor: pointer;
}

.modal-actions {
  justify-content: flex-end;
  margin-top: 8px;
}

.list-card {
  overflow: hidden;
}

.list-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 14px;
}

.list-header h2 {
  margin: 0 0 8px;
}

.list-header p {
  margin: 0;
  color: #64748b;
  font-size: 0.9rem;
}

.list-summary {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.summary-badge {
  background: #dbeafe;
  color: #1d4ed8;
  border-radius: 999px;
  padding: 6px 10px;
  font-size: 0.8rem;
  font-weight: 700;
}

.summary-badge.success {
  background: #dcfce7;
  color: #166534;
}

.posts-list {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.post-item {
  border: 1px solid #e5e7eb;
  border-radius: 14px;
  padding: 18px;
  background: #fafafa;
}

.post-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
  margin-bottom: 14px;
}

.post-header h3 {
  margin: 0 0 6px;
  color: #111827;
}

.post-slug {
  color: #64748b;
  font-size: 0.8rem;
}

.status-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 6px 10px;
  border-radius: 999px;
  font-size: 0.76rem;
  font-weight: 700;
}

.status-badge.published {
  background: #dcfce7;
  color: #166534;
}

.status-badge.draft {
  background: #fef3c7;
  color: #92400e;
}

.post-meta-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
  margin-bottom: 16px;
}

.meta-label {
  display: block;
  color: #64748b;
  font-size: 0.75rem;
  margin-bottom: 4px;
}

.post-meta-grid strong {
  color: #111827;
  font-size: 0.92rem;
}

.description {
  color: #475569;
  line-height: 1.6;
  margin: 0 0 14px;
}

.tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 14px;
}

.tag {
  background: #e0f2fe;
  color: #075985;
  border-radius: 999px;
  padding: 5px 10px;
  font-size: 0.75rem;
  font-weight: 600;
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

@media (max-width: 992px) {
  .two-columns,
  .three-columns,
  .post-meta-grid {
    grid-template-columns: 1fr;
  }

  .list-header {
    flex-direction: column;
    align-items: flex-start;
  }
}

@media (max-width: 768px) {
  .layout {
    flex-direction: column;
  }

  .main {
    padding: 20px 16px;
  }

  .post-header {
    flex-direction: column;
  }

  .post-meta-grid {
    grid-template-columns: 1fr;
  }
}
</style>
