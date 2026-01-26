import LoginForm from "@/app/login/LoginForm";
import { getDictionary, type Locale } from "@/lib/i18n";

export const metadata = {
  title: "Request access | Kbiz Price Hunter",
  description: "Send a magic link to access the private dashboard.",
};

export default async function LoginPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  const dict = getDictionary(locale);

  return (
    <main className="page-shell">
      <div className="container">
        <h1>{dict.login.title}</h1>
        <p style={{ marginTop: 12, color: "var(--ink-muted)" }}>
          {dict.login.intro}
        </p>
        <LoginForm
          locale={locale}
          emailLabel={dict.login.email}
          placeholder={dict.login.placeholder}
          sendLabel={dict.login.send}
          sendingLabel={dict.login.sending}
          devLinkLabel={dict.login.devLink}
        />
      </div>
    </main>
  );
}
