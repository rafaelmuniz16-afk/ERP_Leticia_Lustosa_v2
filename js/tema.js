// ==========================================================================
// CÉREBRO DEFINITIVO: TEMAS, MASCOTES, FRASES E EASTER EGGS
// ==========================================================================

const THEME_STYLE_KEY = 'erp_current_theme_style';
const THEME_LAYOUT_KEY = 'erp_current_layout_mode';

const THEMES_CONFIG = {
  'claro': {
    nome: 'Rosa Fofo (Oficial)', img: 'LigthTheme.jpg', audio: 'musica.mp3',
    titulo: '💖 TE AMO, LETÍCIA! 💖',
    msg: 'Você achou o segredo do unicórnio! ✨🦄<br>Obrigado por fazer minha vida infinitamente mais leve e feliz.<br><span style="color:#d85c9d;font-weight:800;">Eu te amo com todo o meu coração! 💕🌸</span>',
    btnColor: '#df6ba6', bg: '#fff8fc',
    frases: ['Clicou em mim! 💖', 'Glitter e foco ativados! ✨', 'A Letícia é a melhor do mundo! 🌸', 'O Rafa te ama infinitamente! 💕'],
    chart: ['#dc3f5a', '#d97706', '#0f9f6e'], line: '#d85c9d', lineBg: 'rgba(216,92,157,.15)'
  },
  'escuro': {
    nome: 'Enterprise Dark', img: 'DarkTheme.png', audio: 'musica.mp3',
    titulo: 'PARA O MEU AMOR, LETÍCIA ✨💖',
    msg: 'Você desbloqueou o coração deste sistema... e o meu também! 🌌<br>Letícia, ver a sua inteligência, determinação e foco profissional me enche de orgulho.<br><span style="color:#38bdf8;font-weight:800;">Eu te amo hoje e para sempre! 💕🚀</span>',
    btnColor: '#2563eb', bg: '#0e1424',
    frases: ['Núcleo Gemini operando com excelência. ✦', 'Produtividade e foco em nível máximo, Letícia! 📊', 'O Rafa tem um orgulho imenso de você! 💖'],
    chart: ['#f43f5e', '#f59e0b', '#10b981'], line: '#38bdf8', lineBg: 'rgba(56, 189, 248, 0.12)'
  },
  'anonovo': {
    nome: 'Réveillon 2026', img: 'AnoNovo.jpg', audio: 'AnoNovo.mp3',
    titulo: '✨ FELIZ ANO NOVO, MEU AMOR! ✨',
    msg: 'Você encontrou o segredo das taças da virada! 🥂🎆<br>Que este novo ano chegue transbordando saúde e conquistas de metas.<br><span style="color:#f5d179;font-weight:800;">Letícia, eu te amo com todo o meu coração! 💖🍾</span>',
    btnColor: '#bd8e2b', bg: '#090e1a',
    frases: ['Brinde à melhor mulher do mundo! 🥂', 'Que 2026 venha com tudo! ✨', 'O Rafa te ama pra sempre! 💕'],
    chart: ['#ff5c75', '#ffb03a', '#3dd598'], line: '#f5d179', lineBg: 'rgba(245, 209, 121, 0.1)'
  },
  'cyberpunk': {
    nome: 'Cyberpunk Protocol', img: 'Cyberpunk.png', audio: 'Cyberpunk.mp3',
    titulo: '⚡ PROTOCOLO ETERNO: TE AMO, LETÍCIA! 💙',
    msg: 'Você acessou o núcleo de dados secreto da matriz! 🤖⚡💙<br>Em qualquer linha temporal ou realidade virtual, você é minha conexão pura.<br><span style="color:#00f3ff;font-weight:800;">Letícia, meu amor por você é um código imutável! ⚡💖</span>',
    btnColor: '#00f3ff', bg: '#060b17',
    frases: ['Sinal neural 100% sincronizado! ⚡', 'A Letícia hackeou meu coração! 🤖', 'O Rafa te ama em todas as matrizes! 💕'],
    chart: ['#ff0055', '#ffe600', '#00ff88'], line: '#00f3ff', lineBg: 'rgba(0, 243, 255, 0.12)'
  },
  'festajunina': {
    nome: 'Festa Junina (São João)', img: 'SaoJoao.png', audio: 'SaoJoao.mp3',
    titulo: '💌 CORREIO ELEGANTE DE SÃO JOÃO 💌',
    msg: 'Olha a fogueira queimando o meu coração por você, Letícia! 🌽🔥<br>Nem toda sanfona do Nordeste toca uma música tão bonita quanto a nossa história.<br><span style="color:#d9381e;font-weight:800;">O Rafa te ama infinito, meu bem! 💖🤠🪗</span>',
    btnColor: '#ea580c', bg: '#fffdf7',
    frases: ['Anarriê! Puxa o fole, Letícia! 🪗', 'Olha a chuva de encerramento! ... É mentiraaa! 🌽', 'O Rafa é doidinho de amor por você! 💖'],
    chart: ['#dc2626', '#f59e0b', '#16a34a'], line: '#ea580c', lineBg: 'rgba(234, 88, 12, 0.12)'
  },
  'halloween': {
    nome: 'Halloween Spooky', img: 'Halloween.png', audio: 'Halloween.mp3',
    titulo: '🎃 FEITIÇO ETERNO: TE AMO, LETÍCIA! 💜',
    msg: 'Você encontrou o grande feitiço da abóbora! 🎃👻<br>Nenhum monstro ou processo difícil é páreo pra mulher incrível que você é.<br><span style="color:#ff781f;font-weight:800;">Letícia, meu amor por você atravessa todas as vidas! 💖🕯️</span>',
    btnColor: '#ff781f', bg: '#0d0717',
    frases: ['Gostosuras ou travessuras? 🍬', 'A Letícia bota o terror na concorrência! 🎃', 'O Rafa te ama mais que poção mágica! 💕'],
    chart: ['#ff3366', '#ffaa00', '#00ff9d'], line: '#ff781f', lineBg: 'rgba(255, 120, 31, 0.12)'
  },
  'pascoa': {
    nome: 'Páscoa Encantada', img: 'Pascoa.png', audio: 'Pascoa.mp3',
    titulo: '🐰 OVO ENCANTADO: TE AMO, LETÍCIA! 💖',
    msg: 'Você encontrou o ninho mais florido da Páscoa! 🐰🌷🥚<br>A sua luz e o seu sorriso transformam qualquer dia comum na mais doce celebração.<br><span style="color:#f472b6;font-weight:800;">Letícia, eu te amo com todo o meu coração! 🌸💖</span>',
    btnColor: '#f472b6', bg: '#fffbfc',
    frases: ['Flores e cenourinhas pra você! 🌷', 'A Letícia é a mulher mais linda do mundo! 🌸', 'O Rafa te ama daqui até o céu! 💕'],
    chart: ['#f472b6', '#fbbf24', '#34d399'], line: '#f472b6', lineBg: 'rgba(244, 114, 182, 0.12)'
  },
  'natal': {
    nome: 'Especial de Natal', img: 'Natal.png', audio: 'Natal.mp3',
    titulo: '🎄 FELIZ NATAL, MEU AMOR! 🎅❤️',
    msg: 'Você encontrou o presente secreto do Papai Noel! 🎁❄️<br>Passar mais um ano ao seu lado é a minha maior bênção e meu maior presente.<br><span style="color:#c41e3a;font-weight:800;">Eu te amo com todo o meu coração! 💕🎄✨</span>',
    btnColor: '#c41e3a', bg: '#ffffff',
    frases: ['Ho Ho Ho! Feliz Natal adiantado! 🎅✨', 'A Letícia merece todos os presentes do trenó! 🎁💖', 'O melhor presente do Rafa é você! 🌟❤️'],
    chart: ['#c41e3a', '#d97706', '#165b33'], line: '#165b33', lineBg: 'rgba(22,91,51,.12)'
  },
  'terror': {
    nome: 'Pesadelo Profundo', video: 'JumpScare.mp4',
    frases: ['Eu nunca fecho meu olho... 👁️', 'Você sente o calafrio? 🩸', 'O Rafa te ama além da morte! 🖤'],
    chart: ['#ff0022', '#ff9900', '#00ff73'], line: '#e6001a', lineBg: 'rgba(230, 0, 26, 0.15)'
  }
};

let temaAudio = new Audio();
temaAudio.preload = 'auto';

function aplicarTema(tNome) {
  const chaves = Object.keys(THEMES_CONFIG);
  chaves.forEach(t => document.body.classList.remove(`theme-${t}`));
  document.body.classList.add(`theme-${tNome}`);
  localStorage.setItem(THEME_STYLE_KEY, tNome);

  if (tNome !== 'terror') {
    temaAudio.src = `./${THEMES_CONFIG[tNome].audio}`;
    temaAudio.load();
  }

  // Recalcula cores dos gráficos na hora
  if (typeof renderAll === 'function') renderAll();
}

function aplicarLayout(lNome) {
  const btn = document.getElementById('btnQuickToggle');
  if (lNome === 'vertical') {
    document.body.classList.add('layout-vertical');
    if (btn) btn.textContent = '🖥️ Tela Paisagem';
  } else {
    document.body.classList.remove('layout-vertical');
    if (btn) btn.textContent = '📱 Tela Vertical';
  }
  localStorage.setItem(THEME_LAYOUT_KEY, lNome);
}

function abrirModalConfiguracoes() {
  const tAtual = localStorage.getItem(THEME_STYLE_KEY) || 'claro';
  const lAtual = localStorage.getItem(THEME_LAYOUT_KEY) || 'paisagem';

  const htmlCards = Object.entries(THEMES_CONFIG).map(([id, cfg]) => `
    <div class="theme-card-option ${tAtual === id ? 'active' : ''}" onclick="window.escolherTemaModal('${id}')">
      <strong style="font-size:12px;">${cfg.nome}</strong>
    </div>
  `).join('');

  Swal.fire({
    title: '<span style="font-size:18px;font-weight:800;">⚙ Configurações do ERP</span>',
    html: `
      <div style="text-align:left;display:grid;gap:14px;margin-top:10px;">
        <div>
          <label style="font-size:11px;font-weight:800;text-transform:uppercase;color:var(--text);display:block;margin-bottom:6px;">Orientação</label>
          <div style="display:flex;gap:10px;">
            <button id="btnOptPaisagem" class="btn ${lAtual === 'paisagem' ? 'btn-primary' : 'btn-soft'}" style="flex:1;justify-content:center;">🖥️ Paisagem</button>
            <button id="btnOptVertical" class="btn ${lAtual === 'vertical' ? 'btn-primary' : 'btn-soft'}" style="flex:1;justify-content:center;">📱 Vertical</button>
          </div>
        </div>
        <div>
          <label style="font-size:11px;font-weight:800;text-transform:uppercase;color:var(--text);display:block;margin-bottom:6px;">Temas Visuais</label>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">${htmlCards}</div>
        </div>
      </div>
    `,
    showConfirmButton: false, showCloseButton: true, background: 'var(--surface)', color: 'var(--text)',
    didOpen: () => {
      document.getElementById('btnOptPaisagem').addEventListener('click', () => { aplicarLayout('paisagem'); Swal.close(); });
      document.getElementById('btnOptVertical').addEventListener('click', () => { aplicarLayout('vertical'); Swal.close(); });
    }
  });
}

window.escolherTemaModal = function(id) {
  aplicarTema(id);
  toast('success', `Tema ${THEMES_CONFIG[id].nome} ativado!`);
  Swal.close();
};

// SUBSTITUIÇÃO LIMPA DAS CORES DOS GRÁFICOS
const originalRenderCharts = window.renderCharts;
window.renderCharts = function(c) {
  const tAtual = localStorage.getItem(THEME_STYLE_KEY) || 'claro';
  const cfg = THEMES_CONFIG[tAtual];

  if(charts.tipos) charts.tipos.destroy();
  charts.tipos = new Chart(document.getElementById('tiposChart'), {
    type: 'doughnut',
    data: { labels: ['Ônus','Acordo','Êxito'], datasets: [{ data: [c.onus, c.acordo, c.exito], backgroundColor: cfg.chart, borderWidth: 0 }] },
    options: { responsive: true, maintainAspectRatio: false, cutout: '70%', plugins: { legend: { position: 'bottom', labels: { usePointStyle: true, boxWidth: 8, font: {size: 10}, color: 'var(--muted)' } } } }
  });

  const days = Object.keys(c.perDay).sort((a,b) => parseInt(a) - parseInt(b));
  if(charts.linha) charts.linha.destroy();
  charts.linha = new Chart(document.getElementById('linhaChart'), {
    type: 'line',
    data: { labels: days.map(d => d + '/' + c.month), datasets: [{ data: days.map(d => c.perDay[d]), borderColor: cfg.line, backgroundColor: cfg.lineBg, fill: true, tension: .32, pointRadius: 3, pointBackgroundColor: cfg.line }] },
    options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { x: { grid: { display: false }, ticks: { font: { size: 9 }, color: 'var(--muted)' } }, y: { beginAtZero: true, ticks: { stepSize: 1, font: { size: 9 }, color: 'var(--muted)' } } } }
  });
};

// ==========================================================================
// CLIQUES NOS MASCOTES (FALAS E EASTER EGG DE CADA TEMA)
// ==========================================================================
let easterClicks = 0;
let falaResetTimer = null;

document.addEventListener('click', e => {
  const t = e.target;
  const mascot = t.closest('.mascot-trigger');
  if (!mascot) return;

  easterClicks++;
  const tAtual = localStorage.getItem(THEME_STYLE_KEY) || 'claro';
  const cfg = THEMES_CONFIG[tAtual];
  const bubble = mascot.querySelector('.bubble');

  // Alterna as falas originais criadas pelo Rafa
  if (bubble && cfg.frases) {
    if (easterClicks === 10) {
      bubble.textContent = 'SURPRESA! 💖';
    } else if (easterClicks >= 7) {
      bubble.textContent = `Faltam ${10 - easterClicks} cliques pro segredo... 👀`;
    } else {
      bubble.textContent = cfg.frases[Math.floor(Math.random() * cfg.frases.length)];
    }
    clearTimeout(falaResetTimer);
    falaResetTimer = setTimeout(() => {
      bubble.textContent = 'Oie, Letícia! ✨';
    }, 2800);
  }

  // DISPARO DO EASTER EGG (10 CLIQUES)
  if (easterClicks >= 10) {
    easterClicks = 0;

    // REGRA 1: TERROR (JUMPSCARE EM VÍDEO)
    if (tAtual === 'terror') {
      Swal.fire({
        html: `<video src="./${cfg.video}" autoplay style="width:100%;border-radius:12px;box-shadow:0 0 50px #e6001a;"></video>`,
        background: '#000', showConfirmButton: false, allowOutsideClick: false, timer: 3800
      });
      return;
    }

    // REGRA 2: DEMAIS 8 TEMAS (FOTO DEDICADA + MÚSICA ESPECÍFICA)
    Swal.fire({
      title: `<span style="font-size:24px;font-weight:800;color:${cfg.btnColor}">${cfg.titulo}</span>`,
      html: `
        <div style="margin: 14px 0;">
          <img src="./${cfg.img}" style="width:100%;max-width:320px;border-radius:20px;border:3px solid ${cfg.btnColor};box-shadow:0 12px 35px rgba(0,0,0,0.5);">
        </div>
        <p style="font-size:14px;font-weight:600;line-height:1.6;margin-top:14px;color:var(--text);">${cfg.msg}</p>
      `,
      background: cfg.bg, confirmButtonText: 'Eu te amo infinito! 🥹💖', confirmButtonColor: cfg.btnColor,
      willOpen: () => {
        temaAudio.currentTime = 0;
        temaAudio.play().catch(e => console.log('Autoplay bloqueado', e));
      },
      didClose: () => {
        temaAudio.pause();
        temaAudio.currentTime = 0;
      }
    });
  }
});

// Inicialização segura
document.addEventListener('DOMContentLoaded', () => {
  const tSalvo = localStorage.getItem(THEME_STYLE_KEY) || 'claro';
  const lSalvo = localStorage.getItem(THEME_LAYOUT_KEY) || 'paisagem';
  aplicarTema(tSalvo);
  aplicarLayout(lSalvo);

  // Injeta o botão Configurações na barra lateral
  const nav = document.querySelector('.sidebar .nav');
  if (nav && !document.getElementById('btnNavConfig')) {
    const btn = document.createElement('button');
    btn.className = 'nav-btn'; btn.id = 'btnNavConfig';
    btn.innerHTML = '<span class="nav-icon">⚙</span><span>Configurações</span>';
    btn.addEventListener('click', abrirModalConfiguracoes);
    nav.appendChild(btn);
  }

  // Atalho do topo de alternar layout
  const btnTopo = document.getElementById('btnQuickToggle');
  if (btnTopo) {
    btnTopo.addEventListener('click', () => {
      const cur = localStorage.getItem(THEME_LAYOUT_KEY) || 'paisagem';
      aplicarLayout(cur === 'paisagem' ? 'vertical' : 'paisagem');
    });
  }
});
