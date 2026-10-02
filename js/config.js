// ==========================================================================
// GERENCIADOR DE CONFIGURAÇÕES E SELEÇÃO DE TEMAS
// ==========================================================================
(function() {
  const THEME_KEY = 'erp_current_theme_style';

  function aplicarTema(nomeTema) {
    document.body.classList.remove('theme-claro', 'theme-escuro');
    document.body.classList.add(`theme-${nomeTema}`);
    localStorage.setItem(THEME_KEY, nomeTema);

    // Ajusta as cores dos gráficos se já estiverem renderizados
    if (typeof charts !== 'undefined' && charts.linha && charts.tipos) {
      if (nomeTema === 'escuro') {
        charts.linha.data.datasets[0].borderColor = '#38bdf8';
        charts.linha.data.datasets[0].backgroundColor = 'rgba(56, 189, 248, 0.12)';
        charts.linha.data.datasets[0].pointBackgroundColor = '#38bdf8';
        charts.tipos.data.datasets[0].backgroundColor = ['#f43f5e', '#f59e0b', '#10b981'];
      } else {
        charts.linha.data.datasets[0].borderColor = '#4f46e5';
        charts.linha.data.datasets[0].backgroundColor = 'rgba(79,70,229,.12)';
        charts.linha.data.datasets[0].pointBackgroundColor = '#4f46e5';
        charts.tipos.data.datasets[0].backgroundColor = ['#dc3f5a', '#d97706', '#0f9f6e'];
      }
      charts.linha.update();
      charts.tipos.update();
    }
  }

  function abrirModalConfiguracoes() {
    const temaAtual = localStorage.getItem(THEME_KEY) || 'claro';

    Swal.fire({
      title: '<span style="font-family:Manrope,sans-serif;font-weight:800;color:var(--text, #172033)">⚙ Temas do ERP</span>',
      html: `
        <div style="text-align:left;display:grid;gap:12px;margin-top:10px;">
          <div style="font-size:12px;color:var(--muted, #64748b);">Escolha o estilo visual da sua área de trabalho:</div>
          <div style="display:flex;gap:10px;">
            <button id="btnTemaClaro" class="btn ${temaAtual === 'claro' ? 'btn-primary' : 'btn-soft'}" style="flex:1;justify-content:center;">
              🌸 Rosa Fofo (Padrão)
            </button>
            <button id="btnTemaEscuro" class="btn ${temaAtual === 'escuro' ? 'btn-primary' : 'btn-soft'}" style="flex:1;justify-content:center;">
              🌌 Enterprise Dark
            </button>
          </div>
        </div>
      `,
      showConfirmButton: false,
      showCloseButton: true,
      background: 'var(--surface, #ffffff)',
      didOpen: () => {
        document.getElementById('btnTemaClaro').addEventListener('click', () => {
          aplicarTema('claro');
          Swal.close();
        });
        document.getElementById('btnTemaEscuro').addEventListener('click', () => {
          aplicarTema('escuro');
          Swal.close();
        });
      }
    });
  }

  // Inicialização
  document.addEventListener('DOMContentLoaded', () => {
    const temaSalvo = localStorage.getItem(THEME_KEY) || 'claro';
    aplicarTema(temaSalvo);

    // Injeta o botão Configurações na barra lateral
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
})();
