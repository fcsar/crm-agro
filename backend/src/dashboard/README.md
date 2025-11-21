# Dashboard Module

## 📊 Objetivo

O **DashboardModule** fornece **visão analítica consolidada** do negócio, respondendo perguntas de gestão sobre a base de leads.

**Princípio fundamental:** Este módulo é **100% read-only** (somente leitura). Ele NÃO cria, atualiza ou deleta dados. Apenas agrega e apresenta o estado atual do sistema.

---

## 🎯 Perguntas que o Dashboard Responde

1. ✅ **Quantos leads eu tenho na base?**
2. ✅ **Como estão distribuídos por status (funil de vendas)?**
3. ✅ **Quais são as principais cidades/estados?**
4. ✅ **Quantos leads são prioritários (área > 100 ha)?**
5. ✅ **Qual é a área total associada aos leads?**
6. ✅ **Qual minha taxa de conversão?**
7. ✅ **Qual o score médio de prioridade?**
8. ✅ **Como está distribuído por origem (feira, indicação, site)?**
9. ✅ **Como está distribuído por segmento (pequeno/médio/grande)?**

---

## 🏗️ Arquitetura

### Estrutura de Arquivos

```
src/dashboard/
├── README.md                       ← Você está aqui
├── dashboard.module.ts             ← Módulo principal
├── dashboard.controller.ts         ← Endpoints REST
├── dashboard.service.ts            ← Lógica de agregação
└── dto/
    └── dashboard-overview.dto.ts   ← Contratos de resposta
```

### Responsabilidades

| Camada                  | Responsabilidade                                   |
| ----------------------- | -------------------------------------------------- |
| **DashboardService**    | Executa queries agregadas com TypeORM QueryBuilder |
| **DashboardController** | Expõe endpoints REST (/dashboard/overview)         |
| **DTOs**                | Define contratos de resposta                       |

---

## 📡 Endpoints

### 1. `GET /dashboard/overview`

**Descrição:** Retorna visão geral consolidada do negócio.

**Response:**

```json
{
  "totalLeads": 42,
  "prioritarios": 9,
  "totalAreaHectares": 5420.75,
  "averagePriorityScore": 127.5,
  "conversionRate": 16.67,
  "leadsByStatus": {
    "novo": 10,
    "contatado": 8,
    "qualificado": 6,
    "proposta": 5,
    "negociacao": 4,
    "ganho": 7,
    "perdido": 2
  },
  "leadsByCity": [
    { "city": "Uberlândia", "count": 15 },
    { "city": "Patos de Minas", "count": 9 },
    { "city": "Uberaba", "count": 5 }
  ],
  "leadsByState": [
    { "state": "MG", "count": 30 },
    { "state": "SP", "count": 12 }
  ],
  "leadsByOrigin": [
    { "origin": "feira", "count": 12 },
    { "origin": "indicacao", "count": 10 }
  ],
  "leadsBySegment": [
    { "segment": "grande", "count": 9 },
    { "segment": "medio", "count": 15 },
    { "segment": "pequeno", "count": 18 }
  ]
}
```

### 2. `GET /dashboard/funnel`

**Descrição:** Retorna funil de vendas com taxa de conversão entre etapas.

**Response:**

```json
{
  "funnel": [
    { "stage": "novo", "count": 10, "conversionRate": null },
    { "stage": "contatado", "count": 8, "conversionRate": 80.0 },
    { "stage": "qualificado", "count": 6, "conversionRate": 75.0 },
    { "stage": "proposta", "count": 5, "conversionRate": 83.33 },
    { "stage": "negociacao", "count": 4, "conversionRate": 80.0 },
    { "stage": "ganho", "count": 7, "conversionRate": 175.0 }
  ],
  "totalInFunnel": 40
}
```

---

## 🚀 Performance

### Queries Otimizadas com TypeORM QueryBuilder

O serviço usa **SQL agregado** em vez de buscar todas as entidades:

```typescript
// ❌ NÃO FAZER (lento, carrega tudo na memória)
const leads = await leadRepository.find();
const total = leads.length;
const prioritarios = leads.filter((l) => l.isPrioritario).length;

// ✅ FAZER (rápido, usa COUNT do banco)
const result = await leadRepository
  .createQueryBuilder('lead')
  .select('COUNT(*)', 'totalLeads')
  .addSelect(
    'COUNT(CASE WHEN lead.is_prioritario = true THEN 1 END)',
    'prioritarios',
  )
  .getRawOne();
```

### Queries Executadas

1. **Métricas gerais** - `COUNT`, `SUM`, `AVG` para totais e médias
2. **Distribuição por status** - `GROUP BY status`
3. **Top 10 cidades** - `GROUP BY city ORDER BY count DESC LIMIT 10`
4. **Distribuição por estado** - `GROUP BY state`
5. **Distribuição por origem** - `GROUP BY origin`
6. **Distribuição por segmento** - `GROUP BY segment`

**Total:** 6 queries SQL otimizadas (podem rodar em paralelo se necessário).

---

## 🎨 Uso no Frontend

### Exemplo com Angular + PrimeNG

```typescript
// dashboard.component.ts
export class DashboardComponent implements OnInit {
  overview: DashboardOverviewDto;

  constructor(private dashboardService: DashboardService) {}

  ngOnInit() {
    this.dashboardService.getOverview().subscribe(data => {
      this.overview = data;
      this.renderCharts();
    });
  }

  renderCharts() {
    // PrimeNG Chart para funil de vendas
    this.funnelChartData = {
      labels: Object.keys(this.overview.leadsByStatus),
      datasets: [{
        data: Object.values(this.overview.leadsByStatus),
        backgroundColor: ['#42A5F5', '#66BB6A', '#FFA726', ...]
      }]
    };
  }
}
```

### Componentes Sugeridos

| Métrica          | Componente PrimeNG     | Tipo de Visualização |
| ---------------- | ---------------------- | -------------------- |
| `totalLeads`     | `p-card`               | Card com número      |
| `prioritarios`   | `p-card` (destaque)    | Card amarelo/laranja |
| `leadsByStatus`  | `p-chart` (tipo: pie)  | Gráfico de pizza     |
| `leadsByCity`    | `p-table`              | Tabela ordenada      |
| `leadsByState`   | `p-chart` (tipo: bar)  | Gráfico de barras    |
| `conversionRate` | `p-progressBar`        | Barra de progresso   |
| `funnel`         | `p-chart` (tipo: line) | Gráfico de linha     |

---

## 🔧 Extensões Futuras

### 1. Filtros por Período

```typescript
@Get('overview')
async getOverview(@Query('startDate') startDate?: string) {
  // Filtrar leads criados após data X
}
```

### 2. Comparação com Período Anterior

```typescript
{
  "totalLeads": 42,
  "totalLeadsLastMonth": 38,
  "growth": "+10.5%"
}
```

### 3. Métricas de Propriedades

```typescript
{
  "totalAreaByCrop": {
    "soja": 3500,
    "milho": 1200,
    "algodao": 720
  }
}
```

### 4. Ranking de Vendedores

```typescript
{
  "topSellers": [
    { "assignedTo": "João Silva", "conversions": 12 },
    { "assignedTo": "Maria Santos", "conversions": 9 }
  ]
}
```

---

## ✅ Checklist de Requisitos do Case

| Requisito                                    | Status |
| -------------------------------------------- | ------ |
| ✅ Total de leads                            | ✅     |
| ✅ Leads por status (funil)                  | ✅     |
| ✅ Leads por município                       | ✅     |
| ✅ Indicador de leads prioritários (>100 ha) | ✅     |
| ✅ Queries otimizadas (QueryBuilder)         | ✅     |
| ✅ Documentação Swagger                      | ✅     |
| ✅ 100% read-only (analytics)                | ✅     |

---

## 📝 Princípios de Design

### 1. Single Responsibility

- Dashboard **não duplica regras de negócio**.
- Apenas lê o estado atual calculado por `LeadsService` e `PropertiesService`.

### 2. Read-Only Analytics

- Nenhum método de escrita (`create`, `update`, `delete`).
- Cache-friendly (todas as queries são determinísticas).

### 3. Performance First

- Usa SQL agregado em vez de processar em memória.
- Aproveita índices de `status`, `city`, `state`, `origin`, `segment`.

### 4. Separation of Concerns

- **LeadsModule** → Regras de negócio e CRUD.
- **PropertiesModule** → Gestão de propriedades.
- **DashboardModule** → Somente analytics e visualização.

---

## 🧪 Testando

```bash
# Inicie o servidor
npm run start:dev

# Teste o endpoint
curl http://localhost:3000/dashboard/overview

# Ou abra no Swagger
open http://localhost:3000/api/docs#/dashboard
```

---

## 📚 Referências

- [TypeORM QueryBuilder](https://typeorm.io/select-query-builder)
- [NestJS Documentation](https://docs.nestjs.com/)
- [PrimeNG Charts](https://primeng.org/chart)

---

**Desenvolvido com foco em performance, escalabilidade e experiência do usuário.**
