# PostoConfiável — Plano de Desenvolvimento Front-End (SaaS)

Documento vivo com a visão técnica, arquitetura de interface (UI/UX) e roadmap do front-end do **PostoConfiável** em **Vue 3 + TypeScript**.

---

## 🚀 Resumo Executivo

O front-end do **PostoConfiável** é a interface SPA que empodera motoristas urbanos e viajantes a encontrar postos de combustíveis confiáveis. A aplicação consome a API do backend (`post-con-back`) e integra-se diretamente com o **Google Maps Platform** para renderização de mapas, geolocalização e busca inteligente de estabelecimentos (Google Places).

O grande diferencial de design está em apresentar dados de **confiança**, **recência** e **compatibilidade de veículos** de forma altamente visual, intuitiva e esteticamente premium, superando o modelo genérico de avaliações do Google Maps clássico.

---

## 🎨 Sistema de Design e Estética (Rich Aesthetics)

A aplicação segue uma identidade visual moderna e sofisticada:

- **Modo Escuro (Dark Mode) Nativo**: Fundo escuro profundo (`#020617` a `#0f172a`), com elementos flutuando em cards translúcidos de vidro (Glassmorphism com `backdrop-filter: blur(12px)` e bordas sutis `rgba(255, 255, 255, 0.08)`).
- **Cores Harmoniosas**:
  - Primária: Azul elétrico suave (`#3b82f6` a `#2563eb`) para ações e marcações de confiança.
  - Notas / Ratings: Estrelas e pontuações em amarelo dourado vibrante (`#fbbf24`).
  - Alertas / Crítico: Tons de vermelho coral/rubi para postos avaliados negativamente ou riscos.
- **Tipografia**: Uso da fonte **Outfit** (Google Fonts) que confere legibilidade excelente e visual tecnológico/premium.
- **Micro-interações**: Transições suaves (`transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1)`) em botões, inputs, marcadores do mapa e cards de detalhes.

---

## 🗺️ Integração do Google Maps Platform

A experiência central do usuário gira em torno do mapa:

1. **Mapa Interativo (Google Maps API)**: Renderiza um mapa personalizado em estilo escuro (usando as configurações de estilo JSON do Google Maps Cloud Styling).
2. **Autocomplete de Busca (Places API)**: Barra de pesquisa integrada que autocompleta nomes de postos e locais à medida que o usuário digita.
3. **Marcadores Customizados**:
   - Pinos customizados que mudam de cor com base no score médio do posto (ex.: Verde para notas > 4.5, Amarelo para 3.5 a 4.5, Vermelho para < 3.5).
4. **Otimização de Custos (Caching)**:
   - Detalhes estáticos obtidos do Google Places (endereço, coordenadas, nome original) devem ser consultados apenas na primeira vez ou cacheados temporariamente no cliente, priorizando a API local `/api/v1/station/:place_id` que persistirá as informações agregadas.

---

## 🖥️ Páginas Principais (Views) do MVP

### 1. View Mapa / Dashboard (`/`)

- **Mapa de tela cheia** com estilo dark moderno.
- **Barra de pesquisa** com Google Autocomplete no topo.
- **Barra lateral (Sidebar) ou Drawer deslizante** contendo:
  - Lista rápida de postos visíveis no quadrante do mapa.
  - Filtros de pontuação mínima e tipo de combustível.

### 2. View Detalhe do Posto (`/station/:place_id`)

- **Painel informativo**: Nome do posto, endereço, nota agregada compostas pelas dimensões principais (Litro honesto, Qualidade do combustível, Atendimento).
- **Filtro Inteligente de Reviews**: Permite ao usuário filtrar as avaliações por perfil do veículo (ex.: "Ver apenas avaliações de motoristas com carros turbo" ou "Ver apenas avaliações de Gasolina Aditivada").
- **Lista de Avaliações**: Paginada, exibindo o comentário, a nota dada para cada dimensão e a data com cálculo de tempo relativo (ex: "há 3 dias").

### 3. View Escrever Avaliação (`/station/:place_id/review`)

- Formulário com progresso em etapas ou painel único unificado:
  - Seleção de **Rating Geral (1 a 5 estrelas)**.
  - **Dimensões específicas**: Notas de 1 a 5 para qualidade do combustível e atendimento.
  - **Snapshot de Contexto**: Seleção de combustível usado (Gasolina Comum, Aditivada, Etanol, Diesel) e perfil do veículo (Aspirado, Turbo/Injeção Direta, Importado Premium, etc.).
  - Caixa de texto para opinião sincera.

---

## 📌 Roadmap Técnico de Desenvolvimento

| Fase       | Entregas e Objetivos do Front-End                                                                   | Status                             |
| ---------- | --------------------------------------------------------------------------------------------------- | ---------------------------------- |
| **Fase 1** | Inicialização do projeto, setup TypeScript, estrutura básica de pastas e Design System CSS.         | **Concluído** ✅                   |
| **Fase 2** | Integração básica do `@googlemaps/js-api-loader` e renderização de mapa escuro interativo.          | **Em Andamento (Branch Atual)** 🔧 |
| **Fase 3** | Criação das Views estáticas (Mapa, Detalhes do Posto e Formulário de Avaliação) com dados mockados. | **Pendente**                       |
| **Fase 4** | Integração de chamadas HTTP com `post-con-back` (listagem e detalhes de postos).                    | **Pendente**                       |
| **Fase 5** | Conexão do formulário de review com a rota `POST /api/v1/review` e recarga dinâmica de scores.      | **Pendente**                       |
| **Fase 6** | Polimento estético, transições fluidas e filtros de reviews por perfil de veículo.                  | **Pendente**                       |
