# 주식 모드 프록시 설정

Yahoo Finance는 브라우저에서 직접 호출할 수 없습니다(CORS 헤더 없음).
무료 공용 프록시(corsproxy.io 등)는 대부분 막혀서, **본인 프록시를 1개 만드는 것**이 가장 안정적입니다.
아래 두 방법 중 하나만 하면 됩니다. 둘 다 무료 플랜으로 충분합니다.

## 방법 A. Cloudflare Worker (가장 쉬움, 5분)

1. https://dash.cloudflare.com 가입/로그인 → **Workers & Pages** → **Create** → **Create Worker**
2. 이름 입력(예: `raply-yf`) → **Deploy** → **Edit code**
3. 기본 코드를 지우고 `proxy/cloudflare-worker.js` 내용을 붙여넣기 → **Deploy**
4. 표시된 주소 `https://raply-yf.<계정>.workers.dev` 를 복사
5. 앱 상단 **⚙ 프록시** 버튼 → 아래처럼 입력 (끝의 `?url=` 포함)

```
https://raply-yf.<계정>.workers.dev/?url=
```

## 방법 B. Vercel (앱 전체를 호스팅)

1. 이 저장소(`index.html` + `api/yf.js`)를 Vercel에 Import → Deploy
2. 배포된 주소(예: `https://raply.vercel.app`)로 접속하면 앱이 같은 출처의 `/api/yf` 를 **자동으로** 사용합니다.
   (⚙ 프록시 설정 불필요)

## 확인

⚙ 프록시를 설정한 뒤 미국 주식 모드에서 `AAPL` 진단 → 차트와 재무 지표가 나오면 성공입니다.
프록시 주소를 비우면 공용 프록시 사용으로 돌아갑니다.

## 제공되는 데이터 / 제공되지 않는 데이터

Yahoo가 로그인 토큰(crumb)을 요구하는 항목은 가져올 수 없어 표시하지 않습니다.

| 가능 | 불가 |
|---|---|
| 캔들·거래량·52주 범위·장외 가격 | 베타 |
| PER·PBR·PSR·PEG·EV/EBITDA·시총 | 공매도 비율/잔고 |
| ROE·ROA·이익률·부채비율·유동비율·FCF | 애널리스트 의견·목표가 |
| 매출/EPS 성장률(연간) | 다음 실적 발표일 |
| 배당(최근 12개월 합계로 계산) | 회사 소개 문구 |
