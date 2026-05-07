# 📡 API SAD — Synchronous Access to Data (Acesso Sincrono Aos Dados)

API REST para consulta do status de matrícula de um aluno em um período letivo do Luna Educação.

---

## Endpoint

```
POST /api/sad
```

**Header:**
- `Authorization: <canonicalCode>` ou `Authorization: Bearer <canonicalCode>`

**Content-Type:** `application/json`

---

## Parâmetros (Body JSON)

| Campo | Tipo | Obrigatório | Descrição |
|---|---|---|---|
| `cpf` | `string` | ✅ | CPF do aluno. Apenas dígitos numéricos, sem pontos ou traços. Deve conter exatamente 11 dígitos e ser um CPF válido (com verificação de dígitos). |
| `email` | `string` | ✅ | Email cadastrado do aluno no sistema. |
| `periodCode` | `string` | ✅ | Código (slug) do período letivo a ser consultado. Ex: `2025-1`, `primeiro-semestre-2025`. |

### Exemplo de Requisição

```bash
curl -X POST https://seu-dominio.com/api/sad \
  -H "Authorization: a1b2c3d4-e5f6-7890-abcd-ef1234567890" \
  -H "Content-Type: application/json" \
  -d '{
    "cpf": "12345678901",
    "email": "ana.clara@email.com",
    "periodCode": "2025-1"
  }'
```

---

## Fluxo de Validação

A API executa as validações em cascata. Se uma etapa falhar, a resposta é retornada imediatamente sem executar as etapas seguintes.

```
1. JSON válido?                → 400 INVALID_BODY
2. Campos obrigatórios?        → 400 MISSING_FIELDS
3. CPF com 11 dígitos válidos? → 422 INVALID_CPF
4. Email com formato válido?   → 422 INVALID_EMAIL
5. Canonical Code é UUID?      → 422 INVALID_CANONICAL_CODE
6. Period Code preenchido?     → 422 INVALID_PERIOD_CODE
7. Período existe no banco?    → 404 PERIOD_NOT_FOUND
8. Canonical Code confere?     → 403 CANONICAL_MISMATCH
9. Aluno existe (CPF+Email)?   → 404 STUDENT_NOT_FOUND
10. Aluno vinculado ao período? → 404 NOT_IN_PERIOD
11. Aluno em alguma turma?     → 200 WAITING / 200 ENROLLED
```

---

## Respostas

### ✅ Aluno Matriculado — `200 OK`

Retornado quando o aluno possui ao menos uma matrícula em uma turma do período.

```json
{
  "success": true,
  "status": "ENROLLED",
  "student": {
    "name": "Ana Clara Silva",
    "phone": "11999001001",
    "school": "Escola Estadual Prof. Maria Luiza"
  },
  "period": {
    "name": "Primeiro Semestre 2025",
    "startDate": "2025-02-01",
    "endDate": "2025-07-15",
    "program": {
      "name": "Luna Educação"
    }
  },
  "classGroups": [
    {
      "name": "1º Ano A",
      "shift": "MORNING",
      "courses": [
        {
          "code": "MAT-1A-2025",
          "name": "Matemática - 1º Ano A",
          "subjectName": "Matemática",
          "shift": "MORNING",
          "room": {
            "name": "Sala 101",
            "block": "A",
            "campus": {
              "name": "Campus Central",
              "address": "Rua das Flores, 123"
            }
          },
          "schedules": [
            {
              "dayOfWeek": "MONDAY",
              "startTime": "08:00",
              "endTime": "09:40",
              "teacherName": "Prof. João Silva",
              "room": {
                "name": "Sala 101",
                "block": "A"
              }
            },
            {
              "dayOfWeek": "WEDNESDAY",
              "startTime": "08:00",
              "endTime": "09:40",
              "teacherName": "Prof. João Silva",
              "room": {
                "name": "Lab. Informática",
                "block": "B"
              }
            }
          ]
        }
      ]
    }
  ]
}
```

#### Estrutura dos Campos (ENROLLED)

| Campo | Tipo | Descrição |
|---|---|---|
| `success` | `boolean` | Sempre `true` para respostas bem-sucedidas. |
| `status` | `"ENROLLED"` | Indica que o aluno está matriculado em ao menos uma turma. |
| `student.name` | `string` | Nome completo do aluno. |
| `student.phone` | `string` | Telefone de contato do aluno. |
| `student.school` | `string` | Escola de origem do aluno. |
| `period.name` | `string` | Nome do período letivo. |
| `period.startDate` | `string` | Data de início do período (`YYYY-MM-DD`). |
| `period.endDate` | `string` | Data de término do período (`YYYY-MM-DD`). |
| `period.program.name` | `string` | Nome do programa ao qual o período pertence. |
| `classGroups` | `array` | Lista de turmas físicas nas quais o aluno está matriculado. |
| `classGroups[].name` | `string` | Nome da turma (ex: "1º Ano A"). |
| `classGroups[].shift` | `string` | Turno da turma: `MORNING`, `AFTERNOON` ou `EVENING`. |
| `classGroups[].courses` | `array` | Disciplinas vinculadas à turma. |
| `courses[].code` | `string` | Código identificador da disciplina. |
| `courses[].name` | `string` | Nome da disciplina ofertada. |
| `courses[].subjectName` | `string` | Nome da disciplina na matriz curricular. |
| `courses[].shift` | `string` | Turno da disciplina. |
| `courses[].room` | `object \| null` | Sala padrão da disciplina. `null` se não definida. |
| `courses[].room.name` | `string` | Nome da sala. |
| `courses[].room.block` | `string \| null` | Bloco da sala. |
| `courses[].room.campus.name` | `string` | Nome do campus/local. |
| `courses[].room.campus.address` | `string` | Endereço do campus. |
| `courses[].schedules` | `array` | Grade horária da disciplina. |
| `schedules[].dayOfWeek` | `string` | Dia da semana: `MONDAY` a `SUNDAY`. |
| `schedules[].startTime` | `string` | Horário de início (ex: `"08:00"`). |
| `schedules[].endTime` | `string` | Horário de término (ex: `"09:40"`). |
| `schedules[].teacherName` | `string \| null` | Nome do professor. `null` se não definido. |
| `schedules[].room` | `object \| null` | Sala específica daquele horário. Pode diferir da sala padrão da disciplina. |

---

### ⏳ Aluno em Espera — `200 OK`

Retornado quando o aluno está vinculado ao período, mas ainda não foi adicionado a nenhuma turma.

```json
{
  "success": true,
  "status": "WAITING",
  "student": {
    "name": "Ana Clara Silva",
    "phone": "11999001001",
    "school": "Escola Estadual Prof. Maria Luiza"
  },
  "period": {
    "name": "Primeiro Semestre 2025",
    "startDate": "2025-02-01",
    "endDate": "2025-07-15",
    "program": {
      "name": "Luna Educação"
    }
  }
}
```

> **Nota:** A resposta `WAITING` possui a mesma estrutura de `student` e `period` que a `ENROLLED`, porém **sem** o campo `classGroups`.

---

### ❌ Erros

Todas as respostas de erro seguem o formato:

```json
{
  "success": false,
  "error": "Mensagem descritiva do erro em português.",
  "code": "CODIGO_DO_ERRO"
}
```

#### Tabela de Erros

| HTTP | Código | Descrição |
|---|---|---|
| `400` | `INVALID_BODY` | O corpo da requisição não é um JSON válido. |
| `400` | `MISSING_FIELDS` | Um ou mais campos obrigatórios (`cpf`, `email`, `canonicalCode`, `periodCode`) não foram enviados. |
| `422` | `INVALID_CPF` | O CPF não possui 11 dígitos numéricos ou falhou na verificação de dígitos (CPF inválido). |
| `422` | `INVALID_EMAIL` | O email não está em um formato válido. |
| `422` | `INVALID_CANONICAL_CODE` | O código canônico não é um UUID válido. |
| `422` | `INVALID_PERIOD_CODE` | O código do período está vazio. |
| `404` | `PERIOD_NOT_FOUND` | Nenhum período foi encontrado com o código (slug) informado. |
| `403` | `CANONICAL_MISMATCH` | O código canônico enviado não corresponde ao período encontrado. Acesso negado. |
| `404` | `STUDENT_NOT_FOUND` | Nenhum aluno foi encontrado com a combinação de CPF e email informados. |
| `404` | `NOT_IN_PERIOD` | O aluno existe no sistema, mas não está vinculado ao período solicitado. |
| `500` | `INTERNAL_ERROR` | Erro inesperado no servidor. |

---

## Exemplos de Uso

### cURL

```bash
curl -X POST https://seu-dominio.com/api/sad \
  -H "Content-Type: application/json" \
  -d '{
    "cpf": "12345678901",
    "email": "ana.clara@email.com",
    "canonicalCode": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "periodCode": "2025-1"
  }'
```

### JavaScript / TypeScript (Fetch)

```typescript
async function consultarMatricula(
  cpf: string,
  email: string,
  canonicalCode: string,
  periodCode: string
) {
  const response = await fetch("https://seu-dominio.com/api/sad", {
    method: "POST",
    headers: { 
      "Content-Type": "application/json",
      "Authorization": `Bearer ${canonicalCode}`
    },
    body: JSON.stringify({ cpf, email, periodCode }),
  });

  const data = await response.json();

  // Verificar se a requisição foi bem-sucedida
  if (!data.success) {
    console.error(`Erro [${data.code}]: ${data.error}`);
    return null;
  }

  // Dados básicos disponíveis em ambos os status
  console.log(`Aluno: ${data.student.name}`);
  console.log(`Período: ${data.period.name}`);
  console.log(`Programa: ${data.period.program.name}`);

  if (data.status === "WAITING") {
    console.log("O aluno ainda não foi enturmado.");
    return data;
  }

  // Status ENROLLED — dados de turma disponíveis
  for (const classGroup of data.classGroups) {
    console.log(`\nTurma: ${classGroup.name} (${classGroup.shift})`);

    for (const course of classGroup.courses) {
      console.log(`  Disciplina: ${course.subjectName} [${course.code}]`);

      if (course.room) {
        console.log(`  Sala: ${course.room.name} — Bloco ${course.room.block}`);
        console.log(`  Local: ${course.room.campus.name} — ${course.room.campus.address}`);
      }

      for (const schedule of course.schedules) {
        console.log(
          `    ${schedule.dayOfWeek}: ${schedule.startTime}–${schedule.endTime}` +
          ` | Prof. ${schedule.teacherName ?? "A definir"}` +
          ` | Sala ${schedule.room?.name ?? "A definir"}`
        );
      }
    }
  }

  return data;
}
```

### Python (Requests)

```python
import requests

response = requests.post("https://seu-dominio.com/api/sad", 
  headers={"Authorization": "a1b2c3d4-e5f6-7890-abcd-ef1234567890"},
  json={
    "cpf": "12345678901",
    "email": "ana.clara@email.com",
    "periodCode": "2025-1"
})

data = response.json()

if not data["success"]:
    print(f"Erro [{data['code']}]: {data['error']}")
elif data["status"] == "WAITING":
    print(f"{data['student']['name']} está em espera.")
else:
    print(f"{data['student']['name']} está matriculado!")
    for cg in data["classGroups"]:
        print(f"  Turma: {cg['name']}")
```

---

## Segurança

- **Código Canônico (`canonicalCode`)**: Funciona como uma chave de API por período. Somente quem possui o UUID correto pode consultar os dados daquele período. Esse valor é gerado automaticamente pelo banco de dados ao criar um período e deve ser compartilhado apenas com serviços autorizados.

- **Validação de CPF**: Além de verificar o formato (11 dígitos), a API calcula os dígitos verificadores do CPF para rejeitar números inválidos (ex: `00000000000`, `12345678900`).

- **Sem exposição de IDs internos**: A API nunca retorna os UUIDs internos do banco de dados. Todos os dados retornados são informações de exibição.

---

## Notas Técnicas

- A API utiliza **validação em cascata**: cada etapa é verificada antes de prosseguir, evitando consultas desnecessárias ao banco de dados.
- A busca de turmas, disciplinas, horários, professores e salas é feita em uma **única query otimizada** com `select` aninhado do Prisma, minimizando round-trips ao banco.
- Datas são retornadas no formato **ISO 8601** (`YYYY-MM-DD`).
- Todos os horários (`startTime`, `endTime`) são strings no formato configurado nos `TimeSlots` do programa.
- Os valores de `shift` seguem o enum: `MORNING`, `AFTERNOON`, `EVENING`.
- Os valores de `dayOfWeek` seguem o enum: `MONDAY`, `TUESDAY`, `WEDNESDAY`, `THURSDAY`, `FRIDAY`, `SATURDAY`, `SUNDAY`.
