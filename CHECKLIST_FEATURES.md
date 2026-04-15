# Checklist de Features - Luna Edu

Atualizado em: 15/04/2026

## Base do Projeto

- [x] Projeto configurado com Next.js 16 + React 19 + TypeScript
- [x] Prisma configurado com Postgres e cliente gerado em src/generated/prisma
- [x] Histórico inicial de migrations criado e versionado
- [x] ESLint e Husky configurados

## Autenticacao e Acesso

- [x] Better Auth configurado com adapter Prisma
- [x] Endpoint de autenticacao pronto em /api/auth/[...all]
- [x] Auth client com signIn, signUp, signOut e useSession
- [ ] Tela de login/registro funcional no App Router
- [ ] Protecao de rotas por perfil (admin/professor)

## Modulo Admin - Estrutura

- [x] Layout administrativo implementado
- [x] Sidebar e navegacao base do admin implementadas
- [x] Redirecionamento inicial do admin para programa/periodos
- [x] Persistencia de programa ativo por cookie

## Modulo Programas (Admin)

- [x] Listagem de programas
- [x] Criacao de programa
- [x] Edicao de programa
- [x] Exclusao de programa com confirmacao por nome
- [x] Validacoes com Zod nas Server Actions
- [x] Invalidacao de cache (updateTag/revalidatePath) no fluxo de mutacao

## Modulo Periodos (Admin)

- [x] Listagem de periodos por programa
- [x] Separacao visual de periodo atual e outros periodos
- [x] Criacao de periodo
- [x] Regra para impedir sobreposicao de periodos abertos
- [x] Validacoes com Zod nas Server Actions
- [x] Edicao de periodo
- [x] Encerramento/manual de conclusao de periodo
- [x] Exclusao de periodo
- [ ] Adicionar card de pendências do período na página que lista os períodos
- [ ] Formalizar o container principal de período atual

## Modulos Academicos (modelados no Prisma, pendentes de app)

- [ ] Cursos
- [ ] Salas e campus
- [ ] Alunos e matriculas
- [ ] Aulas e presencas
- [ ] Atividades e notas por atividade
- [ ] Nota final e estatisticas por aluno
- [ ] Notificacoes
- [ ] Assistentes de curso

## Modulo Professor

- [ ] Estrutura de rotas e layout do modulo professor
- [ ] Dashboard do professor
- [ ] Fluxos de chamada, atividade e lancamento de notas

## Qualidade, Produto e Operacao

- [ ] README do projeto atualizado (atualmente padrao do create-next-app)
- [ ] Testes automatizados (unitarios/integracao)
- [ ] Seed de dados para desenvolvimento
- [ ] Observabilidade e tratamento padrao de erros em producao

## Backlog Curto (proximas entregas sugeridas)

- [ ] Implementar autenticao visual (login) e guarda de rota por papel
- [ ] Finalizar CRUD de periodos (editar, concluir, excluir)
- [ ] Iniciar CRUD de cursos e alunos, reaproveitando a estrutura Prisma
- [ ] Criar dashboard inicial do admin com metricas basicas
- [ ] Criar API de consulta de vagas para comunicação com sistemas externos
