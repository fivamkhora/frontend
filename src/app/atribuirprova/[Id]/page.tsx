import { ProvasPageContent } from "@/app/provas/page";

type AtribuirProvaTurmaPageProps = {
  params: Promise<{ Id: string }>;
};

export default async function AtribuirProvaTurmaPage({
  params,
}: AtribuirProvaTurmaPageProps) {
  const { Id } = await params;

  return (
    <ProvasPageContent
      active="atribuirprova"
      breadcrumbLabel="Atribuir Provas"
      description={`Selecione entre as provas criadas para atribuir à turma ${Id}.`}
      showEditAction={false}
      title="Selecionar Prova"
    />
  );
}
