---
description: Revisa, cobre com testes e valida o código da course-api em uma única passada
---

Execute este fluxo para o escopo pedido pelo usuário (padrão: routes/ e db/).

**Passo 1 — paralelo (dispare os dois na mesma resposta):**
- Use o subagente `code-reviewer` para revisar o escopo e listar problemas.
- Use o subagente `test-writer` para identificar rotas sem teste em tests/ e criar os que faltarem.

**Passo 2 — dependente (só depois que o Passo 1 terminar):**
- Rode `npm run lint` e `npm test` em course-api/.
- Cruze os achados do `code-reviewer` com o resultado dos testes e liste o que ainda precisa de correção.
- Se houver falha de teste, devolva a falha ao `test-writer` para correção e rode os testes de novo.

Ao final, entregue um resumo: problemas encontrados, testes criados, status do lint e dos testes.

