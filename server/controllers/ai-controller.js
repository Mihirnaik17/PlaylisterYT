const { getTimeOfDayLabel } = require('../utils/time-of-day');

const HF_API_URL = 'https://api-inference.huggingface.co/v1/chat/completions';
const HF_MODEL = 'meta-llama/Llama-3.1-8B-Instruct';

const recommendSongs = async (req, res) => {
    const token = process.env.HF_TOKEN;
    if (!token) {
        return res.status(503).json({
            success: false,
            errorMessage: 'AI recommendations are not configured. Set HF_TOKEN on the server.',
        });
    }

    try {
        const { mood, genre, timeOfDay, playlistContext } = req.body;

        if (!mood || typeof mood !== 'string' || !mood.trim()) {
            return res.status(400).json({ success: false, errorMessage: 'Mood is required.' });
        }

        const hour = new Date().getHours();
        const detectedTime = timeOfDay || getTimeOfDayLabel(hour);
        const genreLine = genre ? `Preferred genre: ${genre}.` : '';
        const contextLine =
            Array.isArray(playlistContext) && playlistContext.length > 0
                ? `The user already has: ${playlistContext.map((s) => `"${s.title}" by ${s.artist}`).join(', ')}. Do not repeat these.`
                : '';

        const userPrompt = `Recommend exactly 6 real, well-known songs for:
- Mood: ${mood.trim()}
- Time of day: ${detectedTime}
${genreLine}
${contextLine}

Include a diverse mix of eras. For each song output ONLY this JSON (no markdown, no extra text):
[{"title":"...","artist":"...","year":2020,"genre":"...","reason":"one sentence why it fits"}]`;

        const hfRes = await fetch(HF_API_URL, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model: HF_MODEL,
                messages: [
                    {
                        role: 'system',
                        content: 'You are a music recommendation API. Respond ONLY with a valid JSON array. No markdown, no code fences, no explanation — raw JSON only.',
                    },
                    { role: 'user', content: userPrompt },
                ],
                max_tokens: 1024,
                temperature: 0.7,
            }),
        });

        if (!hfRes.ok) {
            const errBody = await hfRes.text();
            if (hfRes.status === 401) {
                return res.status(500).json({
                    success: false,
                    errorMessage: 'Invalid HF_TOKEN. Check your Hugging Face API token.',
                });
            }
            if (hfRes.status === 503) {
                return res.status(503).json({
                    success: false,
                    errorMessage: 'AI model is loading, please try again in a moment.',
                });
            }
            console.error('HF API error:', hfRes.status, errBody);
            throw new Error(`HF API returned ${hfRes.status}`);
        }

        const data = await hfRes.json();
        const rawText = (data?.choices?.[0]?.message?.content || '').trim();

        const jsonMatch = rawText.match(/\[[\s\S]*\]/);
        if (!jsonMatch) {
            console.error('HF response missing JSON array:', rawText);
            throw new Error('Model did not return a valid JSON array');
        }

        const recommendations = JSON.parse(jsonMatch[0]);

        return res.status(200).json({
            success: true,
            recommendations,
            meta: { mood: mood.trim(), timeOfDay: detectedTime, genre: genre || null },
        });
    } catch (error) {
        console.error('AI recommendation error:', error);
        return res.status(500).json({
            success: false,
            errorMessage: 'Failed to get AI recommendations. Please try again.',
        });
    }
};

module.exports = { recommendSongs };
