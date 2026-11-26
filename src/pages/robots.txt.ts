export const GET = () => new Response(`User-agent: *\nAllow: /\n\nSitemap: https://ezajkowska.pl/sitemap.xml\n`, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
