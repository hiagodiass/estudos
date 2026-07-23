# EstudoFlow

Sistema pessoal de acompanhamento de estudos.

## Como rodar

1. Instale as dependências:
```bash
   npm install
```
2. Rode o servidor de desenvolvimento:
```bash
   npm run dev
```

O app abre em `http://localhost:5173`.

> O app funciona 100% localmente, salvando os dados no armazenamento do
> próprio navegador — não depende de nenhum serviço externo (Supabase ou
> outro banco na nuvem).

## Estrutura

```
src/
├── components/
│   ├── dashboard/    # Componentes do painel principal
│   ├── subjects/     # Componentes de matérias
│   ├── topics/       # Componentes de tópicos
│   ├── ui/           # Componentes base (Button, Card) — padrão shadcn/ui
│   └── layout/       # Sidebar, PageContainer
├── hooks/            # Hooks customizados
├── lib/              # Store local (persistência no navegador), utilitários
├── pages/            # Dashboard, Subjects, Settings, SubjectDetail
├── routes/           # Definição de rotas
└── types/            # Tipos usados no app
```