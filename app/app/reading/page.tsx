import { readBooks } from "@/lib/vault";

export const revalidate = 60;

export default async function ReadingPage() {
  const books = await readBooks();
  const aktiv = books.filter((b) => b.status === "aktiv");
  const geplant = books.filter((b) => b.status === "geplant");
  const abgeschlossen = books.filter((b) => b.status === "abgeschlossen");

  const Section = ({ title, items }: { title: string; items: typeof books }) =>
    items.length > 0 ? (
      <section>
        <div className="eyebrow mb-3">{title} · {items.length}</div>
        <div className="space-y-3">
          {items.map((b, i) => (
            <div key={`${b.title}-${i}`} className="card p-4">
              <div className="serif text-base">{b.title}</div>
              {b.author && (
                <div className="text-xs text-[var(--ink-mute)] mt-0.5">{b.author}</div>
              )}
              {b.lesson && (
                <div className="text-sm text-[var(--ink-2)] mt-2 italic">„{b.lesson}"</div>
              )}
              {(b.start || b.ende) && (
                <div className="text-[11px] num-mono text-[var(--ink-soft)] mt-2 flex gap-3">
                  {b.start && <span>Start: {b.start}</span>}
                  {b.ende && <span>Ende: {b.ende}</span>}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>
    ) : null;

  return (
    <div className="space-y-6 md:space-y-8">
      <header>
        <div className="eyebrow">Tracking</div>
        <h1 className="display text-3xl md:text-4xl">Reading</h1>
        <div className="text-sm text-[var(--ink-mute)] mt-1 num-mono">
          {abgeschlossen.length} gelesen · {aktiv.length} aktiv · {geplant.length} geplant
        </div>
      </header>
      <Section title="Aktiv" items={aktiv} />
      <Section title="Geplant" items={geplant} />
      <Section title="Abgeschlossen" items={abgeschlossen} />
    </div>
  );
}
