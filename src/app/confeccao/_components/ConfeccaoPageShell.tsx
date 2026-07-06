import { Suspense, type ReactNode } from "react";

type ConfeccaoPageShellProps = {
  children: ReactNode;
};

export function ConfeccaoPageShell({ children }: ConfeccaoPageShellProps) {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-[#eef2f7] text-sm font-medium text-slate-600">
          Carregando confeccao de provas...
        </div>
      }
    >
      {children}
    </Suspense>
  );
}
