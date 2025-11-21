# CRM Agro

Sistema de CRM especializado para o agronegócio, com gestão inteligente de leads, propriedades rurais e sistema de priorização baseado em área cultivada.

## 🚀 Tecnologias

### Backend
- **NestJS** - Framework Node.js
- **TypeScript** - Linguagem
- **PostgreSQL** - Banco de dados
- **TypeORM** - ORM
- **Swagger** - Documentação da API

### Frontend
- **Angular 18** - Framework
- **PrimeNG** - Biblioteca de componentes UI
- **TypeScript** - Linguagem
- **SCSS** - Estilização

## 📋 Pré-requisitos

- Node.js 18+ 
- Docker e Docker Compose
- Git

## 🐳 Instalação e Execução com Docker

### 1. Clone o repositório

```bash
git clone https://github.com/fcsar/crm-agro.git
cd crm-agro
```

### 2. Inicie os containers

```bash
docker-compose up -d
```

Isso irá iniciar:
- **PostgreSQL** na porta `5432`
- **Backend (NestJS)** na porta `3000`

### 3. Acesse a aplicação

- **API Backend**: http://localhost:3000
- **Swagger Docs**: http://localhost:3000/api/docs

## 💻 Execução Local (Sem Docker)

### Backend

```bash
cd backend
npm install
cp .env.example .env
npm run start:dev
```

### Frontend

```bash
cd frontend
npm install
npm start
```

Acesse: http://localhost:4200

## 🗄️ Banco de Dados

O PostgreSQL é iniciado automaticamente via Docker. As migrations são executadas na primeira inicialização.

### Configuração manual do banco

```bash
cd backend
npm run typeorm migration:run
npm run typeorm migration:revert
```

## 📚 Funcionalidades

### Dashboard
- Visão geral de métricas de leads
- Gráficos de status, origem e segmentação
- Distribuição geográfica
- Funil de conversão

### Gestão de Leads
- Cadastro completo de leads
- Sistema de priorização inteligente baseado em:
  - Área total de cultivo (> 100ha = VIP)
  - Origem do lead (indicação, feira)
  - Status no funil de vendas
- Filtros avançados
- Atualização de status em tempo real
- Busca por nome, email ou CPF

### Propriedades Rurais
- Cadastro de propriedades por lead
- Culturas: Soja, Milho, Algodão
- Cálculo automático de:
  - Área total do lead
  - Culturas principais
  - Score de prioridade
  - Classificação VIP (> 100ha)

### Cadastro Multi-Step
- **Passo 1**: Dados do lead
- **Passo 2**: Adicionar propriedades (opcional)
- Cálculo de score em tempo real
- Visualização de impacto das propriedades

## 🎯 Sistema de Priorização

O score de prioridade é calculado automaticamente:

| Critério | Pontos |
|----------|--------|
| Área > 100ha | +50 |
| Área 50-100ha | +30 |
| Área > 0ha | +10 |
| Origem: Indicação | +20 |
| Origem: Feira | +15 |
| Status: Negociação | +20 |
| Status: Proposta | +15 |
| Status: Qualificado | +10 |
| Sem vendedor | +5 |

**Lead VIP**: Área total > 100 hectares

## 🔧 Scripts Disponíveis

### Backend

```bash
npm run start:dev      # Desenvolvimento com hot-reload
npm run start:prod     # Produção
npm run build          # Build
npm run test           # Testes unitários
npm run test:e2e       # Testes E2E
npm run lint           # Linter
npm run format         # Formatar código
```

### Frontend

```bash
npm start              # Desenvolvimento (porta 4200)
npm run build          # Build produção
npm run build:ssr      # Build com SSR
npm run test           # Testes unitários
npm run lint           # Linter
```

## 📁 Estrutura do Projeto

```
crm-agro/
├── backend/
│   ├── src/
│   │   ├── leads/           # Módulo de leads
│   │   ├── properties/      # Módulo de propriedades
│   │   ├── dashboard/       # Módulo de dashboard
│   │   ├── common/          # Utilitários compartilhados
│   │   └── main.ts          # Entry point
│   ├── test/                # Testes
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── core/        # Services, guards, interceptors
│   │   │   ├── features/    # Módulos de funcionalidades
│   │   │   ├── shared/      # Componentes compartilhados
│   │   │   └── environments/
│   │   └── index.html
│   └── package.json
│
├── docker-compose.yml
└── README.md
```

## 🌐 Variáveis de Ambiente

### Backend (.env)

```env
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USER=postgres
DATABASE_PASSWORD=postgres
DATABASE_NAME=crm_agro
PORT=3000
NODE_ENV=development
```

### Frontend (environment.ts)

```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000',
};
```

## 🧪 Testes

```bash
# Backend
cd backend
npm run test        # Unit tests
npm run test:e2e    # E2E tests
npm run test:cov    # Coverage

# Frontend
cd frontend
npm run test        # Unit tests com Karma
```

## 📝 API Documentation

Após iniciar o backend, acesse a documentação Swagger:

**http://localhost:3000/api/docs**

Principais endpoints:

- `GET /leads` - Listar leads
- `POST /leads` - Criar lead
- `PATCH /leads/:id/status` - Atualizar status
- `GET /properties` - Listar propriedades
- `POST /properties` - Criar propriedade
- `GET /dashboard/overview` - Métricas do dashboard

## 🤝 Contribuindo

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feat/nova-feature`)
3. Commit suas mudanças (`git commit -m 'feat: adiciona nova feature'`)
4. Push para a branch (`git push origin feat/nova-feature`)
5. Abra um Pull Request

### Conventional Commits

Este projeto segue o padrão de [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` Nova funcionalidade
- `fix:` Correção de bug
- `docs:` Documentação
- `style:` Formatação de código
- `refactor:` Refatoração
- `test:` Testes
- `chore:` Tarefas de build/config

## 📄 Licença

MIT

## 👨‍💻 Autor

Francisco Cesar - [GitHub](https://github.com/fcsar)

## 🔥 Features Principais

- ✅ Sistema de priorização inteligente
- ✅ Cálculo automático de score
- ✅ Gestão de propriedades rurais
- ✅ Multi-step forms
- ✅ Filtros avançados
- ✅ Dashboard com métricas
- ✅ Atualização em tempo real
- ✅ Responsivo (mobile-first)
- ✅ Dark mode
- ✅ Validações robustas
- ✅ Error handling com Toast
- ✅ Documentação Swagger
