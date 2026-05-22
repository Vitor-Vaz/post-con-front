# PostoConfiável — Estratégia de Integração: Mapa ↔ Backend

Documento técnico que descreve as duas abordagens de integração entre o Google Maps (front-end) e a API `post-con-back`, suas vantagens, desvantagens e a estratégia de cache para controle de custos.

---

## Contexto

O mapa é a experiência central do PostoConfiável. O desafio é exibir postos de combustível no mapa de forma útil desde o primeiro acesso, mesmo que a base de dados interna ainda seja pequena.

A chave canônica que liga o Google Maps ao nosso banco de dados é o **`place_id`** (Google Places).

---

## Forma 1 — Back-first (Apenas postos cadastrados)

### Fluxo

```
Front → GET /api/v1/stations?lat=X&lng=Y&radius=Z
     → Back consulta tabela `stations` com query geoespacial
     → Retorna lista de postos cadastrados
     → Front plota marcadores com score colorido
```

### Prós
- **Simples e barato**: Zero custo com Google Places API neste fluxo
- **Dados ricos**: Score, reviews e contexto de veículo sempre presentes
- **Controle total** da experiência e dos dados exibidos

### Contras
- **Mapa vazio no início**: Sem postos cadastrados, o mapa não exibe nada
- **Experiência pobre pra novos usuários**: Sem massa crítica, o produto parece quebrado
- **Crescimento dependente de avaliações**: Usuários precisam avaliar postos antes de aparecerem no mapa

### Quando usar
Quando a base de dados já tiver volume suficiente de postos cadastrados para não parecer vazia. Pode ser a estratégia **principal após a tração inicial**.

---

## Forma 2 — Google-first + enriquecimento do Back ✅ (Estratégia Inicial Adotada)

### Fluxo

```
1. Mapa carrega (ou usuário para de mover)
   ↓
2. Front chama Google Places Nearby Search
   → type: "gas_station", coords do centro do mapa, raio configurável
   ↓
3. Google retorna N postos com: place_id, nome, coordenadas
   ↓
4. Front extrai lista de place_ids e faz uma única chamada ao back:
   → POST /api/v1/stations/batch { "place_ids": ["ChIJ...", ...] }
   ↓
5. Back retorna apenas os postos que já existem na tabela `stations`
   ↓
6. Front plota TODOS os marcadores do Google:
   → Posto COM dados no back → marcador colorido (verde/amarelo/vermelho por score)
   → Posto SEM dados no back → marcador neutro/cinza + tooltip "Seja o primeiro a avaliar!"
```

### Prós
- **Mapa sempre populado**: Todos os postos conhecidos pelo Google aparecem desde o Dia 1
- **Oportunidade de engajamento**: Postos sem reviews viram CTA para avaliação
- **Modelo de crescimento orgânico**: Conforme usuários avaliam, mais marcadores ficam coloridos
- **É o modelo de produto correto** para a fase de lançamento

### Contras
- **Custo do Nearby Search**: Tem custo (ver seção de cota abaixo)
- **Endpoint de batch necessário**: Requer `POST /api/v1/stations/batch` no back (a criar)
- **Complexidade maior no front**: Lógica de merge entre dados do Google e do back

### Endpoint de batch necessário no back

> ⚠️ O endpoint abaixo **ainda não existe** no `post-con-back` e precisa ser criado.

```
POST /api/v1/stations/batch
Body: { "place_ids": ["ChIJ123", "ChIJ456", "ChIJ789"] }
Response: [
  { "place_id": "ChIJ123", "score": 4.2, "reviews_count": 38, ... },
  // Apenas os que existem na tabela stations
]
```

Postos ausentes da resposta = sem reviews = marcador cinza no front.

---

## Cotas e Custos — Google Places Nearby Search

### Modelo de preço atual (vigente desde Março/2025)

O Google eliminou o crédito mensal de $200 e migrou para **cotas gratuitas por SKU**:

| Tier | Cota Gratuita Mensal |
|------|----------------------|
| **Essentials** | 10.000 calls/mês |
| **Pro** | 5.000 calls/mês |
| **Enterprise** | 1.000 calls/mês |

**Nearby Search está classificado no tier Pro → 5.000 calls gratuitas por mês.**

### Custo além da cota
- ~$32 por 1.000 requests (pay-as-you-go)
- Novos clientes: $300 de crédito de trial no Google Cloud

### Estimativa de consumo sem mitigação
- 1 usuário movendo o mapa livremente por 5 minutos ≈ 10-20 calls
- 100 usuários simultâneos = potencialmente milhares de calls/hora

### Conclusão sobre cota
**5.000 calls/mês são suficientes para o MVP e fase inicial**, mas precisam de cache para não serem desperdiçadas.

---

## Estratégia de Cache no Front-end

### É possível usar cache no front? Sim. Há duas abordagens:

#### 1. Cache por Bounding Box (Área Geográfica) — Recomendado

Em vez de disparar uma nova busca a cada pequeno movimento do mapa, a gente define **"células" geográficas** (ex.: grade de ~1km²). Se o centro do mapa ainda está dentro de uma célula já pesquisada, **não dispara nova request**.

```
Estratégia:
- Dividir o mundo em células de lat/lng arredondadas (ex: 2 casas decimais ≈ ~1km)
- Salvar no SessionStorage: { "key": "-23.55,-46.63", "data": [...], "timestamp": ... }
- Antes de chamar o Google, verificar se a célula atual já foi buscada
- TTL: 10 minutos (dados de postos não mudam com frequência)
```

#### 2. Cache por `place_id` das respostas do Back

Os dados do nosso back (scores, reviews_count) mudam com mais frequência, mas ainda assim podem ser cacheados por alguns minutos:

```
- Salvar no SessionStorage: { "place_id": "ChIJ...", "score": 4.2, "reviews_count": 38 }
- TTL: 5 minutos
- Invalida o cache quando o usuário submete uma nova review
```

### Diagrama de fluxo com cache

```
Usuário para de mover o mapa
  ↓
Calcular célula geográfica atual (arredondar coords)
  ↓
Célula está no SessionStorage e dentro do TTL?
  ├── SIM → Usar dados do cache → Plota marcadores (sem request)
  └── NÃO → Chamar Google Nearby Search
               ↓
             Salvar resultado no SessionStorage
               ↓
             Chamar /api/v1/stations/batch
               ↓
             Merge + plotar marcadores
```

### Ganho estimado com cache
- Usuário navegando por uma mesma área: **90%+ das requests eliminadas**
- 100 usuários navegando em São Paulo (mesma área): **uma única call ao Google por célula por 10min**

---

## Decisão: Forma 2 com cache de bounding box

| Critério | Decisão |
|---|---|
| Estratégia inicial | **Forma 2** (Google-first + enriquecimento do back) |
| Controle de custo | **Cache por célula geográfica no SessionStorage** |
| Endpoint necessário no back | `POST /api/v1/stations/batch` (a criar) |
| Trigger de busca | Evento `idle` do Google Maps com debounce de 800ms |
| TTL do cache | 10 min para dados do Google, 5 min para dados do back |
| Estratégia futura | Migrar para **Forma 1** como fonte primária quando base de dados tiver volume |

---

## Próximos Passos de Implementação

### Front-end (`post-con-front`)
- [ ] Implementar serviço `nearbySearchService.ts` com lógica de cache por célula
- [ ] Criar serviço `stationsService.ts` com chamada ao `POST /api/v1/stations/batch`
- [ ] Atualizar `GoogleMap.vue` para ouvir evento `idle` e disparar a busca
- [ ] Diferenciar visualmente marcadores com e sem dados (colorido vs. cinza)
- [ ] Adicionar tooltip/CTA "Seja o primeiro a avaliar!" nos postos sem reviews

### Back-end (`post-con-back`)
- [ ] Criar endpoint `POST /api/v1/stations/batch` que recebe lista de `place_ids`
- [ ] Retornar apenas os `place_ids` que existem na tabela `stations` com seus dados agregados
