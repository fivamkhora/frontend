"use client";

import { useId, useMemo, useState } from "react";
import { CheckCircle2, Search, UserPlus, Users } from "lucide-react";
import type { DirectoryUser } from "@/services/secretariaService";

export type AssignmentUser = DirectoryUser & {
  initials: string;
};

type AssignmentSectionProps = {
  actionUserId: number | null;
  assignmentError: string;
  availableUsers: AssignmentUser[];
  classroomReady: boolean;
  description: string;
  emptyMessage: string;
  filterPlaceholder: string;
  loadError: string;
  loading: boolean;
  loadingMessage: string;
  onAdd: (user: AssignmentUser) => Promise<void>;
  onRemove: (userId: number) => Promise<void>;
  selectedLabel: string;
  selectedUsers: AssignmentUser[];
  title: string;
};

export function AssignmentSection({
  actionUserId,
  assignmentError,
  availableUsers,
  classroomReady,
  description,
  emptyMessage,
  filterPlaceholder,
  loadError,
  loading,
  loadingMessage,
  onAdd,
  onRemove,
  selectedLabel,
  selectedUsers,
  title,
}: AssignmentSectionProps) {
  const filterId = useId();
  const [nameFilter, setNameFilter] = useState("");
  const selectedUserIds = new Set(selectedUsers.map((user) => user.id));
  const filteredUsers = useMemo(() => {
    const normalizedFilter = nameFilter.trim().toLocaleLowerCase("pt-BR");

    if (!normalizedFilter) {
      return availableUsers;
    }

    return availableUsers.filter((user) =>
      user.name.toLocaleLowerCase("pt-BR").includes(normalizedFilter),
    );
  }, [availableUsers, nameFilter]);

  return (
    <section>
      <div className="mb-4 flex items-center justify-between gap-3 border-b border-slate-200 pb-3">
        <div className="flex items-center gap-2">
          <Users size={18} className="text-[#003b5c]" />
          <h2 className="text-lg font-bold text-slate-800">{title}</h2>
        </div>
        <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-[#003b5c]">
          Vinculados: {selectedUsers.length}
        </span>
      </div>

      <p className="mb-4 text-sm font-semibold text-slate-700">
        {description}
      </p>

      <label htmlFor={filterId} className="relative mb-4 block sm:max-w-sm">
        <span className="sr-only">{filterPlaceholder}</span>
        <Search
          aria-hidden="true"
          className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400"
        />
        <input
          id={filterId}
          type="search"
          value={nameFilter}
          onChange={(event) => setNameFilter(event.target.value)}
          placeholder={filterPlaceholder}
          className="h-10 w-full rounded-lg border border-slate-200 bg-white pl-9 pr-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
        />
      </label>

      {!classroomReady && (
        <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm font-medium text-amber-800">
          A atribuicao sera liberada depois que a turma for criada.
        </div>
      )}

      {loading && (
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-6 text-center text-sm font-medium text-slate-500">
          {loadingMessage}
        </div>
      )}

      {!loading && loadError && (
        <div
          role="alert"
          className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700"
        >
          {loadError}
        </div>
      )}

      {!loading && !loadError && availableUsers.length === 0 && (
        <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-6 text-center text-sm text-slate-500">
          {emptyMessage}
        </div>
      )}

      {!loading && availableUsers.length > 0 && filteredUsers.length === 0 && (
        <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-6 text-center text-sm text-slate-500">
          Nenhum usuario encontrado com esse nome.
        </div>
      )}

      {!loading && filteredUsers.length > 0 && (
        <div className="grid gap-4 md:grid-cols-2">
          {filteredUsers.map((user) => {
            const selected = selectedUserIds.has(user.id);
            const processing = actionUserId === user.id;

            return (
              <article
                key={user.id}
                className={`flex min-h-20 items-center justify-between gap-3 rounded-lg border p-4 transition ${
                  selected
                    ? "border-blue-200 bg-blue-50"
                    : "border-slate-200 bg-slate-50 hover:bg-white"
                }`}
              >
                <div className="flex min-w-0 items-center gap-3">
                  <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                      selected
                        ? "bg-blue-200 text-[#003b5c]"
                        : "bg-emerald-100 text-emerald-700"
                    }`}
                  >
                    {user.initials}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold text-slate-900">
                      {user.name}
                    </p>
                    <p className="truncate text-xs text-slate-500">
                      {user.email || user.username}
                    </p>
                  </div>
                </div>

                {selected ? (
                  <button
                    type="button"
                    onClick={() => onRemove(user.id)}
                    disabled={!classroomReady || actionUserId !== null}
                    className="shrink-0 rounded-md border border-red-300 bg-white px-3 py-1.5 text-xs font-semibold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {processing ? "Removendo..." : "Remover"}
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => onAdd(user)}
                    disabled={!classroomReady || actionUserId !== null}
                    className="inline-flex shrink-0 items-center gap-1 rounded-md border border-[#003b5c] bg-white px-3 py-1.5 text-xs font-semibold text-[#003b5c] transition hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <UserPlus size={13} />
                    {processing ? "Adicionando..." : "Adicionar"}
                  </button>
                )}
              </article>
            );
          })}
        </div>
      )}

      {selectedUsers.length > 0 && (
        <div className="mt-5 rounded-lg border border-blue-100 bg-blue-50 p-4">
          <div className="mb-2 flex items-center gap-2 text-sm font-bold text-[#003b5c]">
            <CheckCircle2 size={17} />
            {selectedLabel}
          </div>
          <div className="flex flex-wrap gap-2">
            {selectedUsers.map((user) => (
              <span
                key={user.id}
                className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-700 shadow-sm"
              >
                {user.name}
              </span>
            ))}
          </div>
        </div>
      )}

      {assignmentError && (
        <div
          role="alert"
          className="mt-5 rounded-lg border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700"
        >
          {assignmentError}
        </div>
      )}
    </section>
  );
}
