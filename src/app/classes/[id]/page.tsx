"use client";

import { useParams } from "next/navigation";
import { ClassDetailsPageContent } from "../_components/ClassDetailsPageContent";

export default function ClassDetailsPage() {
  const params = useParams<{ id: string }>();

  return <ClassDetailsPageContent classroomId={params.id} />;
}
