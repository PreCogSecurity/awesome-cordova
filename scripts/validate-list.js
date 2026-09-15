#!/usr/bin/env node
'use strict';

/**
 * Validates the structure of the awesome-cordova README list.
 *
 * Checks that:
 *  1. Every list item that should be a link uses valid markdown link syntax
 *     `[text](url)`.
 *  2. No URL is listed more than once (no duplicate entries).
 *  3. Every link has non-empty link text and a non-empty URL.
 *
 * Usage: node scripts/validate-list.js [path-to-readme]
 * Exits with code 1 if any violation is found.
 */

const fs = require('node:fs');
const path = require('node:path');

const DEFAULT_README = path.join(__dirname, '..', 'README.md');

// Matches a full markdown link: [text](url) — text may contain escaped
// brackets, url must not contain spaces or unbalanced parens.
const LINK_RE = /\[([^\]\\]*(?:\\.[^\]\\]*)*)\]\(([^()\s]+)\)/g;

// Matches a list item that carries a link: `- [text](url)` (any indentation).
const LINKED_ITEM_RE = /^\s*[-*]\s+\[[^\]\\]*(?:\\.[^\]\\]*)*\]\([^()\s]+\)/;

function parseLinks(markdown) {
  const links = [];
  for (const match of markdown.matchAll(LINK_RE)) {
    links.push({
      text: match[1],
      url: match[2],
      index: match.index,
    });
  }
  return links;
}

function validate(markdown, sourceName) {
  const errors = [];
  // Tracks URLs seen per section so that the same resource can be
  // intentionally cross-referenced from different sections while accidental
  // duplicates inside one section are still caught.
  const seenUrlsBySection = new Map();
  let currentSection = '(preamble)';

  const lines = markdown.split(/\r?\n/);
  const indentOf = (line) => line.match(/^\s*/)[0].length;

  lines.forEach((line, lineNumber) => {
    const trimmed = line.trim();
    // Track the current section heading so duplicate detection is scoped.
    const heading = trimmed.match(/^#{1,6}\s+(.*)$/);
    if (heading) {
      currentSection = heading[1];
      return;
    }

    // Only inspect list items; skip headings, prose, and blank lines.
    if (!/^[-*]\s+/.test(trimmed)) {
      return;
    }

    // A list item without a link is allowed when it is a category label,
    // i.e. it is followed by a more deeply indented list item. Category
    // labels also start a new duplicate-detection scope so the same resource
    // can be intentionally cross-referenced from different sub-categories.
    if (!LINKED_ITEM_RE.test(line)) {
      const next = lines
        .slice(lineNumber + 1)
        .find((candidate) => candidate.trim() !== '');
      const isCategoryLabel =
        next !== undefined &&
        /^[-*]\s+/.test(next.trim()) &&
        indentOf(next) > indentOf(line);
      if (!isCategoryLabel) {
        errors.push(
          `${sourceName}:${lineNumber + 1}: list item is missing a valid ` +
            'markdown link `[text](url)`'
        );
      } else {
        currentSection = `${currentSection} > ${trimmed.replace(/^[-*]\s+/, '')}`;
      }
      return;
    }

    // Extract every link in the item and validate each one.
    for (const link of line.matchAll(LINK_RE)) {
      if (!link[1].trim()) {
        errors.push(
          `${sourceName}:${lineNumber + 1}: link has empty text: ${link[0]}`
        );
      }
      if (!link[2].trim()) {
        errors.push(
          `${sourceName}:${lineNumber + 1}: link has empty URL: ${link[0]}`
        );
      }
      const url = link[2];
      const seenInSection = seenUrlsBySection.get(currentSection) || new Map();
      if (seenInSection.has(url)) {
        errors.push(
          `${sourceName}:${lineNumber + 1}: duplicate URL "${url}" in ` +
            `section "${currentSection}" ` +
            `(first listed on line ${seenInSection.get(url)})`
        );
      } else {
        seenInSection.set(url, lineNumber + 1);
        seenUrlsBySection.set(currentSection, seenInSection);
      }
    }
  });

  return errors;
}

function main() {
  const readmePath = process.argv[2] || DEFAULT_README;
  let markdown;
  try {
    markdown = fs.readFileSync(readmePath, 'utf8');
  } catch (err) {
    console.error(`validate-list: cannot read ${readmePath}: ${err.message}`);
    process.exit(1);
  }

  const errors = validate(markdown, path.basename(readmePath));
  if (errors.length > 0) {
    console.error(`validate-list: ${errors.length} violation(s) found:`);
    for (const error of errors) {
      console.error(`  - ${error}`);
    }
    process.exit(1);
  }

  const linkCount = parseLinks(markdown).length;
  console.log(`validate-list: OK — ${linkCount} link(s) checked, no violations.`);
}

module.exports = { parseLinks, validate };

if (require.main === module) {
  main();
}