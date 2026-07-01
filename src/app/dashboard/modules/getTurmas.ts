import { api } from "@/services/baseApi";

export interface Turma {
  id: string;
  name: string;
  code: string;
  schoolYear: string;
  teacherId: number;
  createdAt: string;
  updatedAt: string;
}

export async function getTurmas(): Promise<Turma[]> {
  return api.get<Turma[]>("/api/v1/turma/classrooms");
}
