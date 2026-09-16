(function () {
  'use strict';

  // Mesmo projeto Supabase do identidade-visual/ — só tabelas novas (ver supabase-setup.sql).
  var SUPABASE_URL = 'https://tdwdpukgireablhrgfsh.supabase.co';
  var SUPABASE_ANON_KEY = 'sb_publishable_mVUZJcZPqcxKwmd_W9Mc5A_pDNZN3u_';
  var db = window.supabase ? window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY) : null;

  var STORAGE_KEY = 'pos-ifood-move-voto';

  var viewVote = document.getElementById('view-vote');
  var viewResult = document.getElementById('view-result');
  var opcoesEl = document.getElementById('opcoes');
  var resultadoLabel = document.getElementById('resultado-label');
  var resultadoBarra = document.getElementById('resultado-barra');
  var resultadoPct = document.getElementById('resultado-pct');
  var resultadoTotal = document.getElementById('resultado-total');
  var erroVoto = document.getElementById('erro-voto');

  function renderOpcoes() {
    CATEGORIAS.forEach(function (cat, i) {
      var btn = document.createElement('button');
      btn.className = 'opcao';
      btn.type = 'button';
      btn.dataset.categoria = cat.id;
      btn.innerHTML =
        '<span class="num">0' + (i + 1) + '</span>' +
        '<span class="label">' + cat.label + '</span>';
      btn.addEventListener('click', function () { votar(cat.id); });
      opcoesEl.appendChild(btn);
    });
  }

  function labelDe(id) {
    var cat = CATEGORIAS.filter(function (c) { return c.id === id; })[0];
    return cat ? cat.label : id;
  }

  async function votar(categoriaId) {
    if (!db) {
      mostrarErroVoto('Não consegui conectar ao Supabase. Confira SUPABASE_URL/KEY em vote.js.');
      return;
    }
    erroVoto.hidden = true;
    Array.prototype.forEach.call(opcoesEl.querySelectorAll('.opcao'), function (b) { b.disabled = true; });

    var resp = await db.from('pos_ifood_move_votos').insert({ categoria: categoriaId });

    if (resp && resp.error) {
      console.error('Erro ao registrar voto:', resp.error);
      Array.prototype.forEach.call(opcoesEl.querySelectorAll('.opcao'), function (b) { b.disabled = false; });
      mostrarErroVoto('Não deu pra registrar seu voto (' + resp.error.message + '). Confira se rodou o supabase-setup.sql.');
      return;
    }

    try {
      localStorage.setItem(STORAGE_KEY, categoriaId);
    } catch (e) { /* modo privado — segue sem lembrar */ }

    mostrarResultado(categoriaId);
  }

  function mostrarErroVoto(msg) {
    erroVoto.textContent = msg;
    erroVoto.hidden = false;
  }

  async function mostrarResultado(categoriaId) {
    resultadoLabel.textContent = labelDe(categoriaId);

    // O voto já foi registrado nesse ponto — uma falha aqui é só a estatística
    // de %, então não pode travar a confirmação do voto pro participante.
    if (db) {
      try {
        var todas = await db.from('pos_ifood_move_votos').select('categoria');
        if (todas && todas.error) { throw todas.error; }
        var linhas = (todas && todas.data) || [];
        var total = linhas.length;
        var doGrupo = linhas.filter(function (r) { return r.categoria === categoriaId; }).length;
        var pct = total > 0 ? Math.round((doGrupo / total) * 100) : 100;

        resultadoPct.textContent = pct + '%';
        resultadoTotal.textContent = total + (total === 1 ? ' resposta' : ' respostas');
        requestAnimationFrame(function () { resultadoBarra.style.width = pct + '%'; });
      } catch (e) {
        console.error('Erro ao buscar votos:', e);
        resultadoPct.textContent = '—';
        resultadoTotal.textContent = 'voto registrado';
      }
    }

    viewVote.hidden = true;
    viewResult.hidden = false;
  }

  renderOpcoes();

  // Se já votou nesse celular, pula direto pro resultado (evita voto duplicado).
  (function restaurarVoto() {
    var votoSalvo;
    try { votoSalvo = localStorage.getItem(STORAGE_KEY); } catch (e) { votoSalvo = null; }
    if (votoSalvo) { mostrarResultado(votoSalvo); }
  })();
})();
