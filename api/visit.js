const { isIP } = require('node:net');
const config = require('../lib/public-supabase.json');

module.exports = async (req, res) => {
    res.setHeader('Cache-Control', 'no-store');
    if (req.method !== 'POST') return res.status(405).end();
    if (req.headers.origin && req.headers.origin !== `https://${req.headers.host}`) return res.status(403).end();
    if (process.env.VERCEL !== '1') return res.status(204).end();
    const header = name => typeof req.headers[name] === 'string' ? req.headers[name] : '';
    const candidate = header('x-forwarded-for').split(',')[0].trim();
    const ip = isIP(candidate) ? candidate : null;
    const code = header('x-vercel-ip-country').toUpperCase();
    let country = 'Location unavailable';
    if (/^[A-Z]{2}$/.test(code)) {
        try { country = new Intl.DisplayNames(['en'], { type: 'region' }).of(code); } catch {}
    }
    let city = header('x-vercel-ip-city');
    try { city = decodeURIComponent(city); } catch { city = ''; }
    const agent = header('user-agent');
    const browser = /Edg\//.test(agent) ? 'Edge' : /OPR\//.test(agent) ? 'Opera' : /Firefox\//.test(agent) ? 'Firefox' : /Chrome\//.test(agent) ? 'Chrome' : /Safari\//.test(agent) ? 'Safari' : 'Other';
    try {
        const response = await fetch(`${config.url}/rest/v1/rpc/record_visit_details`, {
            method: 'POST',
            headers: { apikey: config.anonKey, Authorization: `Bearer ${config.anonKey}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({ p_browser: browser, p_ip: ip, p_country: country.slice(0,100), p_city: city.slice(0,100) || null }),
            signal: AbortSignal.timeout(7000)
        });
        if (!response.ok) return res.status(503).json({ error: 'Visit recording unavailable' });
        return res.status(204).end();
    } catch {
        return res.status(503).json({ error: 'Visit recording unavailable' });
    }
};
