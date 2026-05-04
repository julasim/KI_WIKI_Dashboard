import { browseVault, readVaultFile } from "@/lib/vault";
import Link from "next/link";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

const FILE_ICON: Record<string, string> = {
  md: "≡",
  json: "{}",
  yaml: ">_",
  yml: ">_",
  txt: "—",
  pdf: "▦",
  jpg: "▢",
  jpeg: "▢",
  png: "▢",
  gif: "▢",
  webp: "▢",
};

export default async function VaultBrowse({
  params,
}: {
  params: Promise<{ path?: string[] }>;
}) {
  const { path } = await params;
  const fullPath = path?.join("/") ?? "";

  // Erkennen ob Path = File (endet mit .ext) oder Folder
  const looksLikeFile = /\.[a-zA-Z0-9]{1,8}$/.test(fullPath);

  if (looksLikeFile) {
    const file = await readVaultFile(fullPath);
    if (!file) notFound();
    return <FileView file={file} />;
  }

  const listing = await browseVault(fullPath);
  return <FolderView listing={listing} />;
}

function Breadcrumbs({ parents }: { parents: { name: string; path: string }[] }) {
  return (
    <nav className="flex flex-wrap items-center gap-1 text-sm text-[var(--ink-mute)]">
      {parents.map((p, i) => (
        <span key={p.path} className="flex items-center gap-1">
          {i > 0 && <span className="text-[var(--ink-soft)]">/</span>}
          {i === parents.length - 1 ? (
            <span className="text-[var(--ink)] font-medium">{p.name}</span>
          ) : (
            <Link
              href={p.path ? `/vault/${p.path}` : "/vault"}
              className="hover:text-[var(--ink)] transition-colors"
            >
              {p.name}
            </Link>
          )}
        </span>
      ))}
    </nav>
  );
}

function FolderView({
  listing,
}: {
  listing: Awaited<ReturnType<typeof browseVault>>;
}) {
  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <div className="eyebrow">Browse</div>
        <Breadcrumbs parents={listing.parents} />
        <div className="text-xs num-mono text-[var(--ink-mute)]">
          {listing.entries.length} Einträge
        </div>
      </header>

      {listing.entries.length === 0 ? (
        <div className="card p-6 text-sm text-[var(--ink-soft)] text-center">
          Folder ist leer.
        </div>
      ) : (
        <div className="card divide-y hairline overflow-hidden">
          {listing.entries.map((e) => (
            <Link
              key={e.path}
              href={`/vault/${e.path}`}
              className="px-4 py-3 flex items-center gap-3 text-sm card-hover"
            >
              {e.kind === "dir" ? (
                <>
                  <span className="text-[var(--ink-mute)] num-mono shrink-0">▸</span>
                  <span className="flex-1 truncate font-medium">{e.name}/</span>
                  <span className="text-xs num-mono text-[var(--ink-mute)] shrink-0">
                    {e.childCount} Items
                  </span>
                </>
              ) : (
                <>
                  <span className="text-[var(--ink-soft)] num-mono shrink-0 w-4">
                    {FILE_ICON[e.ext] ?? "•"}
                  </span>
                  <span className="flex-1 truncate">{e.name}</span>
                  <span className="text-xs num-mono text-[var(--ink-mute)] shrink-0 w-20 text-right">
                    {e.mtime}
                  </span>
                  <span className="text-[10px] num-mono text-[var(--ink-soft)] shrink-0 w-16 text-right">
                    {formatSize(e.size)}
                  </span>
                </>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

function FileView({
  file,
}: {
  file: NonNullable<Awaited<ReturnType<typeof readVaultFile>>>;
}) {
  return (
    <div className="space-y-5">
      <header className="space-y-2">
        <div className="eyebrow">File</div>
        <Breadcrumbs parents={file.parents} />
        <h1 className="display text-2xl md:text-3xl">{file.name}</h1>
        <div className="text-xs num-mono text-[var(--ink-mute)]">
          {file.ext.toUpperCase()} · {formatSize(file.size)}
        </div>
      </header>

      {file.isBinary ? (
        <div className="card p-6 text-sm text-[var(--ink-soft)] text-center">
          Binärdatei (Vorschau nicht unterstützt). Pfad: <code>{file.path}</code>
        </div>
      ) : file.bodyHtml ? (
        <>
          {file.frontmatter && Object.keys(file.frontmatter).length > 0 && (
            <details className="card p-4 group">
              <summary className="cursor-pointer flex items-center gap-2 list-none text-xs text-[var(--ink-mute)]">
                <span className="group-open:rotate-90 transition-transform">▶</span>
                <span className="num-mono">Frontmatter ({Object.keys(file.frontmatter).length} Felder)</span>
              </summary>
              <pre className="mt-3 text-[11px] num-mono text-[var(--ink-2)] overflow-x-auto">
                {Object.entries(file.frontmatter).map(([k, v]) => (
                  `${k}: ${typeof v === "object" ? JSON.stringify(v) : String(v)}\n`
                )).join("")}
              </pre>
            </details>
          )}
          <article
            className="prose-vault card p-5 md:p-6"
            dangerouslySetInnerHTML={{ __html: file.bodyHtml }}
          />
        </>
      ) : (
        <pre className="card p-5 text-[12px] num-mono whitespace-pre-wrap text-[var(--ink-2)] overflow-x-auto">
          {file.raw}
        </pre>
      )}
    </div>
  );
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}
