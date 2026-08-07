import DOMPurify from 'dompurify';
import { useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router';

import type { Note } from '../../../features/notes/types';
import { createMarked } from '../../markdown';

interface MarkdownBodyProps {
  content: string;
  relatedByTitle: Map<string, Note>;
}

export default function MarkdownBody({
  content,
  relatedByTitle,
}: MarkdownBodyProps) {
  const navigate = useNavigate();
  const marked = useMemo(() => createMarked(relatedByTitle), [relatedByTitle]);

  const html = useMemo(() => {
    const raw = marked.parse(content) as string;
    return DOMPurify.sanitize(raw, { ADD_ATTR: ['data-wikilink', 'target'] });
  }, [marked, content]);

  // since this is pure html, we cannot use React Router's <NavLink> for wikilinks
  // so we use navigate() instead
  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const anchor = (e.target as HTMLElement).closest('a.wikilink');
      if (!anchor) return;

      const href = anchor.getAttribute('href');
      if (!href) return;

      // let modified clicks (ctrl/cmd/middle-click) behave normally
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;

      e.preventDefault();
      void navigate(href);
    },
    [navigate]
  );

  return (
    <div
      className='markdown-body'
      onClick={handleClick}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
