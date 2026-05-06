import AIService from '../../domain/services/AIService';

export default class OllamaAIService implements AIService {
  async generateTags(content: string): Promise<string[]> {
    const response = await fetch('http://localhost:11434/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'qwen2.5:3b',
        messages: [
          {
            role: 'user',
            content: `You are a tagging system. Extract exactly 5 short tags from the text below.

            Rules:
            - Return ONLY a comma separated list
            - No explanations, no numbering, no extra text
            - Each tag is 1-3 words maximum
            - Multi-word tags use dashes
            - Example output: machine-learning, neural-networks, python, data-science, optimization

            Text: ${content}

            Tags:`,
          },
        ],
        stream: false,
      }),
    });

    if (!response.ok) {
      throw new Error(`Ollama request failed: ${response.statusText}`);
    }

    const data = await response.json();
    console.log(data);
    const raw = data.message.content as string;

    return raw
      .split(',')
      .map((tag) => tag.trim().toLowerCase())
      .filter((tag) => tag.length > 0 && tag.length < 50);
  }
}
