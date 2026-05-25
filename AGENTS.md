# AGENTS.md — post-con-front (PostoConfiável)

Documento único para **assistentes de IA e desenvolvedores** alinharem comportamento neste repositório front-end. Complementa o plano de produto em `technical-plan/SAAS-POSTOS-COMBUSTIVEL-FRONT.md`. Atualize este arquivo ao fechar tarefas grandes ou decisões de design estáveis.

---

## Propósito

Interface Web (SPA) em **Vue 3 + TypeScript** do produto **PostoConfiável**: busca de postos, visualização no mapa, listagem de avaliações com contexto de combustível/veículo, e fluxo para avaliar postos de combustível no Brasil com base no **`place_id`** (Google Places).

---

## Quando usar este guia

Use como referência principal quando a tarefa envolver:

- Criação ou refatoração de componentes Vue 3 em `src/components/`
- Criação de novas views/páginas em `src/views/`
- Integração com a API de mapas do Google (Google Maps JavaScript API)
- Comunicação com a API backend (`post-con-back`) em `src/services/`
- Alterações no sistema de design ou folhas de estilo em `src/style.css`

---

## Stack

| Área                    | Escolha                                                                    |
| ----------------------- | -------------------------------------------------------------------------- |
| Core                    | **Vue 3** (Composition API com `<script setup>`)                           |
| Linguagem               | **TypeScript**                                                             |
| Bundler & Dev Server    | **Vite**                                                                   |
| Roteamento              | **Vue Router** (a ser instalado quando necessário)                         |
| Gerenciamento de Estado | **Pinia** (a ser instalado se houver necessidade de estado global)         |
| Estilização (CSS)       | **Vanilla CSS** (Foco em estética premium, CSS Variables e Modern Layouts) |
| Integração de Mapas     | **@googlemaps/js-api-loader** (Carregamento assíncrono e tipado)           |

---

## Estrutura de pastas (visão geral)

```text
src/
  assets/              # Recursos estáticos (imagens, ícones, logotipos)
  components/          # Componentes reutilizáveis (Card, Button, Rating, Modal)
  views/               # Páginas da aplicação (Map, StationDetails, WriteReview)
  services/            # Chamadas HTTP para o backend post-con-back e APIS externas
  types/               # Declarações e interfaces TypeScript globais
  App.vue              # Componente raiz da aplicação
  main.ts              # Ponto de entrada (inicialização do Vue)
  style.css            # Estilo global, reset e tokens do Design System (CSS Variables)
technical-plan/        # Visão técnica e roadmap de desenvolvimento do front-end
index.html             # Ponto de entrada HTML (carregamento de fontes e scripts)
package.json           # Dependências e scripts npm
tsconfig.json          # Configuração do compilador TypeScript
vite.config.ts         # Configuração do Vite
```

---

## Fluxo de Integração com o Backend

O front-end comunica-se com a API do `post-con-back` (ambiente local padrão em `http://localhost:8080`):

```text
Componente Vue (View/Component)
  → Service Layer (src/services/api.ts)
  → Fetch / Axios
  → API Gateway (post-con-back /api/v1)
```

### Endpoints Consumidos:

- `POST /api/v1/review` — Envia uma nova avaliação.
- `GET /api/v1/stations` — Obtém postos de combustível cadastrados.
- `GET /api/v1/station/:place_id` — Obtém dados de um posto pelo `place_id`.
- `GET /api/v1/reviews` — Lista as avaliações de um posto (paginada).

---

## Integração com Google Maps Platform

A chave canônica do posto é o **`place_id`** gerado pelo Google Places.

- **Carregamento da API**: Sempre utilize `@googlemaps/js-api-loader` para carregar dinamicamente os scripts do Maps, evitando bloqueios de renderização e garantindo tratamento de erros.
- **Componentes de Mapa**: Desenvolver um componente genérico `GoogleMap.vue` que receba marcadores (`markers`), centro geográfico e limites (`bounds`) via props.
- **Limitação de Custo (Finanças)**: Cachear dados de Place Details no front-end (Session/Local Storage) quando viável para evitar consultas redundantes e custos extras na API do Google Cloud.

---

## Código & Padrões do Time

1. **Estilo Declarativo**: Utilizar **Composition API** com `<script setup lang="ts">` em todos os componentes.
2. **Tipagem Estrita**: Declarar interfaces explícitas para todos os payloads de API, modelos de domínio (`Station`, `Review`, `User`) e eventos de componentes. Proibido o uso de `any`.
3. **Vanilla CSS Estilizado**:
   - Utilizar CSS Variables globais definidas em `:root` no arquivo `src/style.css` (para cores, espaçamentos, sombras e fontes).
   - Utilizar `<style scoped>` nos componentes para isolar estilos e evitar vazamento para o escopo global.
   - Evitar Tailwind CSS a menos que explicitamente solicitado.
4. **Rich Aesthetics (Regra de Ouro)**:
   - **Modo Escuro (Dark Mode)** por padrão com contrastes bem definidos (azul elétrico, cinzas sofisticados e superfícies translúcidas com `backdrop-filter`).
   - Adicionar micro-animações em botões (`hover` com transição suave, efeito ativo de pressionar) e carregamento gradual com esqueletos de loading (`skeleton loaders`).
   - Usar fontes de alta qualidade (ex.: `Outfit` importada no `index.html`).

---

## Persona sugerida para o agente

- Especialista em front-end Vue 3 e TypeScript.
- Focado em UI/UX premium, animações suaves e interfaces limpas.
- Segue fielmente a separação de responsabilidades (components vs views vs services).
- Proativo na otimização de performance e controle de limites de API (Google Maps).
