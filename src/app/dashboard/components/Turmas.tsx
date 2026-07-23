"use client";

import React, { useEffect, useState } from "react";
import { Plus, ArrowRight, GraduationCap, Calendar } from "lucide-react";
import Link from "next/link";
import { Classroom, fetchTeacherClassrooms } from "@/services/authService";

type ClassItem = {
  code: string;
  id: string;
  segment: string;
  name: string;
  subject: string;
  year: string;
  color: "blue" | "lightBlue" | "green";
};

function getClassColor(index: number): ClassItem["color"] {
  const colors: ClassItem["color"][] = ["blue", "lightBlue", "green"];
  return colors[index % colors.length] ?? "blue";
}

function toClassItem(classroom: Classroom, index: number): ClassItem {
  return {
    id: classroom.id,
    name: classroom.name,
    code: classroom.code,
    year: classroom.schoolYear,
    color: getClassColor(index),
    segment: "TURMA",
    subject: classroom.code,
  };
}

const colorClasses: Record<ClassItem["color"], string> = {
  blue: "border-l-blue-600",
  lightBlue: "border-l-sky-500",
  green: "border-l-emerald-600",
};

const iconColorClasses: Record<ClassItem["color"], string> = {
  blue: "text-blue-600",
  lightBlue: "text-sky-500",
  green: "text-emerald-600",
};

export default function Turmas() {
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [loadingClasses, setLoadingClasses] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadClasses() {
      try {
        const classrooms = await fetchTeacherClassrooms();

        if (active) {
          setClasses(classrooms.map(toClassItem).slice(0, 4));
        }
      } catch {
        if (active) {
          setError("Não foi possível carregar suas turmas.");
        }
      } finally {
        if (active) {
          setLoadingClasses(false);
        }
      }
    }

    loadClasses();

    return () => {
      active = false;
    };
  }, []);

  if (loadingClasses) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-8 text-center text-sm font-medium text-slate-500">
        Carregando turmas...
      </div>
    );
  }

  if (error) {
    return (
      <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-slate-800">Minhas Turmas</h2>

        <Link
          href="/classes"
          className="flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
        >
          Ver todas as turmas
          <ArrowRight size={16} />
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
        {classes.map((turma) => (
          <Link
            href={`/classes/${turma.id}`}
            key={turma.id}
            className={`bg-white rounded-2xl shadow-sm border border-slate-100 border-l-[6px] ${colorClasses[turma.color]} p-5 flex flex-col justify-between h-45 transition-all hover:shadow-md hover:-translate-y-0.5`}
          >
            <div>
              <span className="text-xs font-semibold tracking-wider text-slate-400 uppercase">
                Turma Ativa
              </span>

              <h3 className="text-lg font-bold text-slate-800 mt-1 flex items-center gap-2">
                <GraduationCap
                  className={`${iconColorClasses[turma.color]} h-5 w-5 shrink-0`}
                />
                {turma.name}
              </h3>
            </div>

            <div className="space-y-1.5 border-t border-slate-50 pt-3">
              <div className="flex items-center gap-2 text-slate-500 text-xs">
                <Calendar size={14} className="text-slate-400" />
                <span>
                  Ano Letivo: <strong>{turma.year}</strong>
                </span>
              </div>

              <div className="text-[11px] text-slate-400 font-mono">
                Cód: {turma.code}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
