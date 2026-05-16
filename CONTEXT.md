# Raply 프로젝트 작업 정리

> 이 문서는 Claude Code 세션의 컨텍스트가 길어져 새 세션에서 이어가기 위해 작성된 정리본입니다.
> 작업 일자: ~ 2026-05-16
> 작업 브랜치: `claude/crypto-pump-dump-analysis-FoCcU`

---

## 1. 프로젝트 개요

- **파일**: `/home/user/raply/index.html` (단일 SPA, ~5,500+ 라인)
- **목적**: Binance USDT-M Perpetual Futures 대상 펌프(Pump) 감지/분석 스캐너
- **데이터 소스**: Binance 공개 API
- **핵심 기능**:
  - 17-signal 누적 점수 (Accumulation Scoring)
  - Crime Grade (S/A/B/C/D — 펌프 폭발력 axis)
  - Conviction score (HIGH/MED/LOW — "지금 갈 가능성" axis)
  - 진단 모달 (캔들 차트 + 기술적 분석 + 트레이드 플랜)

---

## 2. 작업 히스토리 (시간순)

### 2-1. Grade 인플레이션 / 펌프 가능성 평가 추가
**요청**: "검색기에 뜨는 종목들에 대한 판별을 해야할 것 같다. 정말 갈 것 같은지에 대해. 20~100배가 일년에 몇 개 없을텐데 여기 뜨는 종목이 두 세개나 A grade라서 의심된다. 검토에 대한 사유도 필요"

**작업**:
- A grade 인플레이션 해결: `oiMcap >= 0.20` 하드 게이트 추가 (OI 데이터 없으면 A 불가)
- Conviction Score 도입 (HIGH/MED/LOW) — 별도 축
- Grade 결정 사유(reasoning) 표시 추가
- Crime Grade 캘리브레이션: 44-token 실제 검증 기반 (B:5-20x, C:3-10x, D:2-6x)

### 2-2. 이동평균선 길이 연장
**요청**: "상장 후 180일 지난 종목은 MA가 더 길게 이어져야 한다. MA99/VWMA100이 짧게 나옴"

**작업**:
- `runScan` / `analyze` 캔들 페치를 180 → **365일**로 확장
- 백테스트/펌프 감지 경로는 180일 유지

### 2-3. 차트 전략 설명 추가
**요청**: "차트/가격 전략 설명을 가미해줘. 피보나치, RSI, 가격이동평균선, VWMA 활용"

**작업**:
- `computeTradePlan(~line 4520)`: RSI, Fib retracement, MA 시그널 계산
- `renderPotentialAndPlan(~line 4892)`: Crime Grade / Risk / Technical Analysis / Trade Plan 섹션 렌더링

### 2-4. 모달 UX 개선 1차
**요청**: "1. 현재가를 모달 상단에 표시. 2. MA 설정값/Fib 선 숫자가 작고 흐릿함"

**작업**:
- 모달 헤더에 현재가 표시
- MA 레전드 / Fib 라벨 가독성 개선 (폰트 크기, 가중치)

### 2-5. 차트 줌(확대) 기능
**요청**: "차트 확대 안돼?"

**작업**:
- `setupChartZoom(~line 2855)`: 마우스 휠 줌 + 드래그 팬
- SVG viewBox + `preserveAspectRatio="none"` 기반

### 2-6. Fib 라벨 줌 시 늘어남 버그
**요청**: "확대 시 Fib 가격 텍스트가 같이 늘어남"

**작업**:
- chartZoomG (transform 대상) ↔ 외부 텍스트/라벨로 SVG 구조 분리

### 2-7. Fib 박스 위치 조정
**요청**: "확대가 가로로만 늘려진다. Fib 박스를 위쪽 빈공간으로 옮겨줘"

**작업**:
- Fib 가격 박스 위치를 상단 빈공간으로 이동
- 우측 그리드 라벨 충돌 회피: 그리드 라벨을 좌측으로 이동

### 2-8. Fibonacci Extension + 라운드 넘버 추가
**요청**: (Elliott Wave 분석 paste) "이런 식으로 차트 분석하는 게 나을까?"

**대응**:
- Elliott Wave는 추가하지 않고 **Fib Extension (1.272/1.414/1.618/2.0/2.618)** + **라운드 넘버** 심리적 저항만 추가
- 사용자 동의: "응 그렇게 해"

### 2-9. 크로스헤어 + OHLC 툴팁
**요청**: "커서 대면 그 위치의 가격대 확인 가능?"

**작업**:
- 캔들 호버 시 OHLC 툴팁
- 십자선 (crosshair) 표시
- 버그 fix: `tipH` 변수 섀도잉 → `boxH`로 리네임

### 2-10. Fib 패널 정리 + 드래그 가능
**요청**: "Fib 박스 내용 겹친다. Fib 선에 가격 표시하고 박스는 옮길 수 있게"

**작업**:
- 인라인 가격 라벨을 Fib 선에 표시
- Fib 가격 패널 드래그 가능
- 레전드 중복 제거

### 2-11. 진단(Diagnose) 탭 정리 + 줌 Y축 자동맞춤
**요청**: "1. Price & Funding 탭 내용을 진단으로 옮기고 순서 정리. 2. 확대 시 가로만 늘어나서 짜부되는 느낌"

**작업**:
- Price & Funding → Diagnose로 통합. 순서: 차트 → 통계 → Crime Grade → 리스크 → 기술 분석 → 트레이드 플랜 → 펀딩
- chartZoomG를 3개 서브그룹으로 분리: `cz-price`, `cz-vol`, `cz-rsi`
- 각 서브그룹마다 독립 Y transform → TradingView 스타일 Y축 자동 맞춤
- 수식: `syP = rangeP / (vMaxP - vMinP)`, `tyP = syP * ch * ((vMaxP - minP) / rangeP - 1)`

### 2-12. 디자인 시스템 개선 시작
**요청**: "디자인 개선 시작" → 선택: "색상·타이포 시스템", "더 모던/미니멀" → "진단 모달 먼저"

**작업** (중단됨):
- CSS `:root` 토큰 전면 재작성 (color, typography, spacing, radius, shadow)
- 컴포넌트 CSS 클래스 추가 (`~line 290`):
  - `.diag-section--hero`, `.diag-section--bare`
  - `.kpi`, `.kpi-label`, `.kpi-value`, `.kpi-sub`
  - `.metric-row`, `.metric-row-label`, `.metric-row-value`, `.metric-row-tag`
  - `.factor-pill`
  - `.alert-inline` (`.danger` / `.warn` / `.info`)
  - `.grade-chip` (S/A/B/C/D, 56x56 hero용)
  - `.apex-banner`, `.apex-banner-dot`, `.apex-banner-text`
- 기존 인라인 스타일 호환용 변수 alias 유지 (`--panel`, `--accent`, `--info` 등)

### 2-13. MA/VWMA 선 확대 시 굵어짐 버그 (최근 fix)
**요청**: "특정 차트는 확대했을 때 MA, VWMA 선도 같이 확대되어서 캔들이랑 가격대가 가려"

**작업** (완료, 커밋 `98e897d`):
- `polyline` helper (line 2762): `vector-effect="non-scaling-stroke"` 추가 → MA7/25/99/VWMA100 모두 적용
- Fib 선 (line 2785): 동일 속성 적용
- RSI polyline (line 2868): 동일 속성 적용

---

## 3. 핵심 기술 구조 (참조용)

### 3-1. 주요 파일 위치
| 위치 | 역할 |
|---|---|
| `index.html` line 8 | CSS `:root` 디자인 토큰 |
| `index.html` ~line 290 | 컴포넌트 CSS 클래스 (신규) |
| `index.html` ~line 2275 | sparkline polyline |
| `index.html` ~line 2727 | `bigCandleSVG()` — 메인 차트 렌더링 |
| `index.html` ~line 2755 | polyline helper |
| `index.html` ~line 2855 | `setupChartZoom()` — 줌/팬/크로스헤어 |
| `index.html` ~line 2889 | `chartZoomG` 구조 (cz-price / cz-vol / cz-rsi) |
| `index.html` ~line 4520 | `computeTradePlan()` |
| `index.html` ~line 4892 | `renderPotentialAndPlan()` |
| `index.html` ~line 5363 | `renderDiagnosisTab()` |

### 3-2. chartZoomG 구조
```html
<g id="chartZoomG">
  <g id="cz-price">${fibLines}${priceParts}${maLayer}</g>
  <g id="cz-vol">${volParts}</g>
  <g id="cz-rsi">${rsiPolyline}</g>
</g>
```

### 3-3. polyline helper (현재 상태)
```js
const polyline = (vals, color, strokeW, dash) => {
  const pts = [];
  for (let i = 0; i < vals.length; i++) {
    if (vals[i] === null || vals[i] === undefined) continue;
    pts.push(`${cxOf(i).toFixed(2)},${toY(vals[i]).toFixed(2)}`);
  }
  if (pts.length < 2) return '';
  return `<polyline points="${pts.join(' ')}" fill="none" stroke="${color}" stroke-width="${strokeW}" vector-effect="non-scaling-stroke" ${dash ? `stroke-dasharray="${dash}"` : ''} opacity="0.95"/>`;
};
```

### 3-4. MA 컬러 코드
| 라인 | 색상 | 굵기 |
|---|---|---|
| MA7  | `#fbbf24` (노랑) | 1.4 |
| MA25 | `#60a5fa` (파랑) | 1.4 |
| MA99 | `#a78bfa` (보라) | 1.4 |
| VWMA100 | `#ec4899` (핑크) | 2.4 |

### 3-5. Fib 비율
- Retracement: 0.236 / 0.382 / 0.5 / 0.618 / 0.786
- Extension: 1.272 / 1.414 / 1.618 / 2.0 / 2.618

---

## 4. 해결한 주요 버그

| 버그 | 원인 | 해결 |
|---|---|---|
| `tipH` 섀도잉 | `const tipH = 108` 내부 변수가 outer DOM 참조 가림 | 내부 변수를 `boxH`로 리네임 |
| Fib 라벨 확대 시 늘어남 | viewBox 기반 줌이 텍스트까지 stretch | chartZoomG ↔ 외부 텍스트 분리 |
| A grade 인플레이션 | OI 데이터 없이도 A 도달 | `oiMcap >= 0.20` 하드 게이트 |
| 그리드 라벨 ↔ Fib 패널 충돌 | 둘 다 우측 끝에 위치 | 그리드 라벨을 좌측으로 이동 |
| MA99/VWMA100 짧게 나옴 | 180일 캔들로 부족 | 365일로 확장 (scan/analyze 경로) |
| Fib 패널이 차트 가림 | 고정 위치 | 드래그 가능하게 변경 |
| Y축 평탄/짜부됨 | 단일 Y scale | 서브그룹별 독립 Y transform + 가시 캔들 범위 기반 자동 맞춤 |
| **MA/VWMA 확대 시 굵어짐** | transform scale이 stroke까지 확대 | `vector-effect="non-scaling-stroke"` |

---

## 5. 남은 작업 (Pending)

### 진단 모달 디자인 개선 (Phase 1 — 진행 중단)
- [ ] **Verdict/Score 블록을 Hero card로 재디자인** — `.diag-section--hero`, `.grade-chip`, `.kpi` 활용
- [ ] **Crime Grade 카드 시각 계층 재구성** — `.factor-pill`, `.alert-inline` 활용
- [ ] **Apex banner 리파인** — `.apex-banner` 클래스 적용

### Phase 2
- [ ] Trade Plan 시각 그루핑
- [ ] Technical analysis 밀도 조정

> CSS 클래스는 추가되어 있으므로, 이제 진단 모달의 JSX/HTML 부분에서 이 클래스들을 적용하면 됨.

---

## 6. Git 상태

- **현재 브랜치**: `claude/crypto-pump-dump-analysis-FoCcU`
- **마지막 커밋**: `98e897d` (MA/VWMA non-scaling-stroke fix)
- **원격**: `origin/claude/crypto-pump-dump-analysis-FoCcU` (push 완료)
- **PR**: 사용자 명시 요청 시에만 생성

---

## 7. 새 세션 시작 시 권장 첫 명령

```
/home/user/raply/CONTEXT.md 읽고 작업 이어가자.
다음은 진단 모달 디자인 개선:
1) Verdict 블록을 Hero card로 재디자인 (renderPotentialAndPlan ~line 4892 또는 renderDiagnosisTab ~line 5363)
2) Crime Grade 카드 재구성
3) Apex banner 리파인
이미 CSS 클래스(.diag-section--hero, .kpi, .factor-pill, .grade-chip, .apex-banner 등)는 index.html ~line 290에 정의되어 있음.
```
