const state = {
  language: localStorage.getItem('signal-brief-language') || 'ko',
  index: null,
  edition: null,
  selectedDate: null,
  selectedStory: null,
  cards: [],
  activeFilter: 'all'
};

const uiCopy = {
  ko: {
    nav: ['오늘', '전체 리포트', '아카이브'], action: '전체 리포트 <span>↓</span>',
    hero: '기술에서<br><em>투자 신호까지.</em>', intro: '핵심 기술의 작동 원리를 읽고, 공급망·원가·매출과 투자 지표까지 연결합니다.',
    introMeta: '5 stories · technology first · investment connected', briefing: '오늘의 기술·투자 신호 5개', reportTitle: '기술에서 투자까지, 오늘의 심층 리포트',
    reportIntro: '새 기술이 어떤 경제적 경로로 기업 실적에 전달되는지, 확인된 사실과 투자 가설을 분리해 읽습니다.',
    frameworkTitle: '기술 뉴스가 투자 신호가 되는 경로', frameworkCopy: '성능 발표에서 멈추지 않고 경제적 전달 경로와 반증 조건까지 확인합니다.',
    frameworkSteps: ['기술 변화', '경제적 메커니즘', '가치사슬', '투자 확인 지표'],
    methodTitle: '연결해서 읽되, 건너뛰지 않는 법', methodCopy: '기술 우위가 곧바로 기업 이익을 뜻하지 않습니다. 채택률·수율·가격·CAPEX와 시간차를 통과하는지 확인합니다.',
    archiveTitle: '지난 브리핑', footer: '기술을 이해하고, 자본의 방향을 검증합니다.', footerNote: '매일 업데이트 · 엔지니어와 투자자를 위해',
    updated: '업데이트', read: '분', readReport: '리포트 읽기 ↓', source: '원문',
    investmentLens: 'INVESTMENT LENS', horizon: '관찰 시간축',
    sections: {summary:'핵심 요약', mechanism:'기술 메커니즘', changed:'무엇이 달라졌나', valueChain:'가치사슬 전달 경로', investment:'투자 관점의 연결 해석', watch:'확인할 지표', impact:'실무 영향', risks:'반대 시나리오와 위험', evidence:'검증 근거', inference:'편집자 해석과 경계'},
    empty: '이 날짜의 상세 리포트는 아직 준비되지 않았습니다.', error: '리포트를 불러오지 못했습니다.',
    latest: '최신판', latestReport: '최신 리포트 보기', archiveEdition: '아카이브 판', newer: '더 새로운 글', older: '더 오래된 글', noNewer: '현재가 최신입니다', noOlder: '이전 기록 없음',
    storyReport: '기사 심층 분석', allStories: '전체 5개 보기', previousStory: '이전 기사', nextStory: '다음 기사', firstStory: '첫 번째 기사입니다', lastStory: '마지막 기사입니다'
  },
  en: {
    nav: ['Today', 'Full report', 'Archive'], action: 'Full report <span>↓</span>',
    hero: 'From technology<br><em>to investment signal.</em>', intro: 'We connect how critical technologies work to supply chains, cost structures, revenue, and investable metrics.',
    introMeta: '5 stories · technology first · investment connected', briefing: 'Five technology-to-investment signals', reportTitle: "Today's technology and investment report",
    reportIntro: 'Trace how a technical change reaches company economics while keeping verified facts separate from investment hypotheses.',
    frameworkTitle: 'How technology becomes an investment signal', frameworkCopy: 'We follow the transmission path and define what would disprove the thesis.',
    frameworkSteps: ['Technology change', 'Economic mechanism', 'Value chain', 'Investment checks'],
    methodTitle: 'Connect the chain without skipping a link', methodCopy: 'Technical advantage is not automatically profit. Adoption, yield, pricing, capex, and timing must carry it into company results.',
    archiveTitle: 'Recent editions', footer: 'Understand the technology. Verify the capital path.', footerNote: 'Updated daily · Built for engineers and investors',
    updated: 'Updated', read: 'min', readReport: 'Read report ↓', source: 'Source',
    investmentLens: 'INVESTMENT LENS', horizon: 'Watch horizon',
    sections: {summary:'Signal summary', mechanism:'Technical mechanism', changed:'What changed', valueChain:'Value-chain transmission', investment:'Investment interpretation', watch:'Metrics to verify', impact:'Practical impact', risks:'Bear case and risks', evidence:'Validation evidence', inference:'Editorial inference and boundary'},
    empty: 'A detailed report is not available for this edition yet.', error: 'The report could not be loaded.',
    latest: 'LATEST', latestReport: 'Read latest report', archiveEdition: 'ARCHIVE EDITION', newer: 'Newer edition', older: 'Older edition', noNewer: 'This is the latest', noOlder: 'No older edition',
    storyReport: 'Story deep dive', allStories: 'View all five', previousStory: 'Previous story', nextStory: 'Next story', firstStory: 'This is the first story', lastStory: 'This is the last story'
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
function isLatest() { return !state.index || state.selectedDate === state.index.date; }
function editionUrl(storyId = null, hash = 'report') {
  const params = new URLSearchParams();
  if (!isLatest()) params.set('date', state.selectedDate);
  if (storyId) params.set('story', storyId);
  const query = params.toString();
  return `${query ? `?${query}` : './'}${hash ? `#${hash}` : ''}`;
}

function editionEntries() {
  if (!state.index) return [];
  const latest = {date:state.index.date, title:{ko:'오늘의 5개 신호', en:'Five signals today'}, latest:true};
  const archived = (state.index.archive || []).map(entry => ({...entry, dateKey:entry.path?.match(/(\d{4}-\d{2}-\d{2})\.json$/)?.[1]})).filter(entry => entry.dateKey).map(entry => ({...entry, date:entry.dateKey}));
  const unique = new Map([latest, ...archived].map(entry => [entry.date, entry]));
  if (state.selectedDate && !unique.has(state.selectedDate)) unique.set(state.selectedDate, {date:state.selectedDate, title:{ko:'보관 리포트',en:'Archived report'}});
  return [...unique.values()].sort((a,b) => b.date.localeCompare(a.date));
}

function renderChrome() {
  const c = uiCopy[state.language]; document.documentElement.lang = state.language;
  const nav = document.querySelectorAll('nav a'); nav.forEach((el, i) => { if (c.nav[i]) el.textContent = c.nav[i]; el.classList.remove('active'); });
  if (nav[0]) nav[0].href = './'; if (nav[1]) nav[1].href = editionUrl(null); if (nav[2]) nav[2].href = '#archive';
  (isLatest() ? nav[0] : nav[2])?.classList.add('active');
  const action = document.querySelector('.subscribe');
  if (action) { action.innerHTML = isLatest() ? c.action : `${c.latestReport} <span>→</span>`; action.onclick = () => isLatest() ? document.querySelector('#report').scrollIntoView({behavior:'smooth'}) : location.assign('./'); }
  setHtml('h1', isLatest() ? c.hero : (state.language === 'ko' ? '지나간<br><em>신호 다시 읽기.</em>' : 'Revisit a<br><em>past signal.</em>'));
  setText('.intro p', c.intro); setText('.intro span', c.introMeta);
  setText('.briefing-head h2', isLatest() ? c.briefing : `${dateLabel(state.selectedDate)} ${state.language === 'ko' ? '브리핑' : 'briefing'}`);
  setText('.report-title', state.selectedStory ? c.storyReport : isLatest() ? c.reportTitle : `${dateLabel(state.selectedDate)} ${state.language === 'ko' ? '심층 리포트' : 'deep report'}`); setText('.report-intro', c.reportIntro);
  setText('.thesis-row h2', c.frameworkTitle); setText('.thesis-copy', c.frameworkCopy);
  document.querySelectorAll('.thesis-step strong').forEach((el, i) => { el.textContent = c.frameworkSteps[i] || ''; });
  setText('.method-row h2', c.methodTitle); setText('.method-copy p', c.methodCopy); setText('.archive-row h2', c.archiveTitle);
  setText('footer p', c.footer); setText('footer .footer-note', c.footerNote);
  languageButtons.forEach(button => button.classList.toggle('active', button.dataset.language === state.language));
}

function renderEditionHeader() {
  if (!state.edition) return; const c = uiCopy[state.language];
  setHtml('.eyebrow', `<span class="live-dot"></span> Daily intelligence · ${escapeHtml(dateLabel(state.edition.date))} · KST`);
  setText('.signal-strip strong', isLatest() ? local(state.edition.editorial_note || state.index?.signal) : local(state.edition.editorial_note) || (state.language === 'ko' ? '과거 시점의 신호를 당시 공개된 근거와 함께 다시 읽습니다.' : 'Revisit the signal using the evidence available at that point in time.'));
  const meta = document.querySelectorAll('.strip-meta > span:not(.weather-dot)');
  if (meta[0]) meta[0].textContent = `${c.updated} ${state.edition.updated || state.index?.updated || ''}`;
  if (meta[1]) meta[1].textContent = `${state.cards.reduce((n,s) => n + (s.read_minutes || 0), 0)} ${c.read}`;
  const context = document.querySelector('#edition-context');
  if (context) context.innerHTML = isLatest() ? `<span class="edition-badge latest">${c.latest}</span><span>${escapeHtml(dateLabel(state.selectedDate))}</span>` : `<span class="edition-badge">${c.archiveEdition}</span><span>${escapeHtml(dateLabel(state.selectedDate))}</span><a href="./">${c.latestReport} →</a>`;
}

function renderCards() {
  const c = uiCopy[state.language];
  cardElements.forEach((card, index) => {
    const story = state.cards[index]; if (!story) { card.hidden = true; return; }
    card.hidden = false; card.dataset.category = story.category;
    setCardText(card, 'h3', local(story.title)); setCardText(card, 'p', local(story.summary));
    let lens = card.querySelector('.investment-lens');
    if (story.investment_lens) {
      if (!lens) { lens = document.createElement('div'); lens.className = 'investment-lens'; card.querySelector('.story-foot')?.before(lens); }
      lens.innerHTML = `<span>${escapeHtml(c.investmentLens)}</span><strong>${escapeHtml(local(story.investment_lens))}</strong>`;
    } else if (lens) lens.remove();
    setCardText(card, '.story-meta time', `${story.read_minutes || 5} ${c.read}`);
    setCardText(card, '.category', categoryNames[story.category]?.[state.language] || story.category.toUpperCase());
    setCardText(card, '.story-foot > span', local(story.impact || story.practical_impact));
    const link = card.querySelector('.story-foot a'); const id = story.id || `story-${index + 1}`; const detailUrl = editionUrl(id);
    card.dataset.storyId = id; card.dataset.detailUrl = detailUrl; card.tabIndex = 0; card.setAttribute('role', 'link');
    card.setAttribute('aria-label', `${local(story.title)} — ${c.readReport.replace(' ↓', '')}`);
    card.classList.toggle('selected', state.selectedStory === id);
    link.href = detailUrl; link.textContent = c.readReport;
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
function editionNav(position = '') {
  const c = uiCopy[state.language]; const entries = editionEntries(); const index = entries.findIndex(entry => entry.date === state.selectedDate);
  const newer = index > 0 ? entries[index - 1] : null; const older = index >= 0 && index < entries.length - 1 ? entries[index + 1] : null;
  const side = (entry, cls, label, empty) => entry ? `<a class="${cls}" href="?date=${entry.date}#report"><small>${label}</small>${escapeHtml(dateLabel(entry.date))}</a>` : `<span class="${cls} disabled"><small>${label}</small>${empty}</span>`;
  return `<nav class="edition-nav ${position}" aria-label="${state.language === 'ko' ? '브리핑 날짜 이동' : 'Edition navigation'}">${side(newer,'newer',c.newer,c.noNewer)}<a class="latest-link" href="./">${c.latestReport}</a>${side(older,'older',c.older,c.noOlder)}</nav>`;
}
function storyNav(stories, activeIndex, position = '') {
  const c = uiCopy[state.language]; const previous = activeIndex > 0 ? stories[activeIndex - 1] : null; const next = activeIndex < stories.length - 1 ? stories[activeIndex + 1] : null;
  const side = (story, cls, label, empty) => story ? `<a class="${cls}" href="${editionUrl(story.id)}"><small>${label}</small>${escapeHtml(local(story.title))}</a>` : `<span class="${cls} disabled"><small>${label}</small>${empty}</span>`;
  return `<nav class="story-nav ${position}" aria-label="${state.language === 'ko' ? '기사 이동' : 'Story navigation'}">${side(previous,'previous',c.previousStory,c.firstStory)}<a class="all-stories" href="${editionUrl(null)}">← ${c.allStories}</a>${side(next,'next',c.nextStory,c.lastStory)}</nav>`;
}
function renderReport() {
  const container = document.querySelector('#report-content'); const c = uiCopy[state.language]; const stories = state.edition?.stories || [];
  if (!stories.length) { container.innerHTML = `${editionNav()}<div class="report-empty-wrap"><p class="report-empty">${escapeHtml(c.empty)}</p><a href="./">${c.latestReport} →</a></div>${editionNav('bottom')}`; return; }
  const selectedIndex = state.selectedStory ? stories.findIndex(story => story.id === state.selectedStory) : -1;
  if (state.selectedStory && selectedIndex < 0) state.selectedStory = null;
  const visibleStories = selectedIndex >= 0 ? [{story: stories[selectedIndex], index:selectedIndex}] : stories.map((story, index) => ({story, index}));
  const articles = visibleStories.map(({story, index}) => {
    const id = story.id || `story-${index + 1}`;
    const sources = (story.sources?.length ? story.sources : story.source_url ? [{name:c.source,url:story.source_url}] : []).map(source => `<a href="${escapeHtml(source.url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(source.name)} ↗</a>`).join('');
    const image = story.image_url ? `<img src="${escapeHtml(story.image_url)}" alt="" loading="lazy">` : '';
    const investmentLead = story.investment_lens ? `<aside class="investment-lead"><div><span>${escapeHtml(c.investmentLens)}</span><strong>${escapeHtml(local(story.investment_lens))}</strong></div>${story.time_horizon ? `<p><b>${escapeHtml(c.horizon)}</b>${escapeHtml(local(story.time_horizon))}</p>` : ''}</aside>` : '';
    return `<article class="report-article" id="report-${escapeHtml(id)}"><div class="report-number"><span>${String(index + 1).padStart(2,'0')}</span><b>${escapeHtml(categoryNames[story.category]?.[state.language] || story.category)}</b></div><div class="report-body"><div class="report-article-head"><div><p class="report-date">${escapeHtml(story.source_date || state.edition.date)}</p><h3>${escapeHtml(local(story.title))}</h3></div>${image}</div>${investmentLead}<div class="analysis-grid">${detailBlock(c.sections.summary, story.summary)}${detailBlock(c.sections.mechanism, story.mechanism)}${detailBlock(c.sections.changed, story.what_changed)}${detailBlock(c.sections.valueChain, story.value_chain)}${detailBlock(c.sections.investment, story.investment_view)}${detailBlock(c.sections.watch, story.watch_metrics)}${detailBlock(c.sections.impact, story.practical_impact || story.impact)}${detailBlock(c.sections.risks, story.risk_factors)}${detailBlock(c.sections.evidence, story.evidence)}${detailBlock(c.sections.inference, story.inference)}</div>${story.equation ? `<div class="equation"><span>MODEL</span><code>${escapeHtml(story.equation)}</code></div>` : ''}<div class="report-sources">${sources}</div></div></article>`;
  }).join('');
  container.innerHTML = selectedIndex >= 0 ? `${storyNav(stories, selectedIndex)}${articles}${storyNav(stories, selectedIndex, 'bottom')}` : `${editionNav()}${articles}${editionNav('bottom')}`;
}

function renderArchive() {
  const archive = document.querySelector('.archive-list'); if (!archive || !state.index) return;
  const c = uiCopy[state.language]; const selectedYear = state.selectedDate?.slice(0,4); const selectedMonth = state.selectedDate?.slice(0,7);
  const groups = editionEntries().reduce((map, entry) => { const year = entry.date.slice(0,4); const month = entry.date.slice(0,7); (((map[year] ||= {})[month] ||= [])).push(entry); return map; }, {});
  const monthName = value => new Date(`${value}-01T00:00:00`).toLocaleDateString(state.language === 'ko' ? 'ko-KR' : 'en-US', {month:'long'});
  archive.innerHTML = Object.entries(groups).sort(([a],[b]) => b.localeCompare(a)).map(([year, months]) => {
    const count = Object.values(months).reduce((n, entries) => n + entries.length, 0);
    const monthHtml = Object.entries(months).sort(([a],[b]) => b.localeCompare(a)).map(([month, entries]) => `<details class="archive-month" ${month === selectedMonth ? 'open' : ''}><summary><span>${escapeHtml(monthName(month))}</span><b>${entries.length}</b></summary><div class="archive-year-links">${entries.map(entry => `<a class="archive-entry ${entry.date === state.selectedDate ? 'current' : ''}" href="${entry.latest ? './' : `?date=${entry.date}#report`}"><span>${escapeHtml(dateLabel(entry.date))}</span><strong>${escapeHtml(local(entry.title))}</strong>${entry.latest ? `<b class="archive-mark latest">${c.latest}</b>` : '<b class="archive-mark">ARCHIVE</b>'}<i>↗</i></a>`).join('')}</div></details>`).join('');
    return `<details class="archive-year" ${year === selectedYear ? 'open' : ''}><summary><span>${year}</span><b>${count} ${state.language === 'ko' ? '개 리포트' : 'editions'}</b></summary><div class="archive-months">${monthHtml}</div></details>`;
  }).join('');
}
function renderAll() { renderChrome(); renderEditionHeader(); renderCards(); renderReport(); renderArchive(); document.title = `${dateLabel(state.selectedDate)} · Signal Brief`; }
async function fetchJson(url) { const response = await fetch(url, {cache:'no-store'}); if (!response.ok) throw new Error(`${response.status} ${url}`); return response.json(); }
async function loadSite() {
  try {
    state.index = await fetchJson('data/index.json'); const params = new URLSearchParams(location.search); const requested = params.get('date'); state.selectedDate = requested || state.index.date; state.selectedStory = params.get('story');
    try { state.edition = await fetchJson(`data/briefings/${state.selectedDate}.json`); }
    catch (editionError) { console.warn(editionError); state.edition = {date:state.selectedDate, stories:[]}; }
    state.cards = state.edition.stories?.length ? state.edition.stories : state.selectedDate === state.index.date ? state.index.stories : [];
    renderAll();
  } catch (error) { console.warn(error); state.selectedDate = new URLSearchParams(location.search).get('date'); document.querySelector('#report-content').innerHTML = `<div class="report-empty-wrap"><p class="report-empty">${escapeHtml(uiCopy[state.language].error)}</p><a href="./">${uiCopy[state.language].latestReport} →</a></div>`; }
}

filters.forEach(button => button.addEventListener('click', () => { state.activeFilter = button.dataset.filter; filters.forEach(item => item.classList.toggle('active', item === button)); applyFilter(); }));
languageButtons.forEach(button => button.addEventListener('click', () => { state.language = button.dataset.language; localStorage.setItem('signal-brief-language', state.language); renderAll(); }));
cardElements.forEach(card => {
  card.addEventListener('click', event => { if (!event.target.closest('a,button') && card.dataset.detailUrl) location.assign(card.dataset.detailUrl); });
  card.addEventListener('keydown', event => { if ((event.key === 'Enter' || event.key === ' ') && card.dataset.detailUrl) { event.preventDefault(); location.assign(card.dataset.detailUrl); } });
});
renderChrome(); loadSite();
