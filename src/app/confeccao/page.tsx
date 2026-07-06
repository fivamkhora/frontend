"use client";

import { Suspense } from "react";
import { ConfeccaoProvasContent } from "./_components/ConfeccaoProvasContent";

export default function ConfeccaoProvasPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-[#eef2f7] text-sm font-medium text-slate-600">
          Carregando confecção de provas...
        </div>
      }
    >
      <ConfeccaoProvasContent />
    </Suspense>
  );
}
