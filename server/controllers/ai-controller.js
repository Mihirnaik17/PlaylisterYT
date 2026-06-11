const { getTimeOfDayLabel } = require('../utils/time-of-day');
const OpenAI = require('openai');

const recommendSongs = async (req, res) => {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
        return res.status(503).json({
            success: false,
            errorMessage: 'AI recommendations are not configured. Set OPENAI_API_KEY on the server.',
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

        const client = new OpenAI({ apiKey });

        const response = await client.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [
                {
                    role: 'system',
                    content: 'You are a music recommendation API. Respond ONLY with a valid JSON array. No markdown, no code fences, no explanation — raw JSON only.',
                },
                { role: 'user', content: userPrompt },
            ],
            temperature: 0.7,
            max_tokens: 1024,
        });

        const rawText = (response.choices[0]?.message?.content || '').trim();

        const jsonMatch = rawText.match(/\[[\s\S]*\]/);
        if (!jsonMatch) {
            console.error('OpenAI response missing JSON array:', rawText);
            throw new Error('Model did not return a valid JSON array');
        }

        let recommendations;
        try {
            recommendations = JSON.parse(jsonMatch[0]);
        } catch (parseErr) {
            console.error('Failed to parse OpenAI JSON response:', rawText);
            throw new Error('Model returned malformed JSON');
        }

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
