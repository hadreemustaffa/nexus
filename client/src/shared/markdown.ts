import DOMPurify from 'dompurify';
import {
  Marked,
  type RendererExtension,
  type TokenizerExtension,
  type Tokens,
} from 'marked';

import { paths } from '../config/paths';
import type { Note } from '../features/notes/types';

interface WikilinkToken extends Tokens.Generic {
  type: 'wikilink';
  raw: string;
  target: string;
  label: string;
}

DOMPurify.addHook('afterSanitizeAttributes', (node) => {
  if (node.tagName === 'A' && node.getAttribute('target') === '_blank') {
    node.setAttribute('rel', 'noopener noreferrer');
  }
});

function isExternalUrl(href: string): boolean {
  try {
    const url = new URL(href, window.location.origin);
    return url.origin !== window.location.origin;
  } catch {
    return false;
  }
}

function createWikilinkExtension(
  relatedByTitle: Map<string, Note>
): TokenizerExtension & RendererExtension {
  return {
    name: 'wikilink',
    level: 'inline',
    start(src) {
      return src.match(/\[\[/)?.index;
    },
    tokenizer(src): WikilinkToken | undefined {
      const match = /^\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/.exec(src);
      if (match) {
        const [raw, target, label] = match;
        return {
          type: 'wikilink',
          raw,
          target: target.trim(),
          label: (label ?? target).trim(),
        };
      }
      return undefined;
    },
    renderer(token) {
      const { target, label } = token as WikilinkToken;
      const note = relatedByTitle.get(target.toLowerCase());

      if (note) {
        const href = paths.app.notes.note.getHref(note.id);
        return `<a href="${href}" class="wikilink" data-wikilink="${target}" target="_blank">${label}</a>`;
      }

      return `<span class="wikilink wikilink--missing" data-wikilink="${target}">${label}</span>`;
    },
  };
}

export function createMarked(relatedByTitle: Map<string, Note>) {
  return new Marked({
    gfm: true,
    breaks: true,
    extensions: [createWikilinkExtension(relatedByTitle)],
    renderer: {
      link({ href, title, tokens }) {
        const text = this.parser.parseInline(tokens);
        const titleAttr = title ? ` title="${title}"` : '';

        if (isExternalUrl(href)) {
          return `<a href="${href}"${titleAttr} class="external-link" target="_blank" rel="noopener noreferrer">${text}</a>`;
        }

        return `<a href="${href}"${titleAttr}>${text}</a>`;
      },
    },
  });
}
