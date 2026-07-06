"use client";

import { useParams } from "next/navigation";
import { ConfeccaoProvasContent } from "./ConfeccaoProvasContent";

export function ConfeccaoProvasEditContent() {
  const params = useParams<{ id: string }>();

  return <ConfeccaoProvasContent assessmentIdToEdit={params.id} />;
}
