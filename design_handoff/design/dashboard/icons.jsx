// Minimal stroke-icon set, 16px viewBox, currentColor.
const Ic = {
  Home:      (p) => <svg viewBox="0 0 16 16" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M2.5 7 8 2.5 13.5 7v6.5a.5.5 0 0 1-.5.5h-3v-4h-3v4H3a.5.5 0 0 1-.5-.5V7Z"/></svg>,
  Heart:     (p) => <svg viewBox="0 0 16 16" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M8 13.5s-5-3.2-5-7.1a2.9 2.9 0 0 1 5-2 2.9 2.9 0 0 1 5 2c0 3.9-5 7.1-5 7.1Z"/></svg>,
  Run:       (p) => <svg viewBox="0 0 16 16" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" {...p}><circle cx="10.5" cy="3" r="1.2"/><path d="m4 14 2.5-3.5L5 8.5l1.5-3 3 1.5L11 9l1.5 1.5M4 9.5l2-2"/></svg>,
  Target:    (p) => <svg viewBox="0 0 16 16" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" {...p}><circle cx="8" cy="8" r="5.5"/><circle cx="8" cy="8" r="3"/><circle cx="8" cy="8" r="0.8" fill="currentColor"/></svg>,
  Bell:      (p) => <svg viewBox="0 0 16 16" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M3.5 11.5h9L11 9.5V6.5a3 3 0 1 0-6 0v3l-1.5 2ZM6.5 13.5a1.5 1.5 0 0 0 3 0"/></svg>,
  Check:     (p) => <svg viewBox="0 0 16 16" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="m3.5 8.5 3 3 6-7"/></svg>,
  Clock:     (p) => <svg viewBox="0 0 16 16" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" {...p}><circle cx="8" cy="8" r="5.5"/><path d="M8 5v3l2 1.5"/></svg>,
  Flame:     (p) => <svg viewBox="0 0 16 16" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M8 13.5c2.2 0 4-1.6 4-3.7 0-2.2-2-3.3-2-5.3 0-1-.5-1.7-1.2-2 .2 1.5-.6 2.4-1.6 3.4-1 1-1.7 1.9-1.7 3.5 0 2.5 1.7 4.1 2.5 4.1Z"/></svg>,
  Sun:       (p) => <svg viewBox="0 0 16 16" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" {...p}><circle cx="8" cy="8" r="3"/><path d="M8 1.5v1.5M8 13v1.5M1.5 8H3M13 8h1.5M3.4 3.4l1 1M11.6 11.6l1 1M3.4 12.6l1-1M11.6 4.4l1-1"/></svg>,
  Moon:      (p) => <svg viewBox="0 0 16 16" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M13 9.5A5 5 0 1 1 6.5 3a4.2 4.2 0 0 0 6.5 6.5Z"/></svg>,
  Menu:      (p) => <svg viewBox="0 0 16 16" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" {...p}><path d="M3 5h10M3 8h10M3 11h10"/></svg>,
  Arrow:     (p) => <svg viewBox="0 0 16 16" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M3.5 8h9M9 4.5 12.5 8 9 11.5"/></svg>,
  Dot:       (p) => <svg viewBox="0 0 16 16" width="16" height="16" {...p}><circle cx="8" cy="8" r="3" fill="currentColor"/></svg>,
  Calendar:  (p) => <svg viewBox="0 0 16 16" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" {...p}><rect x="2.5" y="3.5" width="11" height="10" rx="1.5"/><path d="M2.5 6.5h11M5.5 2v3M10.5 2v3"/></svg>,
  Folder:    (p) => <svg viewBox="0 0 16 16" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M2 4.5a1 1 0 0 1 1-1h3.2l1.3 1.5H13a1 1 0 0 1 1 1V12a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V4.5Z"/></svg>,
  ArrowLeft: (p) => <svg viewBox="0 0 16 16" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M12.5 8h-9M7 4.5 3.5 8 7 11.5"/></svg>,
  Filter:    (p) => <svg viewBox="0 0 16 16" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M2.5 4h11M4.5 8h7M6.5 12h3"/></svg>,
  Plus:      (p) => <svg viewBox="0 0 16 16" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" {...p}><path d="M8 3.5v9M3.5 8h9"/></svg>,
  Doc:       (p) => <svg viewBox="0 0 16 16" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M3.5 2.5h6L12.5 5.5v8a.5.5 0 0 1-.5.5H4a.5.5 0 0 1-.5-.5V3a.5.5 0 0 1 .5-.5Z"/><path d="M9.5 2.5V5.5h3M5.5 8.5h5M5.5 11h4"/></svg>,
};

window.Ic = Ic;
