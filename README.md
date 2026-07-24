# EstudoH

Sistema pessoal de acompanhamento de estudos.

## Como rodar

1. Crie um arquivo `.env.local` na raiz do projeto (use `.env.example` como
   referência) com suas credenciais do Supabase:

VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua-chave-anon-aqui

2. Instale as dependências:
```bash
   npm install
```
3. Rode o servidor de desenvolvimento:
```bash
   npm run dev
```

O app abre em `http://localhost:5173`.

> O app usa Supabase para autenticação e armazenamento dos dados — cada
> usuário só acessa os próprios dados (protegido por Row Level Security).
> Fazendo login com a mesma conta em computadores diferentes, os dados
> ficam sincronizados automaticamente.

## Estrutura

src/
├── components/
│ ├── auth/ # Proteção de rotas (RequireAuth)
│ ├── dashboard/ # Componentes do painel principal
│ ├── subjects/ # Componentes de matérias
│ ├── topics/ # Componentes de tópicos
│ ├── ui/ # Componentes base (Button, Card) — padrão shadcn/ui
│ └── layout/ # Sidebar, PageContainer
├── hooks/ # Hooks customizados (useAppData via React Query)
├── lib/ # Cliente Supabase, autenticação, API, utilitários
├── pages/ # Login, Dashboard, Subjects, Settings, SubjectDetail
├── routes/ # Definição de rotas
└── types/ # Tipos usados no app