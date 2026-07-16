import { ConfeccaoProvasContent } from "../_components/ConfeccaoProvasContent";

type ConfeccaoProvasEdicaoPageProps = {
  params: Promise<{ id: string }>;
};

export default async function ConfeccaoProvasEdicaoPage({
  params,
}: ConfeccaoProvasEdicaoPageProps) {
  const { id } = await params;

  return <ConfeccaoProvasContent assessmentIdToEdit={id} />;
}
