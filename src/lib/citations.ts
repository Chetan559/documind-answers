import { CitationEntry, CitationFormat, DocumentMetadata } from '@/types';

interface CitationOptions {
  includePageRefs: boolean;
  includeExcerpts: boolean;
}

function formatAuthorsAPA(authors: string[]): string {
  if (!authors.length) return '';
  if (authors.length === 1) return `${authors[0]}.`;
  if (authors.length === 2) return `${authors[0]}, & ${authors[1]}.`;
  if (authors.length <= 20) {
    const all = authors.slice(0, -1).join(', ');
    return `${all}, & ${authors[authors.length - 1]}.`;
  }
  return `${authors.slice(0, 19).join(', ')}, ... ${authors[authors.length - 1]}.`;
}

function formatAuthorsMLA(authors: string[]): string {
  if (!authors.length) return '';
  if (authors.length === 1) return `${authors[0]}.`;
  if (authors.length === 2) return `${authors[0]}, and ${authors[1]}.`;
  return `${authors[0]}, et al.`;
}

function formatAuthorsChicago(authors: string[]): string {
  if (!authors.length) return '';
  if (authors.length === 1) return `${authors[0]}.`;
  if (authors.length <= 3) {
    const all = authors.slice(0, -1).join(', ');
    return `${all}, and ${authors[authors.length - 1]}.`;
  }
  return `${authors[0]}, et al.`;
}

function bibtexKey(meta: DocumentMetadata): string {
  const lastName = meta.authors[0]?.split(',')[0]?.trim().toLowerCase() || 'unknown';
  return `${lastName}${meta.year || 'nd'}`;
}

function generateAPA(entry: CitationEntry, options: CitationOptions): string {
  const m = entry.metadata;
  if (!m) return `[Metadata missing for: ${entry.documentName}]`;

  const parts: string[] = [];
  parts.push(m.authors.length ? formatAuthorsAPA(m.authors) : '');
  parts.push(m.year ? ` (${m.year}).` : ' (n.d.).');
  parts.push(m.documentType === 'article' ? ` ${m.title}.` : ` *${m.title}*.`);

  if (m.journal) parts.push(` *${m.journal}*`);
  if (m.volume) parts.push(`, ${m.volume}`);
  if (m.issue) parts.push(`(${m.issue})`);
  if (m.pages) parts.push(`, ${m.pages}`);
  if (m.journal) parts.push('.');
  if (m.publisher) parts.push(` ${m.publisher}.`);
  if (options.includePageRefs && entry.pageNumbers.length) {
    parts.push(` (pp. ${entry.pageNumbers.join(', ')})`);
  }
  if (m.doi) parts.push(` https://doi.org/${m.doi}`);
  else if (m.url) parts.push(` ${m.url}`);

  let result = parts.join('').replace(/\.\./g, '.').trim();
  if (options.includeExcerpts && entry.excerpts.length) {
    result += '\n\n' + entry.excerpts.map((e) => `  "${e}"`).join('\n');
  }
  return result;
}

function generateMLA(entry: CitationEntry, options: CitationOptions): string {
  const m = entry.metadata;
  if (!m) return `[Metadata missing for: ${entry.documentName}]`;

  const parts: string[] = [];
  parts.push(m.authors.length ? formatAuthorsMLA(m.authors) : '');

  if (m.documentType === 'article') {
    parts.push(` "${m.title}."`);
    if (m.journal) parts.push(` *${m.journal}*`);
    if (m.volume) parts.push(`, vol. ${m.volume}`);
    if (m.issue) parts.push(`, no. ${m.issue}`);
    if (m.year) parts.push(`, ${m.year}`);
    if (m.pages) parts.push(`, pp. ${m.pages}`);
    parts.push('.');
  } else {
    parts.push(` *${m.title}*.`);
    if (m.publisher) parts.push(` ${m.publisher},`);
    if (m.year) parts.push(` ${m.year}.`);
  }
  if (m.doi) parts.push(` doi:${m.doi}.`);
  else if (m.url) parts.push(` ${m.url}.`);

  if (options.includePageRefs && entry.pageNumbers.length) {
    parts.push(` pp. ${entry.pageNumbers.join(', ')}.`);
  }

  let result = parts.join('').replace(/\.\./g, '.').trim();
  if (options.includeExcerpts && entry.excerpts.length) {
    result += '\n\n' + entry.excerpts.map((e) => `  "${e}"`).join('\n');
  }
  return result;
}

function generateChicago(entry: CitationEntry, options: CitationOptions): string {
  const m = entry.metadata;
  if (!m) return `[Metadata missing for: ${entry.documentName}]`;

  const parts: string[] = [];
  parts.push(m.authors.length ? formatAuthorsChicago(m.authors) : '');

  if (m.documentType === 'article') {
    parts.push(` "${m.title}."`);
    if (m.journal) parts.push(` *${m.journal}*`);
    if (m.volume) parts.push(` ${m.volume}`);
    if (m.issue) parts.push(`, no. ${m.issue}`);
    if (m.year) parts.push(` (${m.year})`);
    if (m.pages) parts.push(`: ${m.pages}`);
    parts.push('.');
  } else {
    parts.push(` *${m.title}*.`);
    if (m.publisher) parts.push(` ${m.publisher},`);
    if (m.year) parts.push(` ${m.year}.`);
  }
  if (m.doi) parts.push(` https://doi.org/${m.doi}.`);
  else if (m.url) parts.push(` ${m.url}.`);

  if (options.includePageRefs && entry.pageNumbers.length) {
    parts.push(` Cited pages: ${entry.pageNumbers.join(', ')}.`);
  }

  let result = parts.join('').replace(/\.\./g, '.').trim();
  if (options.includeExcerpts && entry.excerpts.length) {
    result += '\n\n' + entry.excerpts.map((e) => `  "${e}"`).join('\n');
  }
  return result;
}

function generateBibTeX(entry: CitationEntry, options: CitationOptions): string {
  const m = entry.metadata;
  if (!m) return `% Metadata missing for: ${entry.documentName}`;

  const type = m.documentType === 'book' ? 'book' : 'article';
  const key = bibtexKey(m);
  const lines: string[] = [`@${type}{${key},`];

  if (m.authors.length) lines.push(`  author = {${m.authors.join(' and ')}},`);
  lines.push(`  title = {${m.title}},`);
  if (m.year) lines.push(`  year = {${m.year}},`);
  if (m.journal) lines.push(`  journal = {${m.journal}},`);
  if (m.volume) lines.push(`  volume = {${m.volume}},`);
  if (m.issue) lines.push(`  number = {${m.issue}},`);
  if (m.pages) lines.push(`  pages = {${m.pages}},`);
  if (m.publisher) lines.push(`  publisher = {${m.publisher}},`);
  if (m.doi) lines.push(`  doi = {${m.doi}},`);
  if (m.url) lines.push(`  url = {${m.url}},`);
  if (options.includePageRefs && entry.pageNumbers.length) {
    lines.push(`  note = {Cited pages: ${entry.pageNumbers.join(', ')}},`);
  }

  // Remove trailing comma from last field
  const lastIdx = lines.length - 1;
  lines[lastIdx] = lines[lastIdx].replace(/,$/, '');
  lines.push('}');

  let result = lines.join('\n');
  if (options.includeExcerpts && entry.excerpts.length) {
    result += '\n\n' + entry.excerpts.map((e) => `% "${e}"`).join('\n');
  }
  return result;
}

export function generateCitation(
  entry: CitationEntry,
  format: CitationFormat,
  options: CitationOptions
): string {
  switch (format) {
    case 'apa': return generateAPA(entry, options);
    case 'mla': return generateMLA(entry, options);
    case 'chicago': return generateChicago(entry, options);
    case 'bibtex': return generateBibTeX(entry, options);
  }
}

export function generateAllCitations(
  entries: CitationEntry[],
  format: CitationFormat,
  options: CitationOptions
): string {
  return entries.map((e) => generateCitation(e, format, options)).join('\n\n---\n\n');
}
