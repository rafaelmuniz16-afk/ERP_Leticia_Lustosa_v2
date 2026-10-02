// ============================================================
// GERENCIADOR CENTRAL DE TEMAS, LAYOUT E EASTER EGGS
// ============================================================

const THEME_STYLE_KEY = 'erp_current_theme_style';
const THEME_LAYOUT_KEY = 'erp_current_layout_mode';

// Mapeamento dos 9 temas e seus respectivos arquivos (Imagens, Áudio e Vídeo)
const THEME_ASSETS = {
  'claro': { nome: 'Claro', img: 'LigthTheme.jpg', audio: 'musica.mp3', titulo: 'TE AMO, LETÍCIA! 💖', bg: '#ffffff', color: '#2563eb' },
  'escuro': { nome: 'Escuro', img: 'DarkTheme.png', audio: 'musica.mp3', titulo: 'TE AMO, LETÍCIA! 💖', bg: '#0e1424', color: '#38bdf8' },
  'anonovo': { nome: 'Ano Novo', img: 'AnoNovo.jpg', audio: 'AnoNovo.mp3', titulo: 'FELIZ ANO NOVO, MEU AMOR! ✨', bg: '#090e1a', color: '#f5d179' },
  'cyberpunk': { nome: 'Cyberpunk', img: 'Cyberpunk.png', audio: 'Cyberpunk.mp3', titulo: 'PROTOCOLO ETERNO: TE AMO! ⚡', bg: '#060b17', color: '#00f3ff' },
  'festajunina': { nome: 'Festa Junina', img: 'SaoJoao.png', audio: 'SaoJoao.mp3', titulo: 'CORREIO ELEGANTE DO RAFA 💌', bg: '#fffdf7', color: '#d9381e' },
  'halloween': { nome: 'Halloween', img: 'Halloween.png', audio: 'Halloween.mp3', titulo: 'FEITIÇO ETERNO: TE AMO! 🎃', bg: '#0d0717', color: '#ff781f' },
  'pascoa': { nome: 'Páscoa', img: 'Pascoa.png', audio: 'Pascoa.mp3', titulo: 'OVO ENCANTADO: TE AMO! 🐰', bg: '#fffbfc', color: '#f472b6' },
  'natal': { nome: 'Natal', img: 'Natal.png', audio: 'Natal.mp3', titulo: 'FELIZ NATAL, MEU AMOR! 🎅', bg: '#ffffff', color: '#c41e3a' },
  'terror': { nome: 'Terror', video: 'JumpScare.mp4', titulo: 'PACTO SANGUÍNEO 🫀', bg: '#0d0408', color: '#e6001a' }
};

let currentAudio = new Audio();
currentAudio.preload = 'auto';

function aplicarTema(nomeTema) {
  // Remove todas as classes de tema existentes do body
  document.body.classList.remove('theme-claro', 'theme-escuro', 'theme-anonovo', 'theme-cyberpunk', 'theme-festajunina', 'theme-halloween', 'theme-pascoa', 'theme-natal', 'theme-terror');
  
  // Adiciona a classe do tema escolhido
  document.body.classList.add(`theme-${nomeTema}`);
  localStorage.setItem(THEME_STYLE_KEY, nomeTema);

  // Pré-carrega o áudio do tema atual (se não for o de terror)
  if (nomeTema !== 'terror') {
    currentAudio.src = `./${THEME_ASSETS[nomeTema].audio}`;
  }
}

function aplicarLayout(modo) {
  if (modo === 'vertical') {
    document.body.classList.add('layout-vertical');
  } else {
    document.body.classList.remove('layout-vertical');
  }
  localStorage.setItem(THEME_LAYOUT_KEY, modo);
}

// ==========================================
// MODAL DE CONFIGURAÇÕES (SWEETALERT)
// ==========================================
function abrirModalConfiguracoes() {
  const temaAtual = localStorage.getItem(THEME_STYLE_KEY) || 'claro';
  const layoutAtual = localStorage.getItem(THEME_LAYOUT_KEY) || 'paisagem';

  const htmlContent = `
    <div style="text-align:left;font-size:13px;display:grid;gap:16px;margin-top:10px;">
      
      <!-- Seção de Layout -->
      <div>
        <label style="font-weight:800;color:var(--text);text-transform:uppercase;font-size:11px;letter-spacing:1px;margin-bottom:8px;display:block;">Orientação da Tela</label>
        <div style="display:flex;gap:10px;">
          <button id="optPaisagem" class="btn ${layoutAtual === 'paisagem' ? 'btn-primary' : 'btn-soft'}" style="flex:1;justify-content:center;">🖥️ Paisagem</button>
          <button id="optVertical" class="btn ${layoutAtual === 'vertical' ? 'btn-primary' : 'btn-soft'}" style="flex:1;justify-content:center;">📱 Vertical</button>
        </div>
      </div>

      <!-- Seção de Temas -->
      <div>
        <label style="font-weight:800;color:var(--text);text-transform:uppercase;font-size:11px;letter-spacing:1px;margin-bottom:8px;display:block;">Galeria de Temas</label>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;">
          ${Object.entries(THEME_ASSETS).map(([id, info]) => `
            <div class="theme-card-option ${temaAtual === id ? 'active' : ''}" onclick="window.selecionarTemaPop('${id}')">
              <strong style="color:var(--text);font-size:12px;">${info.nome}</strong>
            </div>
          `).join('')}
        </div>
      </div>
    </div>
  `;

  Swal.fire({
    title: '<span style="font-size:18px;font-weight:800;">⚙ Configurações do Sistema</span>',
    html: htmlContent,
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
  toast('success', `Tema ${THEME_ASSETS[nome].nome} aplicado!`);
  Swal.close();
};

// ==========================================
// EASTER EGG UNIVERSAL (10 CLIQUES)
// ==========================================
let mascotClicks = 0;
let bubbleTimer = null;

document.addEventListener('click', e => {
  const t = e.target;
  
  // Se clicou na mascote de qualquer tema
  if (t.closest('.mascot-trigger')) {
    mascotClicks++;
    const temaAtual = localStorage.getItem(THEME_STYLE_KEY) || 'claro';
    const config = THEME_ASSETS[temaAtual];
    
    // Mostra balão genérico de cliques
    const bubble = document.getElementById('universalBubble');
    if (bubble) {
      bubble.textContent = `Faltam ${10 - mascotClicks} cliques... 👀`;
      bubble.style.opacity = '1';
      clearTimeout(bubbleTimer);
      bubbleTimer = setTimeout(() => { bubble.style.opacity = '0'; }, 2000);
    }

    // CARREGA A SURPRESA NO 10º CLIQUE
    if (mascotClicks >= 10) {
      mascotClicks = 0;
      
      // REGRA ESPECIAL: TEMA TERROR (JUMPSCARE DE VÍDEO)
      if (temaAtual === 'terror') {
        Swal.fire({
          html: `<video src="./${config.video}" autoplay style="width:100%;border-radius:12px;box-shadow:0 0 40px #e6001a;"></video>`,
          background: '#000',
          showConfirmButton: false,
          allowOutsideClick: false,
          timer: 4000, // Fecha sozinho depois do susto
          customClass: { popup: 'swal2-horror-popup' }
        });
      } 
      // REGRA PADRÃO: OUTROS 8 TEMAS (FOTO + MÚSICA)
      else {
        Swal.fire({
          title: `<span style="font-weight:800;font-size:24px;color:${config.color}">${config.titulo}</span>`,
          html: `
            <div style="margin: 15px 0;">
              <img src="./${config.img}" style="width:100%;max-width:320px;border-radius:20px;border:3px solid ${config.color};box-shadow:0 10px 30px rgba(0,0,0,0.5);">
            </div>
            <p style="font-size:14px;font-weight:600;margin-top:15px;color:var(--text);">Você ativou o Easter Egg do tema ${config.nome}! ✨💖</p>
          `,
          background: config.bg,
          confirmButtonText: 'Eu te amo! 💖',
          confirmButtonColor: config.color,
          willOpen: () => {
            currentAudio.currentTime = 0;
            currentAudio.play().catch(e => console.log('Autoplay bloqueado', e));
          },
          didClose: () => {
            currentAudio.pause();
          }
        });
      }
    }
  }
});

// Inicialização
document.addEventListener('DOMContentLoaded', () => {
  const temaSalvo = localStorage.getItem(THEME_STYLE_KEY) || 'claro';
  const layoutSalvo = localStorage.getItem(THEME_LAYOUT_KEY) || 'paisagem';
  aplicarTema(temaSalvo);
  aplicarLayout(layoutSalvo);

  // Injeta o botão Configurações na barra lateral dinamicamente
  const nav = document.querySelector('.sidebar .nav');
  if (nav && !document.getElementById('btnNavConfig')) {
    const btn = document.createElement('button');
    btn.className = 'nav-btn';
    btn.id = 'btnNavConfig';
    btn.innerHTML = '<span class="nav-icon">⚙</span><span>Configurações</span>';
    btn.addEventListener('click', abrirModalConfiguracoes);
    nav.appendChild(btn);
  }
});
