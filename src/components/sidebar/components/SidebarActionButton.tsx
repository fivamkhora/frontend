"use client";

import { Plus } from "lucide-react";

type SidebarActionButtonProps = {
  onClick?: () => void;
  label: string;
};

export const SidebarActionButton = ({
  onClick,
  label,
}: SidebarActionButtonProps) => {
  return (
    <button
      onClick={onClick}
      className="flex items-center justify-center gap-2 w-full bg-blue-600 hover:bg-blue-700 text-white rounded-xl py-3 px-4 font-medium text-sm transition-all shadow-sm group"
    >
      <Plus size={18} className="transition-transform group-hover:rotate-90" />
      <span className="sidebar-text font-semibold">{label}</span>
    </button>
  );
};
