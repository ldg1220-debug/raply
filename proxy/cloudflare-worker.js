// Cloudflare Worker — Yahoo Finance CORS 프록시 (Raply 주식 모드용)
// 사용: Cloudflare 대시보드 → Workers & Pages → Create Worker → 이 코드 붙여넣기 → Deploy
// 앱의 ⚙ 프록시 버튼에 입력할 주소:  https://<워커이름>.<계정>.workers.dev/?url=
const ALLOWED = /^https:\/\/(query1|query2)\.finance\.yahoo\.com\//;
const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': '*'
};

export default {
  async fetch(request) {
    if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: CORS });
    const target = new URL(request.url).searchParams.get('url');
    if (!target || !ALLOWED.test(target)) {
      return new Response('{"error":"bad url"}', { status: 400, headers: { ...CORS, 'content-type': 'application/json' } });
    }
    const r = await fetch(target, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; Raply)', 'Accept': 'application/json' },
      cf: { cacheTtl: 300, cacheEverything: true }
    });
    return new Response(r.body, { status: r.status, headers: { ...CORS, 'content-type': 'application/json' } });
  }
};
