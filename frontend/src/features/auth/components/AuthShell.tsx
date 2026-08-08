import type { ReactNode } from "react";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import { Link } from "react-router-dom";
import { useI18n } from "../../../app/providers/I18nProvider";
import { BrandLockup } from "../../../shared/components/BrandMark";
import { LocaleSelect } from "../../../shared/components/LocaleSelect";

interface AuthShellProps {
  backTo?: string;
  backLabel?: string;
  children: ReactNode;
}

export function AuthShell({ backTo = "/", backLabel, children }: AuthShellProps) {
  const { translate } = useI18n();
  const benefits = ["auth.benefit1", "auth.benefit2", "auth.benefit3"] as const;

  return (
    <div className="grid min-h-screen bg-background text-foreground lg:grid-cols-[minmax(22rem,0.8fr)_1.2fr]">
      <aside className="editorial-inverse relative hidden min-h-screen overflow-hidden p-10 lg:flex lg:flex-col lg:justify-between xl:p-14">
        <div className="absolute -right-32 top-1/3 h-80 w-80 rounded-full border border-background/10" aria-hidden />
        <div className="absolute -right-12 top-[42%] h-40 w-40 rounded-full border border-background/10" aria-hidden />
        <BrandLockup inverse className="relative z-10" />

        <div className="relative z-10 max-w-md">
          <p className="editorial-kicker text-[#5f7cff]">Operational intelligence</p>
          <h2 className="mt-6 text-4xl font-semibold leading-[1.04] tracking-[-0.055em] text-background xl:text-5xl">
            {translate("auth.loginSubtitle")}
          </h2>
          <p className="mt-6 text-base leading-7 text-background/65">
            {translate("auth.platformSubtitle")}
          </p>
          <ul className="mt-10 border-t border-background/20">
            {benefits.map((key) => (
              <li key={key} className="flex items-center gap-3 border-b border-background/20 py-4 text-sm text-background/75">
                <CheckCircle2 size={16} className="shrink-0 text-[#5f7cff]" aria-hidden />
                {translate(key)}
              </li>
            ))}
          </ul>
        </div>

        <p className="relative z-10 text-xs uppercase tracking-[0.12em] text-background/45">
          © 2026 AI Business Concierge
        </p>
      </aside>

      <main className="flex min-h-screen flex-col">
        <header className="flex min-h-18 items-center justify-between border-b border-border px-5 sm:px-8">
          <Link
            to={backTo}
            className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.1em] text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft size={15} aria-hidden />
            {backLabel ?? translate("auth.backToHome")}
          </Link>
          <LocaleSelect variant="light" />
        </header>

        <div className="flex flex-1 items-center justify-center px-5 py-12 sm:px-8 lg:py-16">
          <div className="w-full max-w-md editorial-enter">
            <BrandLockup className="mb-12 lg:hidden" />
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}

export const authInputClass =
  "w-full border-0 border-b border-border bg-transparent px-0 py-3 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground/65 focus:border-primary focus:ring-0";

export const authLabelClass =
  "block text-[11px] font-bold uppercase tracking-[0.12em] text-muted-foreground";
