// ============================================================
// CÉREBRO MULTITEMA: LAYOUT, EASTER EGGS E ANIMAÇÕES
// ============================================================

const THEME_STYLE_KEY = 'erp_current_theme_style';
const THEME_LAYOUT_KEY = 'erp_current_layout_mode';

const THEMES = {
  'claro': { nome: 'Rosa Fofo', img: 'foto.jpg', audio: 'musica.mp3', title: 'TE AMO, LETÍCIA! 💖', bg: '#fff8fc', color: '#d85c9d', chart: ['#dc3f5a','#d97706','#0f9f6e'], line: '#d85c9d', lineBg: 'rgba(216,92,157,.15)' },
  'escuro': { nome: 'Aurora Prime (Escuro)', img: 'DarkTheme.png', audio: 'musica.mp3', title: 'PARA O MEU AMOR, LETÍCIA ✨', bg: '#0e1424', color: '#38bdf8', chart: ['#f43f5e','#f59e0b','#10b981'], line: '#38bdf8', lineBg: 'rgba(56, 189, 248, 0.12)' },
  'anonovo': { nome: 'Réveillon', img: 'AnoNovo.jpg', audio: 'AnoNovo.mp3', title: 'FELIZ ANO NOVO, MEU AMOR! ✨', bg: '#090e1a', color: '#f5d179', chart: ['#ff5c75','#ffb03a','#3dd598'], line: '#f5d179', lineBg: 'rgba(245, 209, 121, 0.1)' },
  'cyberpunk': { nome: 'Cyberpunk', img: 'Cyberpunk.png', audio: 'Cyberpunk.mp3', title: 'PROTOCOLO ETERNO: TE AMO! ⚡', bg: '#060b17', color: '#00f3ff', chart: ['#ff0055','#ffe600','#00ff88'], line: '#00f3ff', lineBg: 'rgba(0, 243, 255, 0.12)' },
  'festajunina': { nome: 'Festa Junina', img: 'SaoJoao.png', audio: 'SaoJoao.mp3', title: 'CORREIO ELEGANTE 💌', bg: '#fffdf7', color: '#d9381e', chart: ['#dc2626','#f59e0b','#16a34a'], line: '#ea580c', lineBg: 'rgba(234, 88, 12, 0.12)' },
  'halloween': { nome: 'Halloween', img: 'Halloween.png', audio: 'Halloween.mp3', title: 'FEITIÇO ETERNO: TE AMO! 🎃', bg: '#0d0717', color: '#ff781f', chart: ['#ff3366','#ffaa00','#00ff9d'], line: '#ff781f', lineBg: 'rgba(255, 120, 31, 0.12)' },
  'pascoa': { nome: 'Páscoa', img: 'Pascoa.png', audio: 'Pascoa.mp3', title: 'OVO ENCANTADO: TE AMO! 🐰', bg: '#fffbfc', color: '#f472b6', chart: ['#f472b6','#fbbf24','#34d399'], line: '#f472b6', lineBg: 'rgba(244, 114, 182, 0.12)' },
  'natal': { nome: 'Especial de Natal', img: 'Natal.png', audio: 'Natal.mp3', title: 'FELIZ NATAL, MEU AMOR! 🎅', bg: '#ffffff', color: '#c41e3a', chart: ['#c41e3a', '#d97706', '#165b33'], line: '#165b33', lineBg: 'rgba(22,91,51,.12)' },
  'terror': { nome: 'Pesadelo Profundo', video: 'JumpScare.mp4', title: 'PACTO SANGUÍNEO 🫀', bg: '#000000', color: '#e6001a', chart: ['#ff0022','#ff9900','#00ff73'], line: '#e6001a', lineBg: 'rgba(230, 0, 26, 0.15)' }
};

let currentAudio = new Audio();
currentAudio.preload = 'auto';

function aplicarTema(nomeTema) {
  Object.keys(THEMES).forEach(t => document.body.classList.remove(`theme-${t}`));
  document.body.classList.add(`theme-${nomeTema}`);
  localStorage.setItem(THEME_STYLE_KEY, nomeTema);

  if (nomeTema !== 'terror') {
    currentAudio.src = `./${THEMES[nomeTema].audio}`;
  }

  // Atualiza cores dos gráficos se já estiverem renderizados
  if (typeof renderAll === 'function') renderAll();
}

function aplicarLayout(modo) {
  if (modo === 'vertical') document.body.classList.add('layout-vertical');
  else document.body.classList.remove('layout-vertical');
  localStorage.setItem(THEME_LAYOUT_KEY, modo);
}

// INJEÇÃO DA GALERIA DE TEMAS
function abrirModalConfiguracoes() {
  const tAtual = localStorage.getItem(THEME_STYLE_KEY) || 'claro';
  const lAtual = localStorage.getItem(THEME_LAYOUT_KEY) || 'paisagem';

  const gridTemas = Object.entries(THEMES).map(([id, info]) => `
    <div class="theme-card-option ${tAtual === id ? 'active' : ''}" onclick="window.selecionarTemaPop('${id}')" style="border-color:${tAtual === id ? info.color : ''}">
      <span style="display:inline-block;width:12px;height:12px;border-radius:50%;background:${info.color};margin-right:8px;"></span>
      <strong style="color:var(--text);font-size:12px;">${info.nome}</strong>
    </div>
  `).join('');

  Swal.fire({
    title: '<span style="font-size:18px;font-weight:800;">⚙ Configurações Visuais</span>',
    html: `
      <div style="text-align:left;font-size:13px;display:grid;gap:16px;margin-top:10px;">
        <div>
          <label style="font-weight:800;color:var(--text);text-transform:uppercase;font-size:11px;letter-spacing:1px;margin-bottom:8px;display:block;">Orientação da Tela</label>
          <div style="display:flex;gap:10px;">
            <button id="optPaisagem" class="btn ${lAtual === 'paisagem' ? 'btn-primary' : 'btn-soft'}" style="flex:1;justify-content:center;">🖥️ Paisagem</button>
            <button id="optVertical" class="btn ${lAtual === 'vertical' ? 'btn-primary' : 'btn-soft'}" style="flex:1;justify-content:center;">📱 Vertical</button>
          </div>
        </div>
        <div>
          <label style="font-weight:800;color:var(--text);text-transform:uppercase;font-size:11px;letter-spacing:1px;margin-bottom:8px;display:block;">Galeria de Temas</label>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;">${gridTemas}</div>
        </div>
      </div>
    `,
    showConfirmButton: false,
    showCloseButton: true,
    background: 'var(--surface)',
    color: 'var(--text)',
    didOpen: () => {
      document.getElementById('optPaisagem').addEventListener('click', () => { aplicarLayout('paisagem'); Swal.close(); });
      document.getElementById('optVertical').addEventListener('click', () => { aplicarLayout('vertical'); Swal.close(); });
    }
  });
}

window.selecionarTemaPop = function(nome) {
  aplicarTema(nome);
  toast('success', `Tema atualizado!`);
  Swal.close();
};

// HACKEANDO OS GRÁFICOS PARA OBEDECEREM O TEMA ATIVO
const originalRenderCharts = window.renderCharts;
window.renderCharts = function(c) {
  const temaAtual = localStorage.getItem(THEME_STYLE_KEY) || 'claro';
  const conf = THEMES[temaAtual];

  if(charts.tipos) charts.tipos.destroy();
  charts.tipos = new Chart(document.getElementById('tiposChart'), {
    type: 'doughnut',
    data: { labels: ['Ônus','Acordo','Êxito'], datasets: [{ data: [c.onus, c.acordo, c.exito], backgroundColor: conf.chart, borderWidth: 0 }] },
    options: { responsive: true, maintainAspectRatio: false, cutout: '70%', plugins: { legend: { position: 'bottom', labels: { usePointStyle: true, boxWidth: 8, font: {size: 10}, color: 'var(--muted)' } } } }
  });

  const days = Object.keys(c.perDay).sort((a,b) => parseInt(a) - parseInt(b));
  if(charts.linha) charts.linha.destroy();
  charts.linha = new Chart(document.getElementById('linhaChart'), {
    type: 'line',
    data: { labels: days.map(d => d + '/' + c.month), datasets: [{ data: days.map(d => c.perDay[d]), borderColor: conf.line, backgroundColor: conf.lineBg, fill: true, tension: .32, pointRadius: 3, pointBackgroundColor: conf.line }] },
    options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { x: { grid: { display: false }, ticks: { font: { size: 9 }, color: 'var(--muted)' } }, y: { beginAtZero: true, ticks: { stepSize: 1, font: { size: 9 }, color: 'var(--muted)' } } } }
  });
};

// EASTER EGG (10 CLIQUES)
let mascotClicks = 0;
document.addEventListener('click', e => {
  const t = e.target;
  if (t.closest('.mascot-trigger')) {
    mascotClicks++;
    const temaAtual = localStorage.getItem(THEME_STYLE_KEY) || 'claro';
    const config = THEMES[temaAtual];
    
    const bubble = t.closest('.mascot-trigger').querySelector('.bubble');
    if (bubble) {
      bubble.textContent = `Faltam ${10 - mascotClicks} cliques... 👀`;
      setTimeout(() => { bubble.textContent = 'Surpresa oculta ✨'; }, 2000);
    }

    if (mascotClicks >= 10) {
      mascotClicks = 0;
      if (temaAtual === 'terror') {
        Swal.fire({
          html: `<video src="./${config.video}" autoplay style="width:100%;border-radius:12px;box-shadow:0 0 40px #e6001a;"></video>`,
          background: '#000', showConfirmButton: false, allowOutsideClick: false, timer: 3500
        });
      } else {
        Swal.fire({
          title: `<span style="font-weight:800;font-size:24px;color:${config.color}">${config.title}</span>`,
          html: `<div style="margin: 15px 0;"><img src="./${config.img}" style="width:100%;max-width:320px;border-radius:20px;border:3px solid ${config.color};box-shadow:0 10px 30px rgba(0,0,0,0.5);"></div><p style="font-size:14px;font-weight:600;margin-top:15px;color:var(--text);">Você ativou a surpresa do tema ${config.nome}! ✨💖</p>`,
          background: config.bg, confirmButtonText: 'Eu te amo! 💖', confirmButtonColor: config.color,
          willOpen: () => { currentAudio.currentTime = 0; currentAudio.play().catch(e => {}); },
          didClose: () => { currentAudio.pause(); }
        });
      }
    }
  }
});

// Inicialização e injeção do botão de configurações
document.addEventListener('DOMContentLoaded', () => {
  const temaSalvo = localStorage.getItem(THEME_STYLE_KEY) || 'claro';
  const layoutSalvo = localStorage.getItem(THEME_LAYOUT_KEY) || 'paisagem';
  aplicarTema(temaSalvo);
  aplicarLayout(layoutSalvo);

  const nav = document.querySelector('.sidebar .nav');
  if (nav && !document.getElementById('btnNavConfig')) {
    const btn = document.createElement('button');
    btn.className = 'nav-btn'; btn.id = 'btnNavConfig';
    btn.innerHTML = '<span class="nav-icon">⚙</span><span>Configurações</span>';
    btn.addEventListener('click', abrirModalConfiguracoes);
    nav.appendChild(btn);
  }
});
