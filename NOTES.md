# NOTES — plugin code-quality

## O que o plugin faz e como instalar

O plugin `code-quality` reúne revisão de código, criação de testes e formatação automática para a `course-api/`. Ele traz:

- **Subagentes:** `code-reviewer` (somente leitura) e `test-writer` (escreve testes).
- **Comando:** `/code-quality:quality-check`, que roda o fluxo completo.
- **Skill:** `code-quality`, com as convenções da API.
- **Hook:** roda `eslint --fix` automaticamente nos arquivos `.js` editados.

Instalação, a partir de uma sessão nova do Claude Code:

```
/plugin marketplace add MCapelati/claude-multi-agent-workflow
/plugin install code-quality@code-quality-marketplace
```

Para o hook funcionar, rode `npm install` dentro de `course-api/`. Sem ele, o hook avisa que o eslint não está instalado e não faz nada.

## Decisão de escopo: o `code-reviewer` não pode editar

O `code-reviewer` recebe apenas `Read, Grep, Glob`. Revisar código é uma tarefa de leitura, e o papel dele é apontar problemas, não corrigi-los. Se ele pudesse editar, uma revisão poderia alterar o código sem que alguém tivesse decidido isso, e ficaria difícil saber o que foi revisado e o que foi mudado. Quem escreve é o `test-writer`, que recebe `Write`, `Edit` e `Bash`, porque precisa criar arquivos de teste e rodar `npm test`. Os dois usam o modelo `sonnet`, porque ambos exigem julgamento sobre o código.

## Decisão de orquestração: paralelo e sequencial

O comando `quality-check` tem dois passos:

1. **Paralelo:** `code-reviewer` e `test-writer` rodam juntos. Revisar e criar testes são tarefas independentes, então rodar em paralelo economiza tempo.
2. **Sequencial:** só depois do passo 1, o comando roda `npm run lint` e `npm test`. Esses comandos dependem dos testes já existirem e do código estar estável; rodar antes daria um resultado desatualizado. Se algum teste falhar, o `test-writer` corrige e os testes são rodados de novo.
