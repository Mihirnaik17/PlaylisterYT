const Anthropic = require('@anthropic-ai/sdk');

const getAnthropicClient = () => {
    const key = process.env.ANTHROPIC_API_KEY;
    if (!key) {
        return null;
    }
    return new Anthropic({ apiKey: key });
};

const getTimeOfDayLabel = (hour) => {
    if (hour >= 5 && hour < 12) return 'morning';
    if (hour >= 12 && hour < 17) return 'afternoon';
    if (hour >= 17 && hour < 21) return 'evening';
    return 'night';
};

const extractTextFromMessage = (message) => {
    const block = message.content.find((b) => b.type === 'text');
    return (block && block.text ? block.text : '').trim();
};

const recommendSongs = async (req, res) => {
    try {
        const client = getAnthropicClient();
        if (!client) {
            return res.status(503).json({
                success: false,
                errorMessage: 'AI recommendations are not configured. Set ANTHROPIC_API_KEY on the server.',
            });
        }

        const { mood, genre, timeOfDay, playlistContext } = req.body;

        if (!mood || typeof mood !== 'string' || !mood.trim()) {
            return res.status(400).json({ success: false, errorMessage: 'Mood is required.' });
        }

        const hour = new Date().getHours();
        const detectedTime = timeOfDay || getTimeOfDayLabel(hour);

        const contextLine =
            Array.isArray(playlistContext) && playlistContext.length > 0
                ? `The user already has these songs: ${playlistContext
                      .map((s) => `"${s.title}" by ${s.artist}`)
                      .join(', ')}. Avoid recommending the same ones.`
                : '';

        const genreLine = genre ? `Preferred genre: ${genre}.` : '';

        const prompt = `You are a world-class music curator. Recommend exactly 6 songs for the following situation:
- Mood: ${mood.trim()}
- Time of day: ${detectedTime}
${genreLine}
${contextLine}

Rules:
- Include a diverse mix across eras (classics + modern hits)
- Each song must be real and well-known
- Reason should be 1 short sentence explaining why it fits the mood/time
- Respond ONLY with a valid JSON array, no other text

JSON format:
[
  {
    "title": "Song Title",
    "artist": "Artist Name",
    "year": 2020,
    "genre": "Pop",
    "reason": "Why this fits perfectly"
  }
]`;

        const message = await client.messages.create({
            model: 'claude-haiku-4-5-20251001',
            max_tokens: 1024,
            messages: [{ role: 'user', content: prompt }],
        });

        const rawText = extractTextFromMessage(message);
        const jsonMatch = rawText.match(/\[[\s\S]*\]/);
        if (!jsonMatch) {
            throw new Error('AI did not return valid JSON');
        }

        const recommendations = JSON.parse(jsonMatch[0]);

        return res.status(200).json({
            success: true,
            recommendations,
            meta: { mood: mood.trim(), timeOfDay: detectedTime, genre: genre || null },
        });
    } catch (error) {
        console.error('AI recommendation error:', error);

        if (error.status === 401) {
            return res.status(500).json({
                success: false,
                errorMessage: 'AI service not configured. Please add your ANTHROPIC_API_KEY.',
            });
        }

        return res.status(500).json({
            success: false,
            errorMessage: 'Failed to get AI recommendations. Please try again.',
        });
    }
};

module.exports = { recommendSongs };
