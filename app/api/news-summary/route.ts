export const dynamic = 'force-dynamic'

export async function POST(req: Request) {
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) return Response.json({ summary: null, error: 'No API key' })

  const { articles, topic, mode } = await req.json()
  if (!articles?.length) return Response.json({ summary: null })

  const prompt = mode === 'article'
    ? (() => {
        const a = articles[0]
        const context = a.description ? `\nDetails: ${a.description}` : ''
        return `You are a news summarizer. Write 2-3 direct sentences about this article. Include the most important specific facts — scores, results, names, numbers, rankings, or outcomes if they appear. Do not just describe what the article is about; state the actual facts.\n\nHeadline: ${a.title}${context}`
      })()
    : (() => {
        const lines = articles.map((a: { title: string; description?: string }, i: number) => {
          const ctx = a.description ? ` — ${a.description.slice(0, 120)}` : ''
          return `${i + 1}. ${a.title}${ctx}`
        }).join('\n')
        return `You are a sharp news briefing assistant. Based on these ${topic} headlines, write a 3-4 sentence digest. Include specific results, scores, standings, names, and key facts where present — not just vague summaries. Be concise and conversational, like a knowledgeable friend catching you up.\n\nHeadlines:\n${lines}`
      })()

  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 500,
        messages: [{ role: 'user', content: prompt }],
      }),
    })
    const data = await res.json()
    const summary = data?.content?.[0]?.text || null
    return Response.json({ summary })
  } catch (e) {
    return Response.json({ summary: null, error: String(e) })
  }
}
