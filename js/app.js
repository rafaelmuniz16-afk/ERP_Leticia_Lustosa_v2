const API_URL = '[https://script.google.com/macros/s/AKfycbzkcsULH3xNPbjNFmLy-wlqKuSE0cbwBlkqmVd8t1ugoP89RHzuW9wCMHK0V7eKYrxp/exec](https://script.google.com/macros/s/AKfycbzkcsULH3xNPbjNFmLy-wlqKuSE0cbwBlkqmVd8t1ugoP89RHzuW9wCMHK0V7eKYrxp/exec)';

const MONTHS = [['06','Junho'],['07','Julho'],['08','Agosto'],['09','Setembro'],['10','Outubro'],['11','Novembro'],['12','Dezembro']];
const CACHE_KEY = 'bd_oficial_leticia';
const META_KEY = 'metas_oficial_leticia';
const LAST_MONTH_KEY = 'ultimo_mes_selecionado';
const AI_KEY = 'groq_api_key_erp';
const LOGS_KEY = 'logs_oficial_leticia';
const MEMORIA_KEY = 'memoria_oficial_ia';

let bd = JSON.parse(localStorage.getItem(CACHE_KEY) || '[]');
let metas = JSON.parse(localStorage.getItem(META_KEY) || '{}');
let logsAuditoria = JSON.parse(localStorage.getItem(LOGS_KEY) || '[]');
let memoriaIA = JSON.parse(localStorage.getItem(MEMORIA_KEY) || '[]');
let editUid = null, currentPage = 1, itemsPerPage = 15, metaSaveTimer = null, lastConfirmedMetas = JSON.parse(JSON.stringify(metas));
let charts = {tipos:null, linha:null};
let apiKey = localStorage.getItem(AI_KEY) || '';
let chatHistory = [{role:'assistant', content:'Olá, Letícia! Eu sou a Aurora. ✦ Estou pronta para consultar a base, analisar indicadores e, com sua confirmação, cadastrar, editar ou excluir casos.'}];

const $ = id => document.getElementById(id);
const monthName = m => MONTHS.find(x => x[0] === String(m))?.[1] || '—';

function setLoading(show, title='Sincronizando…') {
  $('loadingTitle').textContent = title;
  $('loading').classList.toggle('show', show);
}

function toast(icon, title) {
  Swal.fire({toast: true, position: 'top-end', showConfirmButton: false, timer: 2800, timerProgressBar: true, icon, title});
}

function normalizeDate(v) {
  if(!v) return '';
  let s = String(v);
  return s.includes('T') ? s.split('T')[0] : s.includes(' ') ? s.split(' ')[0] : s;
}

function getMesCorreto(d) {
  let m = d.mesReferencia;
  if(!m || isNaN(parseInt(m))) {
    let dt = normalizeDate(d.data);
    return dt && dt.includes('-') ? dt.split('-')[1] : '00';
  }
  return String(parseInt(m)).padStart(2,'0');
}

function uid() {
  return (crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(36) + Math.random().toString(36).slice(2));
}

function escapeHTML(value) {
  return String(value ?? '').replace(/[&<>'"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
}

function safeText(value) {
  return escapeHTML(value).replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\n/g, '<br>');
}

function formatMoney(v) {
  return Number(v || 0).toLocaleString('pt-BR', {style: 'currency', currency: 'BRL'});
}

function parseNum(v) {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

function setConn(state, label) {
  const dot = $('sideDot');
  dot.className = 'status-dot ' + (state === 'online' ? 'status-online' : state === 'syncing' ? 'status-syncing' : 'status-offline');
  $('sideStatus').textContent = label;
}

// ==== AUDITORIA ====
function registrarLog(acao, idCaso, detalhes) {
  if (!Array.isArray(logsAuditoria)) logsAuditoria = [];
  const dataAtual = new Date().toLocaleString('pt-BR');
  const novoLog = { dataHora: dataAtual, acao, idCaso, detalhes };
  logsAuditoria.unshift(novoLog);
  if(logsAuditoria.length > 200) logsAuditoria.pop(); 
  localStorage.setItem(LOGS_KEY, JSON.stringify(logsAuditoria));
  renderLogs();
  
  fetch(API_URL, {
    method: 'POST',
    headers: {'Content-Type': 'text/plain;charset=utf-8'},
    body: JSON.stringify({acao: 'salvarLog', dataHora: dataAtual, acaoLog: acao, idCaso: idCaso, detalhes: detalhes})
  }).catch(err => console.log("Erro de log:", err));
}

function renderLogs() {
  const tbody = $('logsTable');
  if(!tbody) return;
  tbody.replaceChildren();
  if (!Array.isArray(logsAuditoria)) logsAuditoria = [];
  if(!logsAuditoria.length) {
    tbody.innerHTML = '<tr><td colspan="4" class="empty">Nenhum log registrado ainda.</td></tr>';
    return;
  }
  logsAuditoria.forEach(l => {
    const tr = document.createElement('tr');
    let badgeClass = 'b-acordo';
    if(l.acao.includes('CADASTRAR')) badgeClass = 'b-exito';
    if(l.acao.includes('APAGAR')) badgeClass = 'b-onus';
    tr.innerHTML = `
      <td style="white-space:nowrap">${l.dataHora}</td>
      <td><span class="badge ${badgeClass}">${l.acao}</span></td>
      <td><strong>${l.idCaso}</strong></td>
      <td style="color:var(--muted); max-width:400px;">${l.detalhes}</td>
    `;
    tbody.appendChild(tr);
  });
}

// ==== API & NUVEM ====
async function fetchAPI(acao, payload={}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 40000);
  try {
    const res = await fetch(API_URL, {
      method: 'POST',
      headers: {'Content-Type': 'text/plain;charset=utf-8'},
      body: JSON.stringify({acao, ...payload}),
      signal: controller.signal
    });
    if(!res.ok) throw new Error('HTTP ' + res.status);
    return await res.json();
  } catch(err) {
    console.error('API', err);
    return null;
  } finally {
    clearTimeout(timer);
  }
}

async function serverMutation(acao, payload) {
  setConn('syncing', 'Salvando…');
  const res = await fetchAPI(acao, payload);
  if(!res || res.status !== 'sucesso') {
    setConn('offline', 'Falha na nuvem');
    throw new Error(res?.mensagem || res?.message || 'Servidor não confirmou a operação.');
  }
  return res;
}

async function loadCloud(initial=false) {
  setConn('syncing', 'Conectando…');
  if(initial && bd.length) renderAll();
  const res = await fetchAPI('ler');
  if(res && res.status === 'sucesso') {
    bd = Array.isArray(res.dados) ? res.dados : [];
    if(res.metas && typeof res.metas === 'object') {
      metas = res.metas;
      lastConfirmedMetas = JSON.parse(JSON.stringify(metas));
      localStorage.setItem(META_KEY, JSON.stringify(metas));
    }
    if(res.logs && Array.isArray(res.logs)) {
      logsAuditoria = res.logs;
      localStorage.setItem(LOGS_KEY, JSON.stringify(logsAuditoria));
    }
    if(res.memoria && Array.isArray(res.memoria)) {
      memoriaIA = res.memoria;
      localStorage.setItem(MEMORIA_KEY, JSON.stringify(memoriaIA));
    }
    localStorage.setItem(CACHE_KEY, JSON.stringify(bd));
    setConn('online', 'Online');
    $('sideCount').textContent = bd.length;
    renderAll();
    startDiagnosticLoop();
  } else {
    setConn('offline', 'Sem conexão');
    toast('warning', 'Não foi possível confirmar os dados da nuvem.');
  }
  return res;
}

function fillMonths() {
  const fm = $('filterMonth'), fr = $('mesReferenciaForm');
  fm.innerHTML = MONTHS.map(([v,n]) => `<option value="${v}">${n}</option>`).join('');
  fr.innerHTML = MONTHS.map(([v,n]) => `<option value="${v}">${n}</option>`).join('');
  const now = String(new Date().getMonth() + 1).padStart(2,'0');
  const last = localStorage.getItem(LAST_MONTH_KEY) || now;
  const chosen = MONTHS.some(x => x[0] === last) ? last : '06';
  fm.value = chosen;
  fr.value = chosen;
  updateMetaInput();
}

function getSelectedMonth() {
  return $('filterMonth').value;
}

function updateMetaInput() {
  $('metaInput').value = parseNum(metas[getSelectedMonth()]);
}

function getFiltered() {
  const month = getSelectedMonth();
  let rows = bd.filter(d => getMesCorreto(d) === month);
  const tipo = $('filterTipo').value, pan =$('filterEncerrado').value, q = $('searchInput').value.toLowerCase().trim(), st =$('searchType').value, dStart = $('dateStart').value, dEnd =$('dateEnd').value;
  if(tipo !== 'Todos') rows = rows.filter(d => d.tipo === tipo);
  if(pan !== 'Todos') rows = rows.filter(d => d.panjud === pan);
  if(q) rows = rows.filter(d => String(st === 'id' ? d.id : d.processo).toLowerCase().includes(q));
  if(dStart) rows = rows.filter(d => normalizeDate(d.data) >= dStart);
  if(dEnd) rows = rows.filter(d => normalizeDate(d.data) <= dEnd);
  return rows;
}

function calculate() {
  const month = getSelectedMonth(), meta = parseNum($('metaInput').value), rows = bd.filter(d => getMesCorreto(d) === month);
  let onus = 0, acordo = 0, exito = 0, recusados = 0, reais = 0, perDay = {};
  rows.forEach(d => {
    if(d.tipo === 'Ônus') onus++;
    if(d.tipo === 'Acordo') acordo++;
    if(d.tipo === 'Êxito') exito++;
    if(d.recusado === 'Sim') recusados++;
    if(d.panjud === 'Sim') reais++;
    const dt = normalizeDate(d.data);
    const dia = dt && dt.includes('-') ? dt.split('-')[2].slice(0,2) : '00';
    perDay[dia] = (perDay[dia] || 0) + 1;
  });
  const quant = onus + acordo + exito, totais = quant - recusados;
  const faltaQuant = meta - quant, faltaTotais = meta - totais, faltaReais = meta - reais;
  return {month, meta, rows, onus, acordo, exito, recusados, reais, quant, totais, faltaQuant, faltaTotais, faltaReais, perDay};
}

function dailyTarget(falta, month) {
  if(falta <= 0) return 'Meta batida! 🏆';
  const now = new Date();
  now.setHours(0,0,0,0);
  const year = now.getFullYear(), idx = parseInt(month, 10) - 1;
  let start = new Date(year, idx, 1), end = new Date(year, idx + 1, 0);
  if(idx < now.getMonth()) return 'Mês encerrado';
  if(idx === now.getMonth()) start = new Date(now);
  let days = 0;
  for(let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    const day = d.getDay();
    if(day !== 0 && day !== 6) days++;
  }
  if(!days) return 'Sem dias úteis';
  return Math.max(0, Math.ceil(falta / days)) + ' casos/dia';
}

function calcFinancial(c) {
  const p = c.meta > 0 ? c.reais / c.meta : 0;
  let r = {onus: 0, acordo: 0, exito: 0};
  if(p >= 1) {
    r = {onus: c.onus * 4, acordo: c.acordo * 3, exito: c.exito * 2};
  } else if(p >= .9) {
    r = {onus: c.onus * 2.2, acordo: c.acordo * 1.7, exito: c.exito * 1.2};
  } else if(p >= .8) {
    r = {onus: c.onus * 1.1, acordo: c.acordo * .85, exito: c.exito * .6};
  }
  return {percent: p, ...r, total: r.onus + r.acordo + r.exito, idealOnus: c.onus * 4, idealAcordo: c.acordo * 3, idealExito: c.exito * 2, idealTotal: c.onus * 4 + c.acordo * 3 + c.exito * 2};
}

function renderStatus(c) {
  const pct = c.meta > 0 ? c.reais / c.meta : 0;
  const box = $('statusBanner');
  box.className = 'status ' + (pct >= 1 ? 'status-100' : pct >= .9 ? 'status-90' : pct >= .8 ? 'status-80' : 'status-bad');
  $('statusProgress').style.width = Math.min(100, pct * 100) + '\%';$('statusTitle').textContent = pct >= 1 ? 'Meta atingida — excelente!' : pct >= .9 ? `Você está em 90% da meta (${(pct * 100).toFixed(1)}%).` : pct >= .8 ? `Você chegou à faixa de 80% (${(pct * 100).toFixed(1)}%).` : `Meta ainda não atingida (${(pct * 100).toFixed(1)}%).`;
  $('statusSub').textContent = `${c.reais} reais de ${c.meta} necessários • faltam ${Math.max(0, c.faltaReais)}`;
}

function renderCharts(c) {
  if(charts.tipos) charts.tipos.destroy();
  charts.tipos = new Chart($('tiposChart'), {
    type: 'doughnut',
    data: {labels: ['Ônus','Acordo','Êxito'], datasets: [{data: [c.onus, c.acordo, c.exito], backgroundColor: ['#dc3f5a','#d97706','#0f9f6e'], borderWidth: 0}]},
    options: {responsive: true, maintainAspectRatio: false, cutout: '68%', plugins: {legend: {position: 'bottom', labels: {usePointStyle: true, boxWidth: 8, font: {size: 10}}}}}
  });
  const days = Object.keys(c.perDay).sort((a,b) => parseInt(a) - parseInt(b));
  if(charts.linha) charts.linha.destroy();
  charts.linha = new Chart($('linhaChart'), {
    type: 'line',
    data: {labels: days.map(d => d + '/' + c.month), datasets: [{data: days.map(d => c.perDay[d]), borderColor: '#4f46e5', backgroundColor: 'rgba(79,70,229,.12)', fill: true, tension: .32, pointRadius: 3, pointBackgroundColor: '#4f46e5'}]},
    options: {responsive: true, maintainAspectRatio: false, plugins: {legend: {display: false}}, scales: {x: {grid: {display: false}, ticks: {font: {size: 9}}}, y: {beginAtZero: true, ticks: {stepSize: 1, font: {size: 9}}}}}
  });
}

function renderFinancial(c) {
  const f = calcFinancial(c);
  $('val_real_onus').textContent = formatMoney(f.onus);$('val_real_acordo').textContent = formatMoney(f.acordo);
  $('val_real_exito').textContent = formatMoney(f.exito);$('val_real_total').textContent = formatMoney(f.total);
  $('val_100_onus').textContent = formatMoney(f.idealOnus);$('val_100_acordo').textContent = formatMoney(f.idealAcordo);
  $('val_100_exito').textContent = formatMoney(f.idealExito);$('val_100_total').textContent = formatMoney(f.idealTotal);
}

function renderTable() {
  const tbody = $('recordsTable');
  tbody.replaceChildren();
  const order = $('sortOrder').value;
  let data = getFiltered().sort((a,b) => {
    const dA = normalizeDate(a.data) || '', dB = normalizeDate(b.data) || '';
    if(dA !== dB) return order === 'desc' ? dB.localeCompare(dA) : dA.localeCompare(dB);
    const uA = String(a._uid || a.id), uB = String(b._uid || b.id);
    return order === 'desc' ? uB.localeCompare(uA) : uA.localeCompare(uB);
  });
  const maxPage = Math.max(1, Math.ceil(data.length / itemsPerPage));
  if(currentPage > maxPage) currentPage = maxPage;
  $('pageInfo').textContent = `Página ${currentPage} de ${maxPage}`;
  $('btnPrevPage').disabled = currentPage === 1;
  $('btnNextPage').disabled = currentPage === maxPage;
  if(!data.length) {
    const tr = document.createElement('tr'), td = document.createElement('td');
    td.colSpan = 9; td.className = 'empty'; td.textContent = 'Nenhum encerramento encontrado para estes filtros.';
    tr.appendChild(td); tbody.appendChild(tr); return;
  }
  const start = (currentPage - 1) * itemsPerPage;
  data.slice(start, start + itemsPerPage).forEach(d => {
    const tr = document.createElement('tr');
    const tipoClass = d.tipo === 'Êxito' ? 'b-exito' : d.tipo === 'Acordo' ? 'b-acordo' : 'b-onus';
    const cells = [d.id || '-', d.processo || '-'];
    cells.forEach(v => { const td = document.createElement('td'); td.textContent = v; tr.appendChild(td); });
    const tdTipo = document.createElement('td');
    const badge = document.createElement('span');
    badge.className = 'badge ' + tipoClass; badge.textContent = d.tipo || '-';
    tdTipo.appendChild(badge); tr.appendChild(tdTipo);
    const vals = [normalizeDate(d.data) ? normalizeDate(d.data).split('-').reverse().join('/') : '-', getMesCorreto(d), d.panjud || 'Não', d.recusado || 'Não'];
    vals.forEach((v,i) => {
      const td = document.createElement('td');
      td.textContent = i === 1 ? monthName(v) : v;
      if(i === 2 || i === 3) td.className = v === 'Sim' ? 'yes' : 'no';
      tr.appendChild(td);
    });
    const tdObs = document.createElement('td');
    tdObs.className = 'ellipsis'; tdObs.title = d.observacoes || ''; tdObs.textContent = d.observacoes || '-';
    tr.appendChild(tdObs);
    const tdAct = document.createElement('td');
    tdAct.className = 'actions';
    const eb = document.createElement('button');
    eb.className = 'icon-btn'; eb.title = 'Editar'; eb.textContent = '✎';
    eb.addEventListener('click', () => startEdit(d._uid));
    const db = document.createElement('button');
    db.className = 'icon-btn danger-btn'; db.title = 'Excluir'; db.textContent = '⌫';
    db.addEventListener('click', () => deleteRecord(d._uid));
    tdAct.append(eb, db); tr.appendChild(tdAct);
    tbody.appendChild(tr);
  });
}

function renderAll() {
  const c = calculate();
  renderStatus(c);
  $('m5_quant').textContent = c.quant;
  $('m8_recusados').textContent = c.recusados;
  $('m7_reais').textContent = c.reais;
  $('falta_reais').textContent = c.faltaReais;
  $('count_onus').textContent = c.onus;
  $('count_acordo').textContent = c.acordo;
  $('count_exito').textContent = c.exito;
  $('m6_totais').textContent = c.totais;
  $('falta_quant').textContent = c.faltaQuant;
  $('labelQuant').textContent = `${c.quant} / ${c.meta}`;
  $('labelTotais').textContent = `${c.totais} / ${c.meta}`;
  $('labelReais').textContent = `${c.reais} / ${c.meta}`;
  const dt = dailyTarget(c.faltaReais, c.month);
  $('meta_diaria').textContent = dt;
  $('meta_diaria_2').textContent = dt;
  renderCharts(c);
  renderFinancial(c);
  renderTable();
  renderLogs();
  $('sideCount').textContent = bd.length;
}

// ==== CRUD FORMULÁRIO ====
async function saveRecord(registro) { return await serverMutation('salvar', {registro}); }
async function editServer(registro) { return await serverMutation('editar', {registro}); }
async function deleteServer(uidValue) { return await serverMutation('apagar', {uid: uidValue}); }

function formData() {
  return {
    id: $('idCaso').value.trim(),
    processo: $('numProcesso').value.trim(),
    tipo: $('tipoEncerramento').value,
    data: $('dataEncerramento').value,
    panjud: $('panjud').value,
    recusado: $('recusado').value,
    observacoes: $('observacoes').value.trim(),
    mesReferencia: $('mesReferenciaForm').value
  };
}

function clearForm() {
  editUid = null;
  $('processForm').reset();
  $('dataEncerramento').value = new Date().toISOString().slice(0,10);$('mesReferenciaForm').value = getSelectedMonth();
  $('formTitle').textContent = 'Novo registro';$('btnSubmit').textContent = '✓ Salvar registro';
  $('btnCancel').style.display = 'none';
  setTimeout(() => $('idCaso')?.focus(), 50);
}

function startEdit(uidValue) {
  const r = bd.find(x => String(x._uid) === String(uidValue));
  if(!r) return;
  editUid = uidValue;
  $('idCaso').value = r.id || '';
  $('numProcesso').value = r.processo \vert{}\vert{} '';$('tipoEncerramento').value = r.tipo || 'Ônus';
  $('dataEncerramento').value = normalizeDate(r.data);
  $('mesReferenciaForm').value = getMesCorreto(r);$('panjud').value = r.panjud || 'Não';
  $('recusado').value = r.recusado || 'Não';
  $('observacoes').value = r.observacoes || '';
  $('formTitle').textContent = 'Editar registro';$('btnSubmit').textContent = '✓ Atualizar registro';
  $('btnCancel').style.display = 'inline-flex';
  document.getElementById('cadastro').scrollIntoView({behavior: 'smooth', block: 'start'});
  setTimeout(() => $('idCaso')?.focus(), 50);
}

async function handleSubmit(e) {
  e.preventDefault();
  if($('panjud').value === 'Sim' &&$('recusado').value === 'Sim') {
    toast('error', 'Um caso não pode ser encerrado e recusado no Panjud ao mesmo tempo.');
    return;
  }
  const data = formData();
  if(!data.id || !data.processo) {
    toast('warning', 'Preencha ID e número do processo.');
    return;
  }
  try {
    setLoading(true, editUid ? 'Atualizando registro…' : 'Salvando registro…');
    if(editUid) {
      data._uid = editUid;
      await editServer(data);
      const idx = bd.findIndex(x => String(x._uid) === String(editUid));
      if(idx >= 0) bd[idx] = data;
      registrarLog('EDITAR', data.id, `Processo: ${data.processo} | Tipo alterado: ${data.tipo} | Panjud: ${data.panjud}`);
      toast('success', 'Registro confirmado pela nuvem.');
    } else {
      data._uid = uid();
      await saveRecord(data);
      bd.push(data);
      registrarLog('CADASTRAR', data.id, `Processo: ${data.processo} | Tipo: ${data.tipo} | Panjud: ${data.panjud}`);
      toast('success', 'Novo registro confirmado pela nuvem.');
    }
    localStorage.setItem(CACHE_KEY, JSON.stringify(bd));
    clearForm();
    renderAll();
    setConn('online', 'Online');
    rotateBusinessDiagnostic();
  } catch(err) {
    toast('error', err.message);
    setConn('offline', 'Falha na nuvem');
  } finally {
    setLoading(false);
  }
}

async function deleteRecord(uidValue) {
  const r = bd.find(x => String(x._uid) === String(uidValue));
  if(!r) return;
  const result = await Swal.fire({
    title: 'Excluir este caso?',
    html: `<div style="font-size:12px;text-align:left"><b>ID:</b> ${escapeHTML(r.id)}<br><b>Processo:</b> ${escapeHTML(r.processo)}<br><b>Tipo:</b> ${escapeHTML(r.tipo)}</div>`,
    showCancelButton: true,
    confirmButtonText: 'Excluir',
    cancelButtonText: 'Cancelar',
    confirmButtonColor: '#dc3f5a',
    reverseButtons: true
  });
  if(!result.isConfirmed) return;
  try {
    setLoading(true, 'Excluindo registro…');
    await deleteServer(uidValue);
    bd = bd.filter(x => String(x._uid) !== String(uidValue));
    localStorage.setItem(CACHE_KEY, JSON.stringify(bd));
    registrarLog('APAGAR', r.id, `Processo: ${r.processo} removido do sistema.`);
    renderAll();
    toast('success', 'Registro removido com confirmação da nuvem.');
    setConn('online', 'Online');
    rotateBusinessDiagnostic();
  } catch(err) {
    toast('error', err.message);
    setConn('offline', 'Falha na nuvem');
  } finally {
    setLoading(false);
  }
}

async function saveMeta() {
  const month = getSelectedMonth(), value = parseNum($('metaInput').value);
  const previous = lastConfirmedMetas[month] ?? 0;
  metas[month] = value;
  localStorage.setItem(META_KEY, JSON.stringify(metas));
  renderAll();
  clearTimeout(metaSaveTimer);
  metaSaveTimer = setTimeout(async () => {
    try {
      setConn('syncing', 'Salvando meta…');
      await serverMutation('salvarMeta', {mes: month, meta: value});
      lastConfirmedMetas[month] = value;
      toast('success', 'Meta confirmada pela nuvem.');
      setConn('online', 'Online');
      rotateBusinessDiagnostic();
    } catch(err) {
      metas[month] = previous;
      localStorage.setItem(META_KEY, JSON.stringify(metas));
      updateMetaInput();
      renderAll();
      toast('error', 'A meta não foi confirmada pelo servidor.');
      setConn('offline', 'Falha na nuvem');
    }
  }, 900);
}

// ==== DRAWER DA AURORA AI & MEMÓRIA ====
function summarizeForAI() {
  const by = {};
  bd.forEach(d => {
    const m = getMesCorreto(d);
    if(!by[m]) by[m] = {total: 0, onus: 0, acordo: 0, exito: 0, recusados: 0, reais: 0};
    by[m].total++;
    if(d.tipo === 'Ônus') by[m].onus++;
    if(d.tipo === 'Acordo') by[m].acordo++;
    if(d.tipo === 'Êxito') by[m].exito++;
    if(d.recusado === 'Sim') by[m].recusados++;
    if(d.panjud === 'Sim') by[m].reais++;
  });
  return by;
}

function findCandidates(action) {
  let candidates = [];
  if(action._uid) candidates = bd.filter(r => String(r._uid) === String(action._uid));
  else if(action.id) candidates = bd.filter(r => String(r.id) === String(action.id));
  if(action.processo) candidates = candidates.filter(r => String(r.processo) === String(action.processo));
  return candidates;
}

function validateAction(a) {
  if(!a || typeof a !== 'object') return {ok: false, error: 'Ação inválida.'};
  const op = a.acao;
  if(!['cadastrar','editar','apagar','lembrar'].includes(op)) return {ok: false, error: 'Operação não permitida.'};
  if(op === 'lembrar') return a.texto ? {ok: true} : {ok: false, error: 'Memória sem texto.'};
  if(op === 'cadastrar') {
    if(!a.id || !a.processo || !['Ônus','Acordo','Êxito'].includes(a.tipo || '')) return {ok: false, error: 'Cadastro precisa de id, processo e tipo válido.'};
    if(a.panjud === 'Sim' && a.recusado === 'Sim') return {ok: false, error: 'Cadastro inválido: Panjud e recusado não podem ser Sim simultaneamente.'};
    return {ok: true};
  }
  if(!a.id && !a._uid) return {ok: false, error: 'Edição/exclusão precisa de id ou _uid.'};
  const matches = findCandidates(a);
  if(matches.length !== 1) return {ok: false, error: matches.length === 0 ? 'Caso não localizado na base atual.' : 'Há mais de um caso com esse ID. Informe também o número do processo ou _uid.'};
  if(op === 'editar') {
    const next = {...matches[0], ...a};
    delete next.acao;
    if(next.panjud === 'Sim' && next.recusado === 'Sim') return {ok: false, error: 'Edição inválida: Panjud e recusado não podem ser Sim.'};
    return {ok: true, record: matches[0], next};
  }
  return {ok: true, record: matches[0]};
}

function actionPreview(actions) {
  const wrap = document.createElement('div');
  wrap.style.cssText = 'text-align:left;font-size:12px;display:grid;gap:8px';
  actions.forEach(a => {
    const row = document.createElement('div');
    row.style.cssText = 'padding:9px;border:1px solid #dfe6ef;border-radius:10px;background:#f8fafc';
    const strong = document.createElement('strong');
    strong.textContent = '[' + a.acao.toUpperCase() + '] ';
    row.appendChild(strong);
    const text = document.createElement('span');
    if(a.acao === 'lembrar') text.textContent = 'Memória: ' + a.texto;
    else text.textContent = 'ID ' + (a.id || '—') + (a.processo ? ' • ' + a.processo : '');
    row.appendChild(text);
    wrap.appendChild(row);
  });
  return wrap;
}

async function executeAIAction(a) {
  const v = validateAction(a);
  if(!v.ok) throw new Error(v.error);
  if(a.acao === 'lembrar') {
    if (!Array.isArray(memoriaIA)) memoriaIA = [];
    memoriaIA.push(a.texto);
    localStorage.setItem(MEMORIA_KEY, JSON.stringify(memoriaIA));
    fetch(API_URL, {
      method: 'POST',
      headers: {'Content-Type': 'text/plain;charset=utf-8'},
      body: JSON.stringify({acao: 'salvarMemoria', texto: a.texto})
    }).catch(err => console.log("Erro ao salvar memoria na nuvem:", err));
    registrarLog('LEMBRAR (IA)', '-', `Anotação: ${a.texto}`);
    return 'Memória salva.';
  }
  if(a.acao === 'cadastrar') {
    const rec = {
      id: String(a.id),
      processo: String(a.processo),
      tipo: a.tipo,
      data: normalizeDate(a.data) || new Date().toISOString().slice(0,10),
      mesReferencia: String(a.mesReferencia || getSelectedMonth()).padStart(2,'0'),
      panjud: a.panjud || 'Não',
      recusado: a.recusado || 'Não',
      observacoes: a.observacoes || '',
      _uid: uid()
    };
    await saveRecord(rec);
    bd.push(rec);
    localStorage.setItem(CACHE_KEY, JSON.stringify(bd));
    registrarLog('CADASTRAR (IA)', rec.id, `Processo: ${rec.processo} | Tipo: ${rec.tipo}`);
    return 'Cadastro confirmado.';
  }
  if(a.acao === 'editar') {
    const next = {...v.next};
    delete next.acao;
    await editServer(next);
    const idx = bd.findIndex(r => String(r._uid) === String(v.record._uid));
    if(idx >= 0) bd[idx] = next;
    localStorage.setItem(CACHE_KEY, JSON.stringify(bd));
    registrarLog('EDITAR (IA)', next.id, `Atualizado via Chat. Processo: ${next.processo}`);
    return 'Edição confirmada.';
  }
  if(a.acao === 'apagar') {
    await deleteServer(v.record._uid);
    bd = bd.filter(r => String(r._uid) !== String(v.record._uid));
    localStorage.setItem(CACHE_KEY, JSON.stringify(bd));
    registrarLog('APAGAR (IA)', v.record.id, `Removido via Chat.`);
    return 'Exclusão confirmada.';
  }
}

function buildPrompt(userText) {
  const mentions = bd.filter(c => String(userText).includes(String(c.id)) || String(userText).includes(String(c.processo || ''))).slice(0, 15);
  const context = mentions.length ? JSON.stringify(mentions) : 'Nenhum caso específico detectado.';
  const lembrancasAnteriores = memoriaIA.length > 0 ? memoriaIA.join(" | ") : "Nenhuma memória registrada ainda.";
  
  let p = "Seu nome é Aurora. Você é a assistente administrativa do ERP da Letícia. Responda de forma fofa, carinhosa e animada!\n";
  p += "REGRAS: 'Encerramento real' significa panjud === Sim. Nunca invente dados.\n";
  p += "Para cadastrar, editar, apagar ou lembrar, gere OBRIGATORIAMENTE um bloco JSON com array de ações.\n";
  p += "Exemplo: [{\"acao\":\"cadastrar\",\"id\":\"123\",\"processo\":\"...\",\"tipo\":\"Ônus\",\"data\":\"2026-09-02\",\"mesReferencia\":\"09\",\"panjud\":\"Não\",\"recusado\":\"Não\",\"observacoes\":\"...\"}]\n\n";
  p += "LEMBRANÇAS DA IA:\n" + lembrancasAnteriores + "\n\n";
  p += "BASE ESPECÍFICA:\n" + context + "\n\n";
  p += "RESUMO MENSAL:\n" + JSON.stringify(summarizeForAI()) + "\n\n";
  p += "METAS:\n" + JSON.stringify(metas) + "\n\n";
  p += "SOLICITAÇÃO:\n" + userText;
  
  return p;
}

function appendMessage(sender, text) {
  const wrap = document.createElement('div');
  wrap.className = 'msg-wrap ' + sender;
  const msg = document.createElement('div');
  msg.className = 'msg ' + sender;
  msg.innerHTML = safeText(text);
  wrap.appendChild(msg);
  $('chatMessages').appendChild(wrap);
  $('chatMessages').scrollTop =$('chatMessages').scrollHeight;
}

function stripJsonBlock(text) {
  const match = text.match(/```json\s*([\s\S]*?)\s*```/i);
  return {clean: match ? text.replace(match[0], '').trim() : text, json: match ? match[1] : null};
}

async function processAI() {
  const text = $('chatInputText').value.trim();
  if(!text) return;
  if(!apiKey) {
    await configAPIKey();
    return;
  }
  appendMessage('user', text);
  $('chatInputText').value = '';
  chatHistory.push({role: 'user', content: text});
  appendMessage('system', 'Processando…');
  const system = buildPrompt(text);
  const payload = [{role: 'system', content: system}, ...chatHistory];
  
  try {
    let data = null, success = false, errMsg = '';
    for(const model of ['llama-3.3-70b-versatile', 'llama-3.1-8b-instant', 'qwen/qwen3.6-27b']) {
      const r = await fetch('[https://api.groq.com/openai/v1/chat/completions](https://api.groq.com/openai/v1/chat/completions)', {
        method: 'POST',
        headers: {'Content-Type': 'application/json', 'Authorization': 'Bearer ' + apiKey},
        body: JSON.stringify({model, messages: payload, temperature: .1})
      });
      data = await r.json();
      if(!data.error) { success = true; break; }
      errMsg = data.error.message || 'Erro';
      if([429, 503].includes(r.status) || /quota|rate limit/i.test(errMsg)) break;
    }
    $('chatMessages').lastElementChild?.remove();
    if(!success) throw new Error(errMsg || 'Nenhum modelo respondeu.');
    const answer = data.choices?.[0]?.message?.content || 'Não recebi conteúdo da Aurora.';
    chatHistory.push({role: 'assistant', content: answer});
    const parsed = stripJsonBlock(answer);
    appendMessage('bot', parsed.clean || 'Certo.');
    if(parsed.json) {
      let actions;
      try {
        actions = JSON.parse(parsed.json);
        if(!Array.isArray(actions)) throw new Error('JSON de ações precisa ser um array.');
      } catch(err) {
        appendMessage('system', 'A Aurora respondeu com uma ação em formato inválido; nada foi executado.');
        return;
      }
      const invalid = actions.map(validateAction).find(v => !v.ok);
      if(invalid) {
        appendMessage('system', 'Nenhuma ação foi executada: ' + invalid.error);
        return;
      }
      const confirm = document.createElement('div');
      confirm.appendChild(actionPreview(actions));
      const result = await Swal.fire({
        title: 'Confirmar ações',
        html: confirm,
        showCancelButton: true,
        confirmButtonText: 'Executar ações',
        cancelButtonText: 'Cancelar',
        confirmButtonColor: '#4f46e5',
        reverseButtons: true
      });
      if(!result.isConfirmed) {
        appendMessage('system', 'Operação cancelada.');
        return;
      }
      let count = 0;
      setLoading(true, 'Executando ações confirmadas…');
      try {
        for(const a of actions) {
          await executeAIAction(a);
          count++;
        }
        renderAll();
        appendMessage('system', `✓ ${count} ação(ões) confirmada(s) pela nuvem.`);
      } catch(err) {
        appendMessage('system', 'A execução foi interrompida: ' + err.message);
      } finally {
        setLoading(false);
      }
    }
  } catch(err) {
    $('chatMessages').lastElementChild?.remove();
    appendMessage('bot', 'Não consegui concluir a solicitação agora. Detalhe: ' + err.message);
  }
}

async function configAPIKey() {
  const result = await Swal.fire({
    title: 'Chave Groq Cloud',
    input: 'password',
    inputValue: apiKey || '',
    inputLabel: 'A chave fica salva neste navegador para ativar a Aurora.',
    showCancelButton: true,
    confirmButtonText: 'Salvar',
    cancelButtonText: 'Cancelar',
    confirmButtonColor: '#4f46e5',
    inputAttributes: {autocomplete: 'off'}
  });
  if(result.isConfirmed) {
    apiKey = (result.value || '').trim();
    if(apiKey) localStorage.setItem(AI_KEY, apiKey);
    else localStorage.removeItem(AI_KEY);
    toast('success', apiKey ? 'Chave salva com sucesso!' : 'Chave removida.');
    $('aiState').textContent = apiKey ? 'Pronta para uso' : 'Aguardando chave Groq';
  }
}

function openAI() {
  $('aiDrawer').classList.add('ai-open');$('aiDrawer').setAttribute('aria-hidden', 'false');
  if(!$('chatMessages').children.length) {     chatHistory.forEach(m => appendMessage(m.role === 'assistant' ? 'bot' : 'user', m.content));   }$('chatInputText').focus();
}

function closeAI() {
  $('aiDrawer').classList.remove('ai-open');$('aiDrawer').setAttribute('aria-hidden', 'true');
}

// ==== JANELA FLUTUANTE DE AUDITORIA ====
function toggleAuditoria() {
  const win = $('winAuditoria');
  if (!win) return;
  if (win.style.display === 'none' || !win.style.display) {
    win.style.display = 'flex';
    renderLogs();
    if (!win.dataset.moved) {
      win.style.top = '14%';
      win.style.left = Math.max(10, Math.round((window.innerWidth - win.offsetWidth) / 2)) + 'px';
    }
  } else {
    win.style.display = 'none';
  }
}

(function setupDraggableWindow() {
  const win = $('winAuditoria');
  const header = $('winAuditoriaHeader');
  if (!win || !header) return;
  let p1 = 0, p2 = 0, p3 = 0, p4 = 0;
  header.onmousedown = function(e) {
    if (e.target.closest('button')) return;
    e.preventDefault();
    p3 = e.clientX;
    p4 = e.clientY;
    document.onmouseup = closeDrag;
    document.onmousemove = dragElement;
  };
  function dragElement(e) {
    e.preventDefault();
    p1 = p3 - e.clientX;
    p2 = p4 - e.clientY;
    p3 = e.clientX;
    p4 = e.clientY;
    win.dataset.moved = 'true';
    win.style.top = Math.max(10, (win.offsetTop - p2)) + 'px';
    win.style.left = Math.max(10, (win.offsetLeft - p1)) + 'px';
  }
  function closeDrag() {
    document.onmouseup = null;
    document.onmousemove = null;
  }
})();

// ==== INICIALIZAÇÃO & MODO TURBO ====
function bind() {
  fillMonths();
  $('dataEncerramento').value = new Date().toISOString().slice(0,10);$('filterMonth').addEventListener('change', () => {
    localStorage.setItem(LAST_MONTH_KEY, getSelectedMonth());
    updateMetaInput();
    $('mesReferenciaForm').value = getSelectedMonth();
    currentPage = 1;
    renderAll();
    rotateBusinessDiagnostic();
  });
  $('metaInput').addEventListener('input', saveMeta);
  ['filterTipo','filterEncerrado','searchType','pageSize','sortOrder','dateStart','dateEnd'].forEach(id => {
    $(id).addEventListener('change', () => {
      currentPage = 1;
      if(id === 'pageSize') itemsPerPage = parseInt($(id).value, 10);
      renderAll();
    });
  });
  $('searchInput').addEventListener('input', () => {
    currentPage = 1;
    renderAll();
  });
  $('panjud').addEventListener('change', () => {
    if($('panjud').value === 'Sim')$('recusado').value = 'Não';
  });
  $('recusado').addEventListener('change', () => {
    if($('recusado').value === 'Sim')$('panjud').value = 'Não';
  });
  $('dataEncerramento').addEventListener('change', () => {
    const v = $('dataEncerramento').value;
    if(v) $('mesReferenciaForm').value = v.split('-')[1];
  });
  $('processForm').addEventListener('submit', handleSubmit);$('btnCancel').addEventListener('click', clearForm);
  $('btnReset').addEventListener('click', clearForm);$('btnPrevPage').addEventListener('click', () => {
    if(currentPage > 1) { currentPage--; renderAll(); }
  });
  $('btnNextPage').addEventListener('click', () => {
    const max = Math.max(1, Math.ceil(getFiltered().length / itemsPerPage));
    if(currentPage < max) { currentPage++; renderAll(); }
  });
  $('btnRefresh').addEventListener('click', () => loadCloud(false));$('btnAiTop').addEventListener('click', openAI);
  $('openAiFromNav').addEventListener('click', openAI);$('btnAiClose').addEventListener('click', closeAI);
  $('aiBackdrop').addEventListener('click', closeAI);$('btnAiKey').addEventListener('click', configAPIKey);
  $('btnChatSend').addEventListener('click', processAI);$('chatInputText').addEventListener('keydown', e => {
    if(e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      processAI();
    }
  });

  $('sideAuroraCard')?.addEventListener('click', rotateBusinessDiagnostic);

  // MODO TURBO DE NAVEGAÇÃO
  const ordemCampos = ['idCaso','numProcesso','tipoEncerramento','dataEncerramento','mesReferenciaForm','panjud','recusado','observacoes'];
  ordemCampos.forEach((id, index) => {
    const campo = $(id);
    if (!campo) return;
    campo.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && e.ctrlKey) {
        e.preventDefault();
        $('processForm').requestSubmit();
        return;
      }
      if (e.key === 'Enter') {
        e.preventDefault();
        if (index === ordemCampos.length - 1) {
          $('processForm').requestSubmit();
        } else {
          const proximoCampo = $(ordemCampos[index + 1]);
          if (proximoCampo) {
            proximoCampo.focus();
            if (proximoCampo.select) proximoCampo.select();
          }
        }
      }
    });
  });

  $('btnNavAuditoria')?.addEventListener('click', toggleAuditoria);
  $('btnCloseAuditoria')?.addEventListener('click', () => {$('winAuditoria').style.display = 'none'; });

  document.querySelectorAll('.nav-btn[data-target]').forEach(b => {
    b.addEventListener('click', () => {
      document.getElementById(b.dataset.target)?.scrollIntoView({behavior: 'smooth', block: 'start'});
    });
  });

  renderAll();
}

bind();
loadCloud(true);
