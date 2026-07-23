# EstudoFlow

Sistema pessoal de acompanhamento de estudos. Módulo 1: setup base.

## Como rodar

1. Instale as dependências:
   ```bash
   npm install
   ```
2. Copie o arquivo de variáveis de ambiente e preencha com as credenciais do seu projeto Supabase:
   ```bash
   cp .env.example .env
   ```
3. Rode o servidor de desenvolvimento:
   ```bash
   npm run dev
   ```

O app abre em `http://localhost:5173`.

> Neste módulo o Supabase ainda não é usado por nenhuma tela — a configuração
> do client já está pronta para os próximos módulos (CRUD de Matérias e
> Assuntos), mas as variáveis de ambiente precisam existir para o app compilar
> sem erro de runtime.

## Estrutura

```
src/
├── components/
│   ├── ui/          # Componentes base (Button, Card) — padrão shadcn/ui
│   └── layout/       # Sidebar, PageContainer
├── features/         # Hooks e lógica por domínio (vazio por enquanto)
├── lib/              # Supabase client, utilitário cn()
├── pages/            # Dashboard, Subjects, Settings
├── routes/           # Definição de rotas
└── types/            # Tipos do banco (placeholder até criarmos as tabelas)
```
