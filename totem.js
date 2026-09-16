(function () {
  'use strict';

  var SUPABASE_URL = 'https://tdwdpukgireablhrgfsh.supabase.co';
  var SUPABASE_ANON_KEY = 'sb_publishable_mVUZJcZPqcxKwmd_W9Mc5A_pDNZN3u_';
  var db = window.supabase ? window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY) : null;

  var rankingEl = document.getElementById('ranking');
  var totalEl = document.getElementById('total-respostas');
  var statusEl = document.getElementById('status-live');

  var linhas = {}; // categoria -> elementos DOM
  var contagem = {}; // categoria -> número de votos

  CATEGORIAS.forEach(function (cat) { contagem[cat.id] = 0; });

  function montarQr() {
    var urlVoto = new URL('vote.html', location.href).href;
    // eslint-disable-next-line no-new
    new QRCode(document.getElementById('qrcode'), {
      text: urlVoto,
      width: 168,
      height: 168,
      colorDark: '#150f28',
      colorLight: '#ffffff'
    });
  }

  function montarRanking() {
    CATEGORIAS.forEach(function (cat) {
      var linha = document.createElement('div');
      linha.className = 'linha';
      linha.innerHTML =
        '<span class="rotulo">' + cat.label + '</span>' +
        '<div class="trilha"><div class="barra"></div></div>' +
        '<span class="valor">0</span>';
      rankingEl.appendChild(linha);
      linhas[cat.id] = {
        wrap: linha,
        barra: linha.querySelector('.barra'),
        valor: linha.querySelector('.valor')
      };
    });
  }

  function renderizar() {
    var max = 0;
    var total = 0;
    CATEGORIAS.forEach(function (cat) {
      max = Math.max(max, contagem[cat.id]);
      total += contagem[cat.id];
    });

    var idsOrdenados = CATEGORIAS.map(function (c) { return c.id; })
      .sort(function (a, b) { return contagem[b] - contagem[a]; });

    CATEGORIAS.forEach(function (cat) {
      var el = linhas[cat.id];
      // Barra representa a fatia do total de respostas, não a posição relativa ao líder.
      var pct = total > 0 ? (contagem[cat.id] / total) * 100 : 0;
      el.barra.style.width = pct + '%';
      el.valor.textContent = contagem[cat.id];
      // Empate no topo também conta como líder — todo mundo empatado fica em destaque.
      el.wrap.classList.toggle('lider', max > 0 && contagem[cat.id] === max);
      el.wrap.style.order = idsOrdenados.indexOf(cat.id);
    });

    totalEl.textContent = total;
  }

  var ultimaRequisicao = 0;

  async function carregarTudo() {
    if (!db) { statusEl.textContent = 'supabase indisponível'; return; }
    var minhaRequisicao = ++ultimaRequisicao;
    var resp = await db.from('pos_ifood_move_votos').select('categoria');

    // Uma resposta mais antiga pode chegar depois de uma mais nova (rede do evento
    // é instável) — se não for mais a última pedida, ignora pra não voltar no tempo.
    if (minhaRequisicao !== ultimaRequisicao) { return; }

    if (resp && resp.error) {
      console.error('Erro ao buscar votos:', resp.error);
      statusEl.textContent = 'erro: ' + resp.error.message;
      return;
    }
    var novasContagens = {};
    CATEGORIAS.forEach(function (cat) { novasContagens[cat.id] = 0; });
    ((resp && resp.data) || []).forEach(function (row) {
      if (novasContagens.hasOwnProperty(row.categoria)) { novasContagens[row.categoria]++; }
    });
    contagem = novasContagens;
    renderizar();
  }

  function assinarTempoReal() {
    if (!db) { return; }
    db.channel('pos-ifood-move-votos')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'pos_ifood_move_votos' }, function () {
        // Refaz a contagem inteira a partir do banco em vez de incrementar localmente —
        // incrementar podia divergir do banco se o resync periódico resolvesse fora de ordem.
        carregarTudo();
      })
      .subscribe(function (status) {
        var aoVivo = status === 'SUBSCRIBED';
        statusEl.textContent = aoVivo ? 'ao vivo' : status.toLowerCase();
        statusEl.classList.toggle('ao-vivo', aoVivo);
      });
  }

  montarQr();
  montarRanking();
  carregarTudo();
  assinarTempoReal();

  // Ressincroniza periodicamente — rede do evento pode cair sem avisar.
  setInterval(carregarTudo, 30000);
})();
