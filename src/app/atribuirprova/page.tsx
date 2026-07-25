"use client";

import { ClassesPageContent } from "@/app/classes/_components/ClassesPageContent";

export default function AtribuirProvaPage() {
  return (
    <ClassesPageContent
      actionLabel="Selecionar turma"
      active="atribuirprova"
      breadcrumbLabel="Atribuir Provas"
      description="Selecione a turma que receberá uma prova."
      detailsBasePath="/atribuirprova"
      title="Atribuir Provas"
    />
  );
}
