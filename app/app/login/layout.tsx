// Login-Page hat KEIN Shell (Sidebar/Nav).
// Override des Root-Layouts via simple Pass-Through.
export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
