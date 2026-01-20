# GymTracker

Webapp fullstack para gerenciamento de treinos de academia com React + NestJS.

## 🏋️ Funcionalidades

- **Autenticação**: Login e registro com email/senha (JWT)
- **Gerenciamento de Treinos**: Criar, editar, ativar/desativar e excluir treinos
- **Exercícios**: Cada treino pode ter N exercícios com séries, repetições e peso
- **Geração com IA**: Gere treinos automaticamente usando a API da OpenAI
- **Tracker de Treinos**: Registre quais dias você treinou e qual treino fez
- **Calendário**: Visualização mensal com estatísticas (sequência, média semanal, etc.)
- **PWA**: Funciona como app nativo no celular (Add to Home Screen)

## 🛠️ Tecnologias

### Backend
- NestJS
- TypeORM
- PostgreSQL
- JWT Authentication
- OpenAI API

### Frontend
- React 18 + TypeScript
- Vite
- Tailwind CSS
- React Router v6
- Axios
- PWA (vite-plugin-pwa)
- Lucide Icons

## 🚀 Como Rodar

### Pré-requisitos
- Node.js 18+
- Docker e Docker Compose
- (Opcional) Chave da API OpenAI para geração de treinos com IA

### 1. Iniciar o Banco de Dados

```bash
docker-compose up -d
```

### 2. Configurar o Backend

```bash
cd backend

# Instalar dependências
npm install

# Criar arquivo .env (copie de .env.example)
# Configure as variáveis:
# - DATABASE_* (já configurado para o docker-compose)
# - JWT_SECRET (defina uma chave segura)
# - OPENAI_API_KEY (opcional, para geração com IA)

# Iniciar em modo desenvolvimento
npm run start:dev
```

O backend estará rodando em `http://localhost:3000`

### 3. Configurar o Frontend

```bash
cd frontend

# Instalar dependências
npm install

# Iniciar em modo desenvolvimento
npm run dev
```

O frontend estará rodando em `http://localhost:5173`

## 📱 PWA - Instalação no Celular

1. Acesse o app pelo navegador do celular
2. No Chrome/Safari, clique em "Adicionar à tela inicial"
3. O app funcionará como um app nativo

## 🔑 API Endpoints

### Auth
- `POST /api/auth/register` - Registro de usuário
- `POST /api/auth/login` - Login

### Workouts
- `GET /api/workouts` - Listar treinos
- `POST /api/workouts` - Criar treino
- `GET /api/workouts/:id` - Detalhes do treino
- `PATCH /api/workouts/:id` - Editar treino
- `PATCH /api/workouts/:id/toggle` - Ativar/desativar
- `DELETE /api/workouts/:id` - Excluir (soft delete)

### Tracker
- `POST /api/tracker/log` - Registrar treino do dia
- `GET /api/tracker/calendar/:year/:month` - Logs do mês
- `GET /api/tracker/stats` - Estatísticas

### AI
- `POST /api/ai/generate-workout` - Gerar treino com IA

## 📁 Estrutura do Projeto

```
GymTracker/
├── backend/
│   └── src/
│       ├── auth/           # Autenticação JWT
│       ├── users/          # Usuários
│       ├── workouts/       # Treinos
│       ├── exercises/      # Exercícios
│       ├── tracker/        # Logs e estatísticas
│       ├── ai/             # Integração OpenAI
│       └── common/         # Guards, decorators
├── frontend/
│   └── src/
│       ├── components/     # Componentes React
│       ├── pages/          # Páginas
│       ├── context/        # Auth Context
│       ├── services/       # API client
│       └── types/          # TypeScript types
└── docker-compose.yml      # PostgreSQL
```

## 🎨 Design

O app foi desenvolvido com foco em mobile-first e aparência nativa:
- Tema escuro moderno
- Navegação inferior (bottom tab bar)
- Animações suaves
- Safe area insets para notch/home indicator
- Cards com bordas arredondadas e sombras

## 📄 Licença

MIT


