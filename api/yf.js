// Vercel Serverless Function — Yahoo Finance 프록시 (Raply 주식 모드용)
// index.html 과 같은 프로젝트에 두고 배포하면 앱이 같은 출처의 /api/yf 를 자동으로 사용합니다.
const ALLOWED = /^https:\/\/(query1|query2)\.finance\.yahoo\.com\//;

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  if (req.method === 'OPTIONS') return res.status(204).end();

  const target = req.query.url;
  if (!target || !ALLOWED.test(target)) return res.status(400).json({ error: 'bad url' });

  try {
    const r = await fetch(target, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; Raply)', 'Accept': 'application/json' }
    });
    const body = await r.text();
    res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=600');
    res.setHeader('Content-Type', 'application/json');
    return res.status(r.status).send(body);
  } catch (e) {
    return res.status(502).json({ error: String(e.message || e) });
  }
}
