const state = {
  language: localStorage.getItem('signal-brief-language') || 'ko',
  index: null,
  edition: null,
  cards: [],
  activeFilter: 'all'
};

const uiCopy = {
  ko: {
    nav: ['오늘', '전체 리포트', '아카이브'], action: '전체 리포트 <span>↓</span>',
    hero: '오늘의<br><em>핵심 신호.</em>', intro: '반도체의 물리, AI의 속도, 시장의 방향을 하나의 시선으로 읽습니다.',
    introMeta: '5 stories · 균형 잡힌 신호 · 깊은 맥락', briefing: '오늘의 5개 신호', reportTitle: '오늘의 심층 리포트',
    reportIntro: '각 신호의 사실, 작동 메커니즘, 이전 상태와의 차이, 실무 영향과 검증 근거를 순서대로 읽습니다.',
    methodTitle: '뉴스를 신호로 바꾸는 법', methodCopy: '헤드라인을 모으는 대신, 무엇이 바뀌었고 그 변화가 어떤 메커니즘으로 확산되는지 추적합니다.',
    archiveTitle: '지난 브리핑', footer: '다섯 개의 신호. 더 선명한 아침.', footerNote: '매일 업데이트 · 호기심 많은 엔지니어를 위해',
    updated: '업데이트', read: '분', readReport: '리포트 읽기 ↓', source: '원문',
    sections: {summary:'핵심 요약', mechanism:'작동 메커니즘', changed:'무엇이 달라졌나', impact:'실무 영향', evidence:'검증 근거', inference:'해석과 관찰 포인트'},
    empty: '이 날짜의 상세 리포트는 아직 준비되지 않았습니다.', error: '리포트를 불러오지 못했습니다.'
  },
  en: {
    nav: ['Today', 'Full report', 'Archive'], action: 'Full report <span>↓</span>',
    hero: 'What matters<br><em>today.</em>', intro: 'The physics of semiconductors, the pace of AI, and the direction of markets — read as one signal.',
    introMeta: '5 stories · balanced signal · deep context', briefing: 'Five signals today', reportTitle: "Today's deep report",
    reportIntro: 'Read each signal through verified facts, its mechanism, what changed, practical impact, and supporting evidence.',
    methodTitle: 'How we turn news into signal', methodCopy: 'We do not just collect headlines. We trace what changed and the mechanism through which that change spreads.',
    archiveTitle: 'Recent editions', footer: 'Five signals. One clear morning.', footerNote: 'Updated daily · Built for curious engineers',
    updated: 'Updated', read: 'min', readReport: 'Read report ↓', source: 'Source',
    sections: {summary:'Signal summary', mechanism:'Underlying mechanism', changed:'What changed', impact:'Practical impact', evidence:'Validation evidence', inference:'Inference and watchpoints'},
    empty: 'A detailed report is not available for this edition yet.', error: 'The report could not be loaded.'
  }
};

const categoryNames = {
  semi: {ko:'반도체 / 신뢰성', en:'SEMICONDUCTOR / RELIABILITY'},
  ai: {ko:'AI / OPENAI', en:'AI / OPENAI'}, market: {ko:'기술 시장', en:'TECH MARKET'}
};

const languageButtons = document.querySelectorAll('.language');
const filters = document.querySelectorAll('.filter');
const cardElements = [...document.querySelectorAll('.story')];

function local(value) { return value?.[state.language] || value?.ko || value?.en || ''; }
function escapeHtml(value = '') { return String(value).replace(/[&<>'"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c])); }
function dateLabel(date) { return date ? new Date(`${date}T00:00:00`).toLocaleDateString(state.language === 'ko' ? 'ko-KR' : 'en-US', {day:'2-digit', month:'short', year:'numeric'}).toUpperCase() : ''; }
function setHtml(selector, value) { const el = document.querySelector(selector); if (el) el.innerHTML = value; }
function setText(selector, value) { const el = document.querySelector(selector); if (el) el.textContent = value; }
function setCardText(card, selector, value) { const el = card.querySelector(selector); if (el) el.textContent = value || ''; }

function renderChrome() {
  const c = uiCopy[state.language]; document.documentElement.lang = state.language;
  document.querySelectorAll('nav a').forEach((el, i) => { if (c.nav[i]) el.textContent = c.nav[i]; });
  setHtml('.subscribe', c.action); setHtml('h1', c.hero); setText('.intro p', c.intro); setText('.intro span', c.introMeta);
  setText('.briefing-head h2', c.briefing); setText('.report-title', c.reportTitle); setText('.report-intro', c.reportIntro);
  setText('.method-row h2', c.methodTitle); setText('.method-copy p', c.methodCopy); setText('.archive-row h2', c.archiveTitle);
  setText('footer p', c.footer); setText('footer .footer-note', c.footerNote);
  languageButtons.forEach(button => button.classList.toggle('active', button.dataset.language === state.language));
}

function renderEditionHeader() {
  if (!state.edition) return; const c = uiCopy[state.language];
  setHtml('.eyebrow', `<span class="live-dot"></span> Daily intelligence · ${escapeHtml(dateLabel(state.edition.date))} · KST`);
  setText('.signal-strip strong', local(state.edition.editorial_note || state.index?.signal));
  const meta = document.querySelectorAll('.strip-meta > span:not(.weather-dot)');
  if (meta[0]) meta[0].textContent = `${c.updated} ${state.edition.updated || state.index?.updated || ''}`;
  if (meta[1]) meta[1].textContent = `${state.cards.reduce((n,s) => n + (s.read_minutes || 0), 0)} ${c.read}`;
}

function renderCards() {
  const c = uiCopy[state.language];
  cardElements.forEach((card, index) => {
    const story = state.cards[index]; if (!story) { card.hidden = true; return; }
    card.hidden = false; card.dataset.category = story.category;
    setCardText(card, 'h3', local(story.title)); setCardText(card, 'p', local(story.summary));
    setCardText(card, '.story-meta time', `${story.read_minutes || 5} ${c.read}`);
    setCardText(card, '.category', categoryNames[story.category]?.[state.language] || story.category.toUpperCase());
    setCardText(card, '.story-foot > span', local(story.impact || story.practical_impact));
    const link = card.querySelector('.story-foot a'); const id = story.id || `story-${index + 1}`;
    link.href = `#report-${encodeURIComponent(id)}`; link.textContent = c.readReport;
    const visual = card.querySelector('.visual'); let image = visual.querySelector('.story-image');
    if (story.image_url) {
      if (!image) { image = document.createElement('img'); image.className = 'story-image'; visual.appendChild(image); }
      image.src = story.image_url; image.alt = local(story.title); image.loading = index < 2 ? 'eager' : 'lazy';
    } else if (image) image.remove();
  });
  applyFilter(); updateFilterCounts();
}

function applyFilter() { cardElements.forEach(card => { if (!card.hidden) card.style.display = state.activeFilter === 'all' || card.dataset.category === state.activeFilter ? '' : 'none'; }); }
function updateFilterCounts() {
  const counts = {all:state.cards.length, semi:0, ai:0, market:0}; state.cards.forEach(s => { if (counts[s.category] !== undefined) counts[s.category] += 1; });
  filters.forEach(button => { const b = button.querySelector('b'); if (b) b.textContent = String(counts[button.dataset.filter] || 0).padStart(2,'0'); });
}

function detailBlock(label, value) { const text = local(value); return text ? `<section class="analysis-block"><h4>${escapeHtml(label)}</h4><p>${escapeHtml(text)}</p></section>` : ''; }
function renderReport() {
  const container = document.querySelector('#report-content'); const c = uiCopy[state.language]; const stories = state.edition?.stories || [];
  if (!stories.length) { container.innerHTML = `<p class="report-empty">${escapeHtml(c.empty)}</p>`; return; }
  container.innerHTML = stories.map((story, index) => {
    const id = story.id || `story-${index + 1}`;
    const sources = (story.sources?.length ? story.sources : story.source_url ? [{name:c.source,url:story.source_url}] : []).map(source => `<a href="${escapeHtml(source.url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(source.name)} ↗</a>`).join('');
    const image = story.image_url ? `<img src="${escapeHtml(story.image_url)}" alt="" loading="lazy">` : '';
    return `<article class="report-article" id="report-${escapeHtml(id)}"><div class="report-number"><span>${String(index + 1).padStart(2,'0')}</span><b>${escapeHtml(categoryNames[story.category]?.[state.language] || story.category)}</b></div><div class="report-body"><div class="report-article-head"><div><p class="report-date">${escapeHtml(story.source_date || state.edition.date)}</p><h3>${escapeHtml(local(story.title))}</h3></div>${image}</div><div class="analysis-grid">${detailBlock(c.sections.summary, story.summary)}${detailBlock(c.sections.mechanism, story.mechanism)}${detailBlock(c.sections.changed, story.what_changed)}${detailBlock(c.sections.impact, story.practical_impact || story.impact)}${detailBlock(c.sections.evidence, story.evidence)}${detailBlock(c.sections.inference, story.inference)}</div>${story.equation ? `<div class="equation"><span>MODEL</span><code>${escapeHtml(story.equation)}</code></div>` : ''}<div class="report-sources">${sources}</div></div></article>`;
  }).join('');
}

function renderArchive() {
  const archive = document.querySelector('.archive-list'); if (!archive || !state.index) return;
  archive.innerHTML = (state.index.archive || []).map(entry => { const date = entry.path?.match(/(\d{4}-\d{2}-\d{2})\.json$/)?.[1]; return `<a href="${date ? `?date=${date}` : '#archive'}"><span>${escapeHtml(entry.date)}</span><strong>${escapeHtml(local(entry.title))}</strong><i>↗</i></a>`; }).join('');
}
function renderAll() { renderChrome(); renderEditionHeader(); renderCards(); renderReport(); renderArchive(); }
async function fetchJson(url) { const response = await fetch(url, {cache:'no-store'}); if (!response.ok) throw new Error(`${response.status} ${url}`); return response.json(); }
async function loadSite() {
  try {
    state.index = await fetchJson('data/index.json'); const requested = new URLSearchParams(location.search).get('date'); const selectedDate = requested || state.index.date;
    state.edition = await fetchJson(`data/briefings/${selectedDate}.json`);
    state.cards = state.edition.stories?.length ? state.edition.stories : selectedDate === state.index.date ? state.index.stories : [];
    renderAll();
  } catch (error) { console.warn(error); document.querySelector('#report-content').innerHTML = `<p class="report-empty">${escapeHtml(uiCopy[state.language].error)}</p>`; }
}

filters.forEach(button => button.addEventListener('click', () => { state.activeFilter = button.dataset.filter; filters.forEach(item => item.classList.toggle('active', item === button)); applyFilter(); }));
languageButtons.forEach(button => button.addEventListener('click', () => { state.language = button.dataset.language; localStorage.setItem('signal-brief-language', state.language); renderAll(); }));
renderChrome(); loadSite();
