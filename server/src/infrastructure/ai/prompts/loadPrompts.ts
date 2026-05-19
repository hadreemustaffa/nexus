import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const promptCache = new Map<string, string>();

export async function loadPrompt(name: string): Promise<string> {
  if (promptCache.has(name)) {
    return promptCache.get(name)!;
  }

  const filePath = path.join(__dirname, `${name}.md`);

  const content = await fs.readFile(filePath, 'utf-8');

  promptCache.set(name, content);

  return content;
}
