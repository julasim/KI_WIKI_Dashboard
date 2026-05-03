import { remark } from "remark";
import remarkGfm from "remark-gfm";
import remarkHtml from "remark-html";

/**
 * Markdown → HTML Renderer für Vault-Inhalte.
 *
 * - Standard CommonMark + GFM (Tabellen, Task-Lists, Strikethrough)
 * - Obsidian-Wikilinks `[[id]]` und `[[id|display]]` werden zu HTML-Spans
 *   (anklickbar wenn `project-<slug>`-Format erkannt wird)
 * - Frontmatter wird VOR dem Aufruf bereits via gray-matter entfernt
 */
export async function mdToHtml(markdown: string): Promise<string> {
  // Wikilinks vorher umwandeln, damit remark sie nicht fehl-interpretiert
  const preprocessed = transformWikilinks(markdown);
  const file = await remark()
    .use(remarkGfm)
    .use(remarkHtml, { sanitize: false })
    .process(preprocessed);
  return String(file);
}

/**
 * Obsidian-Wikilinks → HTML.
 *
 * `[[project-kiosk-sanierung]]` → Link zu /projects/kiosk-sanierung
 * `[[t-foo]]` → "Task-Verweis" als Span
 * `[[some-id|Display]]` → "Display" als gestylter Span
 * `[[some-id]]` → "some-id" als gestylter Span
 *
 * Achtung: nicht innerhalb von Code-Blocks/Inline-Code transformieren.
 */
function transformWikilinks(md: string): string {
  // Code-Blocks + inline-code stashen damit Wikilinks darin nicht angefasst werden
  const stash: string[] = [];
  const stashed = md
    .replace(/```[\s\S]*?```/g, (m) => {
      stash.push(m);
      return `CODE${stash.length - 1}`;
    })
    .replace(/`[^`\n]+`/g, (m) => {
      stash.push(m);
      return `CODE${stash.length - 1}`;
    });

  // [[id|display]] oder [[id]]
  const transformed = stashed.replace(
    /\[\[([^\]\|#\n]+)(?:\|([^\]\n]+))?\]\]/g,
    (_, id: string, display?: string) => {
      const text = (display ?? id).trim();
      const slug = id.trim();
      // Project-Wikilink → klickbar
      if (/^project-/.test(slug)) {
        const projectSlug = slug.replace(/^project-/, "");
        return `<a href="/projects/${projectSlug}" class="vault-wikilink">${escapeHtml(text)}</a>`;
      }
      // Sonst: Klartext mit subtle styling (kein Link weil Ziel kann
      // ausserhalb der Dashboard-Routes liegen, z.B. Daily-Note-IDs)
      return `<span class="vault-wikilink">${escapeHtml(text)}</span>`;
    },
  );

  // Stash zurücktauschen
  return transformed.replace(/CODE(\d+)/g, (_, n) => stash[parseInt(n, 10)] ?? "");
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
