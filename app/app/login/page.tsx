import { Suspense } from "react";
import { LoginForm } from "./login-form";

export const metadata = {
  title: "Login — Personal OS",
};

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-[var(--bg)]">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="display text-2xl mb-1">Personal OS</div>
          <div className="text-sm text-[var(--ink-mute)]">
            Login required
          </div>
        </div>
        <Suspense fallback={null}>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  );
}
