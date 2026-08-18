<template>
  <main class="login-page">
    <div class="login-card">
      <div class="brand">
        <div class="brand-mark">
          W
        </div>

        <div>
          <span class="brand-name">CodeWil</span>
          <span class="brand-label">Admin</span>
        </div>
      </div>

      <div class="login-header">
        <h1>Bem-vindo de volta.</h1>
        <p>Entre para gerenciar os posts do seu blog.</p>
      </div>

      <form @submit.prevent="handleLogin">
        <div class="form-group">
          <label for="email">E-mail</label>

          <input
            id="email"
            v-model="email"
            type="email"
            placeholder="seu@email.com"
            autocomplete="email"
            required
          />
        </div>

        <div class="form-group">
          <div class="password-label">
            <label for="password">Senha</label>

            <button
              type="button"
              class="forgot-password"
              @click="handleForgotPassword"
            >
              Esqueci minha senha
            </button>
          </div>

          <input
            id="password"
            v-model="password"
            type="password"
            placeholder="••••••••"
            autocomplete="current-password"
            required
          />
        </div>

        <p v-if="error" class="form-error">{{ error }}</p>

        <button class="login-button" type="submit">
          Entrar
          <i class="bi bi-arrow-right"></i>
        </button>
      </form>

      <div class="login-footer">
        <span>Área administrativa</span>
        <span class="dot"></span>
        <span>CodeWil Blog</span>
      </div>
    </div>
  </main>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import api from '@/services/api'

const email = ref('')
const password = ref('')
const error = ref('')
const loading = ref(false)
const success = ref('')
const user = ref(null)
const router = useRouter()

const handleForgotPassword = () => {
  error.value = 'Recuperação de senha não implementada.'
}

const handleLogin = async () => {
  error.value = ''
  success.value = ''
  loading.value = true

  try {
    const response = await api.post('/login', {
      email: email.value,
      password: password.value
    })

    const data = response?.data || {}
    const sessionUser = data.user || { email: email.value }

    user.value = sessionUser

    localStorage.setItem('user', JSON.stringify({
      ...sessionUser,
      ...(data.token ? { token: data.token } : {})
    }))

    if (data.token) {
      localStorage.setItem('token', data.token)
    }

    success.value = 'Autenticado com sucesso.'
    router.push({ name: 'home' })
  } catch (e) {
    error.value = e.response?.data?.message || e.response?.data?.error || e.message || 'Erro ao autenticar.'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;

  background:
    radial-gradient(
      circle at top left,
      rgba(59, 130, 246, 0.08),
      transparent 35%
    ),
    #f8fafc;

  font-family:
    Inter,
    -apple-system,
    BlinkMacSystemFont,
    "Segoe UI",
    sans-serif;
}

.login-card {
  width: 100%;
  max-width: 420px;
  padding: 42px;

  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 20px;

  box-shadow:
    0 20px 50px rgba(15, 23, 42, 0.08);
}

/* BRAND */

.brand {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 42px;
}

.brand-mark {
  width: 42px;
  height: 42px;

  display: flex;
  align-items: center;
  justify-content: center;

  border-radius: 12px;

  background: #111827;
  color: #ffffff;

  font-size: 18px;
  font-weight: 700;
}

.brand-name {
  display: block;

  color: #111827;

  font-size: 16px;
  font-weight: 700;
  line-height: 1.1;
}

.brand-label {
  display: block;

  margin-top: 3px;

  color: #94a3b8;

  font-size: 11px;
  font-weight: 500;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

/* HEADER */

.login-header {
  margin-bottom: 30px;
}

.login-header h1 {
  margin: 0 0 8px;

  color: #111827;

  font-size: 28px;
  font-weight: 700;
  letter-spacing: -0.03em;
}

.login-header p {
  margin: 0;

  color: #64748b;

  font-size: 14px;
  line-height: 1.6;
}

/* FORM */

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;

  margin-bottom: 8px;

  color: #334155;

  font-size: 13px;
  font-weight: 600;
}

.password-label {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.password-label label {
  margin-bottom: 8px;
}

.forgot-password {
  padding: 0;
  border: 0;
  background: transparent;

  color: #2563eb;

  font-size: 12px;
  font-weight: 500;

  cursor: pointer;
}

.forgot-password:hover {
  text-decoration: underline;
}

input {
  width: 100%;
  height: 48px;

  box-sizing: border-box;

  padding: 0 14px;

  border: 1px solid #dbe1e8;
  border-radius: 10px;

  background: #ffffff;

  color: #111827;

  font-family: inherit;
  font-size: 14px;

  outline: none;

  transition:
    border-color 0.2s ease,
    box-shadow 0.2s ease;
}

input::placeholder {
  color: #a1aab8;
}

input:focus {
  border-color: #2563eb;

  box-shadow:
    0 0 0 3px rgba(37, 99, 235, 0.1);
}

/* BUTTON */

.login-button {
  width: 100%;
  height: 48px;

  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;

  margin-top: 8px;

  border: 0;
  border-radius: 10px;

  background: #111827;
  color: #ffffff;

  font-family: inherit;
  font-size: 14px;
  font-weight: 600;

  cursor: pointer;

  transition:
    transform 0.2s ease,
    background 0.2s ease,
    box-shadow 0.2s ease;
}

.login-button:hover {
  background: #1f2937;

  box-shadow:
    0 8px 20px rgba(15, 23, 42, 0.15);

  transform: translateY(-1px);
}

.login-button:active {
  transform: translateY(0);
}

.login-button i {
  font-size: 15px;
}

/* FOOTER */

.login-footer {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;

  margin-top: 30px;

  color: #94a3b8;

  font-size: 11px;
}

.dot {
  width: 3px;
  height: 3px;

  border-radius: 50%;

  background: #cbd5e1;
}

/* MOBILE */

@media (max-width: 480px) {
  .login-page {
    padding: 16px;
  }

  .login-card {
    padding: 30px 24px;
    border-radius: 16px;
  }

  .brand {
    margin-bottom: 34px;
  }

  .login-header h1 {
    font-size: 25px;
  }
}
</style>