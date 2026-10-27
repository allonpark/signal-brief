# Signal Brief

기술 변화를 기업 실적·현금흐름·가치평가와 국내 상장 ETF로 연결하는 한·영 브리핑입니다. 중요한 변화 2~3건을 중심으로 발행하며 고정 건수·분야 배분은 없습니다.

## 웹사이트에서 읽기

**[Signal Brief 웹사이트 열기](https://allonpark.github.io/signal-brief/)**

국기 버튼으로 한국어와 영어를 전환할 수 있습니다. 메인 카드 전체를 클릭하면 같은 기사 ID의 전용 상세 페이지로 이동하며, 상세 화면에서 해당 날짜의 전체 기사 또는 앞·뒤 기사로 계속 탐색할 수 있습니다.

Daily editions are stored in `data/briefings/YYYY-MM-DD.json`. The latest edition is selected through `data/index.json`, while previous editions remain available in the archive.

## Archive routing

- Latest edition: `./`
- Dated edition: `?date=YYYY-MM-DD#report`
- Story deep dive: `?date=YYYY-MM-DD&story=STORY_ID#report` (the latest edition omits `date`)
- `data/index.json` is the canonical edition index. Daily updates prepend the previous latest edition to `archive` and preserve every older entry.
- Each card and report article share the stable `stories[].id` key. Keep that ID unchanged after publication so bookmarks remain valid.
- The site derives Latest/Newer/Older edition navigation, Previous/Next story navigation, and year groups automatically, so no HTML link editing is required as the archive grows.

## Editorial policy

See [EDITORIAL_POLICY.md](EDITORIAL_POLICY.md) for the Signal Brief project-only public research rules. Publication schedules are not modified by this update.
