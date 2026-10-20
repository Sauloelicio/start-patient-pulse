# Novo design do START — Clínico moderno

## Direção visual
- Fundo claro (#FFFFFF e #F4F4F4), verde #008B3E como cor principal, #28A745 em destaques, laranja #FF5E00 só em ícones e detalhes da marca.
- Cartões brancos limpos, cantos levemente arredondados, sombras suaves, bastante espaço.
- Tipografia nova e distinta (títulos em Sora, textos em Manrope).
- Tudo pensado primeiro para celular e depois para telas maiores.

## Menu no topo
- Barra fixa no topo de todas as telas internas: logo START, links "Início", "Pacientes", "Avaliação" e botão "Sair".
- No celular, os links ficam num menu que abre pelo ícone de três linhas.
- A tela de login e a de avaliação em modo recepção não mostram o menu.

## Telas
- **Login**: tela dividida — imagem/cor da marca de um lado, formulário de senha do outro (no celular, empilhado).
- **Início**: saudação, atalhos grandes em cartões e números rápidos (pacientes ativos, sessões do mês).
- **Pacientes**: busca em destaque, cartões de paciente redesenhados com foto, patologia e progresso do pacote.
- **Cadastro**: formulário em seções, campos maiores e foto em destaque.
- **Detalhes**: cabeçalho com dados do paciente, linha do tempo de sessões mais clara, botões de ação organizados.
- **Avaliação**: emojis grandes, frases em botões pretos sempre visíveis (mantido), carrossel e rodapé com logo, mais elegante.

## O que não muda
- Senha, exclusão de pacientes, backup, dados e regras de segurança continuam iguais.

## Detalhes técnicos
- Atualizar tokens em `src/index.css` e `tailwind.config.ts` (cores, sombras, raio, fontes via Google Fonts em `index.html`).
- Criar `src/components/TopNav.tsx` e `src/components/AppLayout.tsx`; envolver rotas protegidas (exceto Avaliação) em `App.tsx`.
- Remover cores fixas (`text-white`, etc.) e usar apenas tokens semânticos.
- Reestilizar `Login`, `Index`, `Patients`, `PatientCard`, `NewPatient`, `PatientDetail`, `Evaluation` sem alterar lógica.
- Conferir em celular e computador com capturas de tela.
