# CRM Agro - Sistema de Gestão de Leads Inteligente

Sistema de gerenciamento de leads para distribuidores de fertilizantes, desenvolvido com NestJS (backend) e Angular (frontend).

**Diferencial:** CRM com **inteligência comercial agronômica** - vai além do CRUD genérico e entende o negócio agrícola.

## ✨ Features Inovadoras

### 🌾 Módulo de Propriedades (Property-Driven CRM)

**Transformamos área produtiva em inteligência comercial:**

1. **Lead Score Agronômico** - Score baseado em `área × peso_da_cultura`
2. **Agrupamento por Cultura** - Mix automático: Soja 70%, Milho 20%, Algodão 10%
3. **Potencial de Expansão** - Detecta produtores em crescimento
4. **Hotspots Geográficos** - Identifica regiões estratégicas
5. **Mix de Culturas** - Percentual de cada cultura
6. **Validação de Qualidade** - Alertas automáticos de inconsistências
7. **Checklist de Conversão** - Sugestões práticas para vendedor
8. **Timeline Agrícola** - Timing ideal de contato (plantio/adubação/colheita)
9. **Alertas para Vendedores** - Notificações inteligentes

📚 **Documentação Completa:**

- [Features Detalhadas](./docs/PROPERTIES_FEATURES.md)
- [Exemplos de Uso](./docs/PROPERTIES_USAGE_EXAMPLES.md)
- [Quick Start](./docs/PROPERTIES_QUICKSTART.md)

---

## 🚀 Tecnologias

### Backend

- **NestJS** - Framework Node.js
- **TypeORM** - ORM para PostgreSQL
- **PostgreSQL** - Banco de dados
- **Class Validator** - Validação de dados
- **Jest** - Testes unitários e e2e

### Frontend

- **Angular 19** - Framework frontend
- **PrimeNG** - Biblioteca de componentes UI
- **RxJS** - Programação reativa

## 📋 Pré-requisitos

- Node.js (v18 ou superior)
- npm ou yarn
- Docker e Docker Compose (para rodar o banco de dados)

## 🔧 Instalação

### 1. Clone o repositório e instale as dependências

```bash
# Instalar dependências do monorepo
npm install
```

### 2. Configure as variáveis de ambiente

O arquivo `.env.example` já está configurado na raiz do projeto. Para uso em desenvolvimento, crie um arquivo `.env`:

```bash
cp .env.example .env
```

Conteúdo do `.env`:

```env
# Database
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USER=crm_user
DATABASE_PASSWORD=crm_pass
DATABASE_NAME=crm_agro

# API
PORT=3000
NODE_ENV=development
```

### 3. Inicie o banco de dados

```bash
# Sobe o PostgreSQL via Docker
docker-compose up -d postgres
```

Verifique se o banco está rodando:

```bash
docker ps
```

### 4. Inicie o backend

```bash
# Via workspace
npm run dev:backend

# Ou diretamente na pasta backend
cd backend
npm run start:dev
```

O backend estará disponível em: `http://localhost:3000`

### 5. Inicie o frontend

```bash
# Em outro terminal
npm run dev:frontend

# Ou diretamente na pasta frontend
cd frontend
npm start
```

O frontend estará disponível em: `http://localhost:4200`

## 📚 API Endpoints

### Properties (Propriedades Rurais) ⭐

| Método | Endpoint                               | Descrição                              |
| ------ | -------------------------------------- | -------------------------------------- |
| POST   | `/properties`                          | Criar propriedade                      |
| GET    | `/properties`                          | Listar com filtros e paginação         |
| GET    | `/properties/:id`                      | Buscar uma propriedade                 |
| PATCH  | `/properties/:id`                      | Atualizar propriedade                  |
| DELETE | `/properties/:id`                      | Remover propriedade                    |
| GET    | `/properties/lead/:leadId/insights` ⭐ | **Insights completos do lead**         |
| GET    | `/properties/analytics/hotspots` ⭐    | **Distribuição geográfica (hotspots)** |

#### Exemplo: Criar Propriedade

```json
{
  "leadId": "uuid",
  "crop": "soja",
  "areaHectares": 250.5,
  "city": "Uberlândia",
  "state": "MG"
}
```

#### Culturas disponíveis:

- `soja` - Peso 1.0 (baseline)
- `milho` - Peso 0.7 (menor consumo)
- `algodao` - Peso 1.3 (maior consumo de insumos)

#### Exemplo: Insights Completos ⭐

```bash
GET /properties/lead/:leadId/insights
```

Retorna:

```json
{
  "totalProperties": 3,
  "totalArea": 400,
  "totalAgronomicScore": 435,
  "isPriority": true,
  "cropMix": [{ "crop": "soja", "totalArea": 250, "percentage": 62.5 }],
  "mainCrop": "soja",
  "actionSuggestions": [
    "Oferecer plano premium para grandes produtores (200+ ha)",
    "Algodão: alta demanda de insumos — campanha prioritária de NPK"
  ],
  "cropSeasonInsight": "soja: período de plantio",
  "expansionPotential": true,
  "cities": ["Uberlândia"]
}
```

### Leads

| Método | Endpoint              | Descrição                       |
| ------ | --------------------- | ------------------------------- |
| GET    | `/leads`              | Lista leads com filtros         |
| GET    | `/leads/:id`          | Busca lead por ID               |
| GET    | `/leads/prioritarios` | Lista prioritários (> 100 ha)   |
| POST   | `/leads`              | Cria novo lead                  |
| PATCH  | `/leads/:id`          | Atualiza lead                   |
| DELETE | `/leads/:id`          | Remove lead                     |
| PATCH  | `/leads/:id/status`   | Atualiza status                 |
| POST   | `/leads/:id/comments` | Adiciona comentário (histórico) |
| GET    | `/leads/:id/comments` | Lista comentários (paginado)    |

#### Exemplo: Criar Lead

```json
{
  "name": "João Silva",
  "email": "joao@example.com",
  "cpf": "123.456.789-00",
  "phone": "(31) 99999-9999",
  "city": "Uberlândia",
  "state": "MG",
  "status": "novo",
  "origin": "feira"
}
```

**⚠️ IMPORTANTE:** Campos `totalAreaHectares`, `mainCrops` e `isPrioritario` são **calculados automaticamente** com base nas propriedades.

Para definir área e culturas:

1. Crie o lead (sem área)
2. Adicione propriedades via `POST /properties`
3. Campos serão atualizados automaticamente

**Campos calculados automaticamente:**

- `totalAreaHectares` - Soma de todas as propriedades (read-only)
- `mainCrops` - Array de culturas únicas (read-only)
- `isPrioritario` - true se área total > 100 ha (read-only)
- `priorityScore` - Score calculado com base em área, cultura, origem e status
- `segment` - Pequeno (< 50 ha), Médio (50-100 ha), Grande (> 100 ha)

📚 **Leia mais:** [Single Source of Truth](./docs/REFACTORING_SINGLE_SOURCE_OF_TRUTH.md)

### Status disponíveis:

- `novo`
- `contatado`
- `qualificado`
- `proposta`
- `negociacao`
- `ganho`
- `perdido`

## 🧪 Testes

### Backend

```bash
# Testes unitários
cd backend
npm test

# Testes com coverage
npm run test:cov

# Testes e2e
npm run test:e2e

# Watch mode
npm run test:watch
```

## 🐳 Docker

### Comandos úteis do Docker Compose

```bash
# Subir todos os serviços
docker-compose up -d

# Ver logs
docker-compose logs -f

# Parar serviços
docker-compose down

# Parar e remover volumes (apaga dados do banco)
docker-compose down -v
```

## 📁 Estrutura do Projeto

```
crm-agro/
├── backend/
│   ├── src/
│   │   ├── leads/
│   │   │   ├── dto/
│   │   │   │   ├── create-lead.dto.ts
│   │   │   │   ├── update-lead.dto.ts
│   │   │   │   ├── filter-leads.dto.ts
│   │   │   │   ├── lead-summary.dto.ts
│   │   │   │   ├── update-lead-status.dto.ts
│   │   │   │   └── create-lead-comment.dto.ts
│   │   │   ├── lead.entity.ts
│   │   │   ├── lead-comment.entity.ts
│   │   │   ├── leads.controller.ts
│   │   │   ├── leads.service.ts
│   │   │   ├── leads.service.spec.ts
│   │   │   └── leads.module.ts
│   │   ├── properties/                     ⭐ NOVO
│   │   │   ├── dto/
│   │   │   │   ├── create-property.dto.ts
│   │   │   │   ├── update-property.dto.ts
│   │   │   │   ├── filter-properties.dto.ts
│   │   │   │   └── property-summary.dto.ts
│   │   │   ├── property.entity.ts
│   │   │   ├── property.enums.ts
│   │   │   ├── properties.controller.ts
│   │   │   ├── properties.service.ts
│   │   │   ├── properties.service.spec.ts
│   │   │   └── properties.module.ts
│   │   ├── common/
│   │   │   ├── dto/
│   │   │   │   └── pagination.dto.ts
│   │   │   ├── filters/
│   │   │   │   ├── http-exception.filter.ts
│   │   │   │   └── all-exceptions.filter.ts
│   │   │   └── interceptors/
│   │   │       └── transform.interceptor.ts
│   │   ├── app.module.ts
│   │   └── main.ts
│   └── test/
├── frontend/
│   └── src/
├── docs/                                    ⭐ DOCUMENTAÇÃO
│   ├── PROPERTIES_FEATURES.md              - 9 features inovadoras
│   ├── PROPERTIES_USAGE_EXAMPLES.md        - Cenários de uso
│   ├── PROPERTIES_IMPLEMENTATION.md        - Detalhes técnicos
│   ├── PROPERTIES_QUICKSTART.md            - Guia rápido
│   ├── EXCEPTION_HANDLING.md
│   ├── ARCHITECTURE_CONTEXT.md
│   └── IMPLEMENTATION_SUMMARY.md
├── docker-compose.yml
├── .env.example
├── .env
└── package.json
```

## 🔍 Validações

O sistema implementa validações robustas:

- **Email único**: Não permite emails duplicados
- **Campos obrigatórios**: Nome e email são obrigatórios
- **Estado**: Deve ter exatamente 2 caracteres em maiúsculas (ex: MG)
- **Telefone**: Validação com regex (10 ou 11 dígitos numéricos)
- **Status**: Apenas valores enum válidos
- **UUID**: Validação automática de IDs nos endpoints

## 🛡️ Tratamento de Exceções

A API segue os padrões REST para tratamento de erros:

### Códigos HTTP

| Código | Descrição             | Quando ocorre                         |
| ------ | --------------------- | ------------------------------------- |
| 200    | OK                    | Operação bem-sucedida (GET, PATCH)    |
| 201    | Created               | Recurso criado com sucesso (POST)     |
| 204    | No Content            | Recurso removido com sucesso (DELETE) |
| 400    | Bad Request           | Dados inválidos ou ID malformado      |
| 404    | Not Found             | Lead não encontrado                   |
| 409    | Conflict              | Email já cadastrado                   |
| 500    | Internal Server Error | Erro interno do servidor              |

### Formato de Erro Padronizado

```json
{
  "statusCode": 404,
  "timestamp": "2025-11-18T10:30:00.000Z",
  "path": "/leads/123",
  "method": "GET",
  "message": "Lead com ID '123' não foi encontrado no sistema",
  "error": "Not Found"
}
```

### Exemplos de Erros

**Validação (400):**

```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "errors": [
    {
      "field": "email",
      "errors": ["Email inválido. Use o formato: exemplo@email.com"]
    }
  ]
}
```

**Email Duplicado (409):**

```json
{
  "statusCode": 409,
  "message": "O email joao@example.com já está cadastrado no sistema",
  "error": "Conflict"
}
```

📚 **Documentação completa:** [EXCEPTION_HANDLING.md](./docs/EXCEPTION_HANDLING.md)

## 📝 Logs

O sistema implementa logging estruturado:

- **INFO**: Operações bem-sucedidas
- **WARN**: Tentativas suspeitas (ex: email duplicado)
- **ERROR**: Erros reais com stack trace

Exemplo:

```
[LeadsService] Lead criado com sucesso: 123e4567-e89b-12d3-a456-426614174000
[LeadsService] Tentativa de criar lead com email duplicado: joao@example.com
[HttpExceptionFilter] POST /leads - Status: 409 - Message: Email já cadastrado
```

## 📚 Documentação Adicional

### Módulo de Propriedades ⭐

- [Features Inovadoras](./docs/PROPERTIES_FEATURES.md) - 9 features de inteligência comercial
- [Exemplos de Uso](./docs/PROPERTIES_USAGE_EXAMPLES.md) - Cenário completo com João Silva
- [Implementação Técnica](./docs/PROPERTIES_IMPLEMENTATION.md) - Detalhes de código
- [Quick Start](./docs/PROPERTIES_QUICKSTART.md) - Teste em 5 minutos

### Arquitetura e Padrões

- [Arquitetura do Projeto](./docs/ARCHITECTURE_CONTEXT.md)
- [Tratamento de Exceções](./docs/EXCEPTION_HANDLING.md)
- [Resumo da Implementação](./docs/IMPLEMENTATION_SUMMARY.md)

---

## 🎯 Diferenciais do Projeto

### 1. **Visão de Negócio Agro**

Não é um CRUD genérico. O sistema entende que:

- Algodão ≠ Soja ≠ Milho (pesos diferentes)
- Cada cultura tem ciclo específico
- Área grande ≠ alto potencial (depende da cultura)

### 2. **Inteligência sem IA**

Sugestões automáticas baseadas em regras:

- "Oferecer plano premium para 200+ ha"
- "Algodão: campanha prioritária de NPK"
- "Período de adubação — momento ideal para contato"

### 3. **Estratégia Regional**

Hotspots geográficos para planejamento:

- Uberlândia: 14 propriedades
- Patos de Minas: 9 propriedades
- **Ação:** Concentrar esforços em Uberlândia

### 4. **Qualidade de Dados**

Alertas automáticos:

- Área < 1 ha → revisar
- Sem localização → completar
- Possível duplicata → investigar

### 5. **Timing Comercial**

Timeline agrícola por cultura:

- Soja: plantio (out-dez), adubação (jan-fev)
- Milho: plantio (set-nov), adubação (nov-jan)
- **Resultado:** Contato no momento certo

---

## 🚧 Status do Projeto

### ✅ Concluído

- [x] Módulo de Leads completo (CRUD + validações + testes)
- [x] Módulo de Properties com 9 features inovadoras
- [x] Sistema de comentários (histórico de interações)
- [x] Paginação em todos os endpoints de listagem
- [x] Exception handling robusto (REST patterns)
- [x] Logging estruturado
- [x] Testes unitários (9/9 passing)
- [x] Validações com class-validator
- [x] Documentação completa (4 arquivos de docs)

### 🚧 Em Desenvolvimento

- [ ] Dashboard com métricas e gráficos
- [ ] Frontend Angular
- [ ] Swagger/OpenAPI documentation
- [ ] Autenticação JWT

### 📋 Backlog

- [ ] Seeds para dados de desenvolvimento
- [ ] CI/CD pipeline
- [ ] Integração com mapas (geometry field)
- [ ] Relatórios PDF
- [ ] Notificações em tempo real

---

## 📝 Licença

Este projeto faz parte de um teste técnico.

---

**Desenvolvido para o teste técnico CRM Agro**
