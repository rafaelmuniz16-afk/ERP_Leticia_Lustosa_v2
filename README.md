ERP Leticia Lustosa — Encerramentos 2026

> Uma aplicação web desenvolvida para transformar um processo operacional baseado em planilhas em uma experiência mais organizada, visual e automatizada.

Sobre o projeto

O **ERP Leticia Lustosa** foi desenvolvido para facilitar o controle e acompanhamento de encerramentos de processos durante o ano de 2026.

A aplicação surgiu a partir de uma necessidade prática: substituir a utilização direta de uma planilha por uma interface web mais organizada, intuitiva e agradável, mantendo a integração com a estrutura de dados já utilizada no processo.

O sistema foi desenvolvido com foco em **produtividade, visualização de indicadores, automação e facilidade de uso**.

---

Principais funcionalidades

Dashboard operacional

* Indicadores de encerramentos;
* Encerramentos reais;
* Recusas no Panjud;
* Acompanhamento da meta mensal;
* Progresso da meta;
* Meta diária necessária;
* Distribuição dos encerramentos por tipo;
* Evolução diária;
* Indicadores financeiros.

Gestão de registros

* Cadastro de novos casos;
* Edição de registros;
* Exclusão de registros;
* Pesquisa por ID ou número do processo;
* Filtros por tipo;
* Filtros por status Panjud;
* Filtros por período;
* Ordenação por data;
* Paginação;
* Observações por registro.

Sincronização

A aplicação foi projetada para trabalhar integrada ao ambiente de dados existente, permitindo que as informações cadastradas na ERP sejam sincronizadas com a estrutura utilizada no processo operacional.

O sistema também apresenta o status da conexão e aguarda a confirmação da nuvem antes de considerar uma alteração concluída.

Auditoria

O sistema possui um módulo de **Diário de Auditoria**, permitindo acompanhar movimentações realizadas na aplicação.

São registrados dados como:

* Data e hora;
* Tipo de ação;
* ID do caso;
* Detalhes da movimentação.

 Aurora AI

O sistema possui uma interface experimental de inteligência artificial chamada **Aurora AI**.

A IA pode interpretar solicitações em linguagem natural e, quando aplicável, propor ações para execução no sistema.

As ações são:

1. Interpretadas pela IA;
2. Estruturadas;
3. Validadas;
4. Apresentadas para confirmação;
5. Executadas somente após autorização do usuário.

Isso permite interações como:

> "Cadastre o caso 123..."

ou consultas relacionadas aos dados e indicadores da aplicação.

Assistente Financeiro

O módulo **Assistente Financeiro** apresenta diagnósticos operacionais calculados em tempo real, incluindo:

* Projeção de fechamento;
* Percentual da meta;
* Ganho atual;
* Projeção financeira;
* Meta diária;
* Taxa de homologação;
* Impacto das recusas;
* Distribuição por tipo de encerramento;
* Dias úteis restantes;
* Mix da carteira.

Easter Eggs

Porque sistemas corporativos também podem ter personalidade. 

O projeto possui pequenos elementos interativos e easter eggs, incluindo um **unicórnio interativo** e uma surpresa especial após determinadas interações.

---

Tecnologias utilizadas

### Frontend

* HTML5
* CSS3
* JavaScript
* Chart.js
* SweetAlert2

### Integrações

* Google Sheets
* Google Apps Script
* Groq API

### Interface

* Design responsivo;
* Componentes personalizados;
* Gráficos interativos;
* Animações CSS;
* Feedback visual;
* Interface baseada em dashboard.

---

Estrutura do projeto

```text
ERP_Leticia_Lustosa_v2/
│
├── index.html
├── foto.jpg
├── README.md
│
├── css/
│   └── style.css
│
└── js/
    ├── app.js
    ├── radar.js
    └── unicorn.js
```

### Organização

**`index.html`**
Estrutura principal da aplicação e componentes da interface.

**`css/style.css`**
Sistema visual, responsividade, componentes, animações e identidade da interface.

**`js/app.js`**
Lógica principal da aplicação, gerenciamento de registros, filtros, dashboard, sincronização, auditoria e integração com a Aurora AI.

**`js/radar.js`**
Motor de indicadores e diagnósticos operacionais.

**`js/unicorn.js`**
Interações, animações e easter eggs.

---

Objetivo do projeto

Mais do que criar uma interface bonita, o objetivo foi **reduzir o atrito operacional** de uma rotina baseada em planilhas.

A aplicação centraliza:

**Cadastro → acompanhamento → análise → auditoria → indicadores**

em uma única interface.

---

Conceito

O projeto combina uma ferramenta operacional com elementos de personalização de interface, buscando equilibrar:

* produtividade;
* clareza das informações;
* automação;
* análise de dados;
* experiência do usuário.

O resultado é uma ERP desenvolvida especificamente para o fluxo de trabalho para o qual foi criada.

---

 Status

**Em uso e em evolução.**

Novas funcionalidades e experimentos de UI/UX podem ser incorporados ao projeto conforme as necessidades do processo.

---

## 👨‍💻 Desenvolvimento

Projeto desenvolvido por **Rafa** como uma solução personalizada para uma necessidade operacional real.

> Desenvolvido para resolver um problema real, utilizado em um processo real e continuamente aprimorado a partir do uso.
