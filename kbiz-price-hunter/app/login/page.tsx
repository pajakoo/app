import LoginForm from "@/app/login/LoginForm";

export const metadata = {
  title: "Request access | Kbiz Price Hunter",
  description: "Send a magic link to access the private dashboard.",
};

export default function LoginPage() {
  return (
    <main className="page-shell">
      <div className="container">
        <h1>Request a magic link</h1>
        <p style={{ marginTop: 12, color: "var(--ink-muted)" }}>
          The private dashboard is invite-only. Enter your email to receive a
          one-time login link.
        </p>
        <LoginForm />
      </div>
    </main>
  );
}
