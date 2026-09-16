# Totem — Pós iFood Move (2ª edição)

Ativação de totem: os participantes escaneiam um QR code, respondem no celular qual é o
maior desafio do restaurante deles, e o resultado aparece ao vivo na tela do totem.

Duas páginas, mesmo projeto Supabase do `identidade-visual/` (só tabelas novas):

- **`totem.html`** — vai na tela grande. Mostra o QR code e o ranking ao vivo.
- **`vote.html`** — é pra onde o QR code aponta. Abre no celular do participante.

## Configurar (uma vez só)

1. **Criar as tabelas no Supabase**
   - No SQL Editor do projeto (o mesmo do `identidade-visual/`), cole o conteúdo de
     [`supabase-setup.sql`](supabase-setup.sql) e rode.
   - Isso cria `pos_ifood_move_votos` (com tempo real ligado) e `pos_ifood_move_contatos`.

2. **Publicar as páginas**
   - Suba essa pasta pro GitHub Pages (mesmo jeito que `identidade-visual/` foi publicado).
   - `totem.html` e `vote.html` precisam estar na mesma pasta publicada — o QR code é gerado
     automaticamente apontando pro `vote.html` ao lado, não precisa configurar URL na mão.

3. **Testar antes do evento**
   - Abra `totem.html` numa tela (ou notebook conectado na TV) e `vote.html` no seu celular.
   - Vote e confira se a barra da categoria sobe no totem em poucos segundos.
   - Teste também o fluxo "Quer o diagnóstico Tastto" → preenche nome/WhatsApp → confirma que
     apareceu uma linha nova em `pos_ifood_move_contatos` no Table Editor do Supabase.

## No dia do evento

- A tela do totem precisa ficar com `totem.html` aberto o evento inteiro (sem suspender/dormir).
- Precisa de wifi estável — o totem resincroniza sozinho a cada 30s como plano B se a conexão
  em tempo real cair, mas sem internet nenhuma ele para de atualizar.
- Cada celular só vota uma vez (guardado no navegador via `localStorage`) — se o participante
  limpar os dados do navegador ou usar outro aparelho, consegue votar de novo. Não há bloqueio
  no banco, é só fricção leve pra evitar voto duplicado por engano.

## Ver os leads depois

Os contatos que pediram o diagnóstico ficam em `pos_ifood_move_contatos`, visível só no
Table Editor do Supabase (logado como dono do projeto) — não tem policy de leitura pública,
então ninguém acessa essa lista pela chave pública do site.

## Categorias

Definidas em [`categorias.js`](categorias.js), compartilhado entre as duas páginas: Recorrência,
Margem, Aquisição, Delivery, Gestão, Dados — as mesmas alavancas que a Tastto já usa no
diagnóstico e no FIVE (ver `_contexto/empresa.md`).
