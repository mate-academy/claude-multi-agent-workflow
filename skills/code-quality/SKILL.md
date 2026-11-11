---
name: code-quality
description: Convenções de código da course-api (rotas, db/store.js, validação e erros em JSON). Use ao criar ou alterar rotas e ao revisar código da API.
---

- Um arquivo de rota por recurso, montado em server.js pelo caminho base.
- Todo acesso a dados passa por db/store.js. Rotas não guardam estado.
- Entrada inválida: responder 400. Registro inexistente: responder 404.
- Erros sempre no formato `{ "error": "mensagem" }`.
