# Totem — Pós iFood Move (2ª edição)

**No ar em:** https://artticodesigner.github.io/totem-pos-ifood-move/
Publicado como repositório próprio (`artticodesigner/totem-pos-ifood-move`), separado deste
workspace — mesmo padrão do `identidade-visual/`. Pra atualizar depois de editar aqui, copie os
arquivos pro repositório publicado e dê push (ou peça pro Claude fazer isso de novo).

**Cache:** `styles.css`, `categorias.js`, `totem.js` e `vote.js` são carregados com `?v=4` no
final da URL (em `totem.html`/`vote.html`). Isso existe só pra forçar o navegador/GitHub a pegar
a versão nova depois de um update — sem isso, o arquivo pode ficar "grudado" em cache com o
mesmo nome e conteúdo antigo. **Toda vez que algum desses 4 arquivos for editado, sobe o número
da versão** (`?v=5`, `?v=6`...) nos dois HTMLs, senão a mudança pode não aparecer pro usuário
mesmo já publicada.

Ativação de totem: os participantes escaneiam um QR code, respondem no celular qual é o
maior desafio do restaurante deles, e o resultado aparece ao vivo na tela do totem.

Duas páginas, mesmo projeto Supabase do `identidade-visual/` (só uma tabela nova):

- **`totem.html`** — vai na tela grande. Mostra o QR code e o ranking ao vivo.
- **`vote.html`** — é pra onde o QR code aponta. Abre no celular do participante.

## Configurar (uma vez só)

1. **Criar a tabela no Supabase**
   - No SQL Editor do projeto (o mesmo do `identidade-visual/`), cole o conteúdo de
     [`supabase-setup.sql`](supabase-setup.sql) e rode.
   - Isso cria `pos_ifood_move_votos`, com tempo real ligado.

2. **Publicar as páginas**
   - Suba essa pasta pro GitHub Pages (mesmo jeito que `identidade-visual/` foi publicado).
   - `totem.html` e `vote.html` precisam estar na mesma pasta publicada — o QR code é gerado
     automaticamente apontando pro `vote.html` ao lado, não precisa configurar URL na mão.

3. **Testar antes do evento**
   - Abra `totem.html` numa tela (ou notebook conectado na TV) e `vote.html` no seu celular.
   - Vote e confira se a barra da categoria sobe no totem em poucos segundos.

## No dia do evento

- A tela do totem precisa ficar com `totem.html` aberto o evento inteiro (sem suspender/dormir).
- Precisa de wifi estável — o totem resincroniza sozinho a cada 30s como plano B se a conexão
  em tempo real cair, mas sem internet nenhuma ele para de atualizar.
- Cada celular só vota uma vez (guardado no navegador via `localStorage`) — se o participante
  limpar os dados do navegador ou usar outro aparelho, consegue votar de novo. Não há bloqueio
  no banco, é só fricção leve pra evitar voto duplicado por engano.

## Categorias

Definidas em [`categorias.js`](categorias.js), compartilhado entre as duas páginas: Recorrência,
Margem, Aquisição, Delivery, Gestão, Dados — as mesmas alavancas que a Tastto já usa no
diagnóstico e no FIVE (ver `_contexto/empresa.md`).
