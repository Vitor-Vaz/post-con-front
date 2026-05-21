# post-con-front (PostoConfiável)

Este é o repositório do front-end do **PostoConfiável** — um SaaS moderno para avaliações estruturadas de postos de combustível no Brasil com contexto de veículo, recência e integração de mapas.

A aplicação foi construída utilizando **Vue 3 (Composition API)**, **TypeScript**, **Vite** e **CSS Vanilla** para manter um design premium, leve e de alta performance.

---

## 🛠️ Pré-requisitos

Para rodar este projeto localmente, você precisará ter instalado em sua máquina:
* **Node.js** (recomendado v18+ ou v20+)
* **npm** (gerenciador de pacotes padrão do Node)

---

## 🚀 Como Rodar o Projeto Localmente

Siga o passo a passo abaixo para inicializar o ambiente de desenvolvimento:

### 1. Clonar e Acessar o Diretório
```bash
git clone git@github.com:Vitor-Vaz/post-con-front.git
cd post-con-front
```

### 2. Configurar as Variáveis de Ambiente
O projeto integra-se com o **Google Maps Platform** e requer uma chave de API para renderizar o mapa.

1. Faça uma cópia do arquivo de exemplo `.env.example` e nomeie-o como `.env`:
   ```bash
   cp .env.example .env
   ```
2. Abra o arquivo `.env` gerado e insira a sua chave do Google Cloud:
   ```env
   VITE_GOOGLE_MAPS_API_KEY=SUA_CHAVE_DE_API_DO_GOOGLE_AQUI
   ```

> [!NOTE]
> Para gerar a chave, certifique-se de que a **Maps JavaScript API** e a **Places API** estejam ativadas no seu projeto dentro do painel do [Google Cloud Console](https://console.cloud.google.com/).

### 3. Instalar as Dependências
Instale todos os pacotes necessários através do npm:
```bash
npm install
```

### 4. Iniciar o Servidor de Desenvolvimento
Execute o script de dev para subir o servidor local:
```bash
npm run dev
```

O terminal exibirá a URL local (geralmente **`http://localhost:5173/`**). Abra-a no seu navegador para ver a aplicação rodando!

---

## 📦 Comandos Disponíveis

* `npm run dev` — Inicia o servidor de desenvolvimento local com Hot Module Replacement (HMR).
* `npm run build` — Compila e otimiza a aplicação com TypeScript para o pacote de produção em `dist/`.
* `npm run preview` — Inicializa um servidor local para testar localmente o build de produção gerado.

---

## 📂 Estrutura de Pastas Principal

```text
src/
  assets/              # Recursos estáticos (imagens, logotipos, ícones)
  components/          # Componentes globais reutilizáveis (ex.: GoogleMap.vue)
  views/               # Páginas e dashboards do sistema (ex.: MapDashboard.vue)
  services/            # Chamadas HTTP de API (integração com post-con-back)
  App.vue              # Componente raiz da aplicação
  main.ts              # Inicialização do Vue 3 e importação de estilos
  style.css            # Estilo CSS global e variáveis do Design System
.env.example           # Modelo de exemplo de variáveis de ambiente
vite.config.ts         # Configuração de bundler do Vite
AGENTS.md              # Convenções e padrões de IA acordados para o repositório
```

---

## 🔗 Integração com o Backend

O front-end é configurado para consumir as rotas da API do backend **`post-con-back`** (ambiente local padrão rodando em `http://localhost:8080`).

Para mais informações sobre as decisões de design e roadmap do front-end, consulte o [Plano Técnico do Front-End](file:///home/vitorandrade/Documentos/projetos-pessoais/post-con-front/technical-plan/SAAS-POSTOS-COMBUSTIVEL-FRONT.md).
