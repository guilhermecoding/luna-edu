# Checklist de Features - Luna Edu

Atualizado em: 16/04/2026

## 1. Base do Projeto e Estrutura Inicial
- [x] Projeto configurado com Next.js 16 + React 19 + TypeScript
- [x] Prisma configurado com Postgres e cliente gerado em src/generated/prisma
- [x] Histórico inicial de migrations criado e versionado
- [x] ESLint e Husky configurados

## 2. Autenticacao e Acesso
- [x] Better Auth configurado com adapter Prisma
- [x] Endpoint de autenticacao pronto em /api/auth/[...all]
- [x] Auth client com signIn, signUp, signOut e useSession
- [ ] Tela de login/registro funcional no App Router
- [ ] Protecao de rotas por perfil (admin/professor)

## 3. Modulo Admin - Painel Base
- [x] Layout administrativo implementado
- [x] Sidebar e navegacao base do admin implementadas
- [x] Redirecionamento inicial do admin para programa/periodos
- [x] Persistencia de programa ativo por cookie
- [ ] Criar dashboard inicial do admin com metricas basicas

==================================================
# FLUXO ACADÊMICO CORE
==================================================

## 4. Fase A: Configuração Curricular (Base Teórica)
- **Programas**
  - [x] Listagem, Criacao, Edicao e Exclusao de programas
  - [x] Validacoes Zod e invalidacoes de cache
- **Matrizes / Cursos de Formação (Degrees)**
  - [ ] CRUD de Cursos Formativos por Programa
- **Disciplinas Base (Subjects)**
  - [ ] CRUD de Disciplinas amarradas nas Matrizes (nome, carga horaria)

## 5. Fase B: Execução Temporal (Calendário)
- **Períodos Letivos (Admin)**
  - [x] CRUD de Períodos gerados por Programa
  - [x] Separacao visual de periodo atual vs arquivo
  - [x] Regra antiburla de sobreposicao de periodos abertos
  - [ ] Adicionar card de pendências do período na tela
  - [ ] Formalizar o container principal do período atual na UI

## 6. Fase C: Oferta Letiva (Encontro da Fase A + B)
- **Infraestrutura**
  - [ ] Gestão de Campus e Blocos
  - [ ] Gestão de Salas de Aula (Rooms) e capacidades
- **Oferta de Turmas (Courses)**
  - [ ] Cadastro de Turmas ofertadas (Vinculando Subject + Period + Room + Shift)
  - [ ] Listagem consolidada de turmas rodando no semestre atual

## 7. Módulo Secretaria: Alunos e Vínculos
- [ ] CRUD de Alunos (baseado no novo schema)
- [ ] Módulo de Matrículas (Enrollments) do Aluno na Turma (Course)
- [ ] API de consulta de vagas/turmas para comunicação externa

## 8. Módulo Professor e Diário de Classe
- [ ] Estrutura de rotas e layout do modulo professor
- [ ] Dashboard do professor com turmas alocadas
- [ ] Registro de Aulas do dia (Lessons)
- [ ] Chamada e Frequência (Attendances)
- [ ] Criação de Atividades avaliativas com tipos e pesos (Activities)
- [ ] Lançamento de notas das atividades (ActivityGrades)
- [ ] Fechamento de semestre, médias de rotina e notas Finais

## 9. Módulos Adicionais e Engajamento
- [ ] Gestão de Assistentes de curso/auxiliares
- [ ] Sistema de Notificações Internas (Admin/Professores/Alunos)
- [ ] Visualização de Estatísticas Acadêmicas Pessoais do Aluno (Stats)

==================================================
# OPERAÇÃO DE ENGENHARIA
==================================================

## 10. Qualidade e Infra
- [ ] README e documentação atualizados
- [ ] Testes automatizados (unitários/integração) nos fluxos críticos
- [ ] Seed de dados completo via Prisma para desenvolvimento
- [ ] Observabilidade, logs e tratamento de erros de produção

## 11. Sprint Atual / Backlog Imediato (Sugestão de Foco)
- [ ] 1. Desenvolver a Tela de Login e Guardas de Rota
- [ ] 2. Ajustes finais no CRUD de Semestres (Cards e UI do Período Atual)
- [ ] 3. Iniciar CRUD de Cursos de Formação (Degrees)
- [ ] 4. Iniciar CRUD de Disciplinas Teóricas (Subjects)
