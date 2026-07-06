"use client";

import { Suspense } from "react";
import { useParams } from "next/navigation";
import { ConfeccaoProvasContent } from "../_components/ConfeccaoProvasContent";

export default function ConfeccaoProvasEdicaoPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-[#eef2f7] text-sm font-medium text-slate-600">
          Carregando confecção de provas...
        </div>
      }
    >
      <ConfeccaoProvasEdicaoContent />
    </Suspense>
  );
}

function ConfeccaoProvasEdicaoContent() {
  const params = useParams<{ id: string }>();

  return <ConfeccaoProvasContent assessmentIdToEdit={params.id} />;
}
