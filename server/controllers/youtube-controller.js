const https = require('https');

function extractVideoId(url) {
    try {
        const u = new URL(url);
        if (u.hostname === 'youtu.be') return u.pathname.slice(1).split('?')[0];
        if (u.hostname.includes('youtube.com')) {
            const v = u.searchParams.get('v');
            if (v) return v;
            // /embed/<id> or /shorts/<id>
            const match = u.pathname.match(/\/(embed|shorts|v)\/([^/?&]+)/);
            if (match) return match[2];
        }
    } catch (_) {}
    return null;
}

function extractYear(title) {
    const m = title.match(/[\[(](\d{4})[\])]/) || title.match(/\b(19\d{2}|20[012]\d)\b/);
    return m ? parseInt(m[1]) : new Date().getFullYear();
}

function fetchJson(url) {
    return new Promise((resolve, reject) => {
        https.get(url, { timeout: 5000 }, (res) => {
            let data = '';
            res.on('data', (chunk) => { data += chunk; });
            res.on('end', () => {
                try { resolve(JSON.parse(data)); }
                catch (e) { reject(new Error('Invalid JSON from oEmbed')); }
            });
        }).on('error', reject).on('timeout', () => reject(new Error('Request timed out')));
    });
}

const getVideoMeta = async (req, res) => {
    const { url } = req.query;
    if (!url) return res.status(400).json({ success: false, errorMessage: 'url query param required' });

    const videoId = extractVideoId(url);
    if (!videoId) return res.status(400).json({ success: false, errorMessage: 'Could not parse YouTube video ID from URL' });

    try {
        const oembedUrl = `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${encodeURIComponent(videoId)}&format=json`;
        const data = await fetchJson(oembedUrl);

        return res.json({
            success: true,
            title: data.title || '',
            artist: data.author_name || '',
            year: extractYear(data.title || ''),
            videoId,
            thumbnailUrl: data.thumbnail_url || `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
        });
    } catch (err) {
        return res.status(502).json({ success: false, errorMessage: 'Failed to fetch YouTube metadata: ' + err.message });
    }
};

module.exports = { getVideoMeta };
