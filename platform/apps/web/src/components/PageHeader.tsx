import type { ReactNode } from "react";

export function PageHeader({ title, subtitle, actions }: { title: string; subtitle?: string; actions?: ReactNode }) {
  return (
    <header className="topbar">
      <div className="tb-title">
        <div className="page-t">{title}</div>
        {subtitle && <div className="page-s">{subtitle}</div>}
      </div>
      {actions && <div className="tb-tools">{actions}</div>}
    </header>
  );
}
