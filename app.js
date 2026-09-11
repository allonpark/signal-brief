const filters = document.querySelectorAll('.filter');
const stories = document.querySelectorAll('.story');
filters.forEach((button) => button.addEventListener('click', () => {
  filters.forEach((item) => item.classList.remove('active'));
  button.classList.add('active');
  const selected = button.dataset.filter;
  stories.forEach((story) => {
    story.style.display = selected === 'all' || story.dataset.category === selected ? '' : 'none';
  });
}));

const languageButtons = document.querySelectorAll('.language');
const copy = {
  'nav a': [['오늘','Today'],['아카이브','Archive'],['읽는 법','Method']],
  '.subscribe': [['구독하기 ↗','Brief me ↗']],
  '.eyebrow': [['Daily intelligence · 10 SEP 2026 · KST','Daily intelligence · 10 SEP 2026 · KST']],
  'h1': [['오늘의<br><em>핵심 신호.</em>','What matters<br><em>today.</em>']],
  '.intro p': [['반도체의 물리, AI의 속도, 시장의 방향을 하나의 시선으로 읽습니다.','The physics of semiconductors, the pace of AI, and the direction of markets — read as one signal.']],
  '.intro span': [['5 stories · 균형 잡힌 신호 · 깊은 맥락','5 stories · balanced signal · deep context']],
  '.signal-strip strong': [['공정·모델·자본이 같은 방향으로 움직일 때, 다음 변화는 먼저 보입니다.','When process, models, and capital move together, the next shift becomes visible first.']],
  '.strip-meta > span:not(.weather-dot)': [['업데이트 07:42 KST','Updated 07:42 KST'],['5분 읽기','5 min read']],
  '.briefing-head h2': [['오늘의 5개 신호','Five signals today']],
  '.story h3': [['스택이 높아질수록, 전압은 같은 속도로 움직이지 않는다','As the stack grows, voltage does not move at the same speed.'],['모델 경쟁의 다음 병목은 파라미터가 아니라 추론 비용','The next bottleneck in model competition is inference cost, not parameters.'],['AI 인프라 투자는 공급망의 숫자로 검증된다','AI infrastructure investment must be tested against supply-chain numbers.'],['AC stress에서 수명이 길어 보여도 β가 말해주는 것은 다를 수 있다','A longer AC lifetime can still hide a different Weibull β.'],['에이전트의 성능은 모델보다 관측 가능성에서 무너진다','Agents fail in observability before they fail in intelligence.']],
  '.story p': [['VNAND의 channel boosting과 erase transient에서 “인가 전압”과 “실제 채널 전위” 사이의 간극이 다시 핵심 변수가 되고 있다.','In VNAND channel boosting and erase transients, the gap between applied voltage and actual channel potential is becoming the critical variable again.'],['더 큰 모델보다 실제 사용량·메모리 대역폭·서비스 단가가 경쟁력을 가르는 구조가 선명해진다.','Usage, memory bandwidth, and serving cost are becoming stronger moats than model size alone.'],['서버·HBM·전력·패키징의 병목을 함께 봐야 CAPEX 뉴스가 실제 수요인지 구분된다.','Server, HBM, power, and packaging bottlenecks separate real demand from CAPEX headlines.'],['평균 수명 이동과 분포 형상 변화는 분리해서 봐야 한다. TDDB 해석의 함정과 검증 포인트.','Separate the shift in mean lifetime from the change in distribution shape: the key trap in TDDB interpretation.'],['도구 호출, 재시도, 비용, 실패 이유를 측정하지 않으면 데모와 운영 사이의 간극을 설명할 수 없다.','Without measuring tool calls, retries, cost, and failure reasons, the gap between demo and production stays invisible.']],
  '.story-meta time': [['6분','6 min'],['5분','5 min'],['4분','4 min'],['7분','7 min'],['5분','5 min']],
  '.story-foot a': [['신호 읽기 ↗','Read signal ↗'],['신호 읽기 ↗','Read signal ↗'],['신호 읽기 ↗','Read signal ↗'],['신호 읽기 ↗','Read signal ↗'],['신호 읽기 ↗','Read signal ↗']],
  '.method-row h2': [['뉴스를 신호로 바꾸는 법','How we turn news into signal']],
  '.method-copy p': [['헤드라인을 모으는 대신, 무엇이 바뀌었고 그 변화가 어떤 메커니즘으로 확산되는지 추적합니다.','We do not just collect headlines. We trace what changed and the mechanism through which that change spreads.']],
  '.archive-row h2': [['지난 브리핑','Recent editions']],
  '.archive-list strong': [['속도보다 중요한 것들','What matters more than speed'],['전력·메모리·모델의 삼각형','The triangle of power, memory, and models'],['신뢰성 데이터의 읽는 순서','How to read reliability data']],
  'footer p': [['다섯 개의 신호. 더 선명한 아침.','Five signals. One clear morning.']],
  'footer .footer-note': [['매일 업데이트 · 호기심 많은 엔지니어를 위해','Updated daily · Built for curious engineers']]
};
function setLanguage(language) {
  Object.entries(copy).forEach(([selector, values]) => document.querySelectorAll(selector).forEach((element, index) => {
    const value = values[index] || values[0];
    element.innerHTML = value[language === 'ko' ? 0 : 1];
  }));
  languageButtons.forEach((button) => button.classList.toggle('active', button.dataset.language === language));
  document.documentElement.lang = language;
  localStorage.setItem('signal-brief-language', language);
}
languageButtons.forEach((button) => button.addEventListener('click', () => setLanguage(button.dataset.language)));
setLanguage(localStorage.getItem('signal-brief-language') || 'ko');

let currentLanguage = localStorage.getItem('signal-brief-language') || 'ko';
const originalSetLanguage = setLanguage;
setLanguage = (language) => { currentLanguage = language; originalSetLanguage(language); };

function textFor(value) {
  return value?.[currentLanguage] || value?.ko || '';
}

async function loadDailyBriefing() {
  try {
    const response = await fetch('data/index.json', { cache: 'no-store' });
    if (!response.ok) return;
    const data = await response.json();
    const dateLabel = new Date(`${data.date}T00:00:00`).toLocaleDateString(currentLanguage === 'ko' ? 'ko-KR' : 'en-US', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase();
    document.querySelector('.eyebrow').innerHTML = `<span class="live-dot"></span> Daily intelligence · ${dateLabel} · KST`;
    document.querySelector('.signal-strip strong').textContent = textFor(data.signal);
    document.querySelector('.strip-meta span').textContent = currentLanguage === 'ko' ? `업데이트 ${data.updated}` : `Updated ${data.updated}`;
    const cards = document.querySelectorAll('.story');
    data.stories.slice(0, cards.length).forEach((story, index) => {
      const card = cards[index];
      card.dataset.category = story.category;
      card.querySelector('h3').textContent = textFor(story.title);
      card.querySelector('p').textContent = textFor(story.summary);
      card.querySelector('.story-meta time').textContent = `${story.read_minutes} ${currentLanguage === 'ko' ? '분' : 'min'}`;
      card.querySelector('.story-foot span').textContent = textFor(story.impact);
      const link = card.querySelector('.story-foot a');
      link.href = story.source_url;
      link.textContent = currentLanguage === 'ko' ? '원문 보기 ↗' : 'Read source ↗';
      if (story.image_url) {
        const visual = card.querySelector('.visual');
        let image = visual.querySelector('.story-image');
        if (!image) { image = document.createElement('img'); image.className = 'story-image'; visual.appendChild(image); }
        image.src = story.image_url; image.alt = textFor(story.title); image.loading = 'lazy';
      }
    });
    const archive = document.querySelector('.archive-list');
    archive.innerHTML = (data.archive || []).map((entry) => `<a href="${entry.path}"><span>${entry.date}</span><strong>${textFor(entry.title)}</strong><i>↗</i></a>`).join('');
  } catch (error) {
    console.warn('Signal Brief data feed unavailable; using embedded edition.', error);
  }
}
loadDailyBriefing();
