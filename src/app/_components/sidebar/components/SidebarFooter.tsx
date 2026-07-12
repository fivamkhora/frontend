import React from "react";
import { CustomNavLink } from "./CustomNavLink";
import { LogOut } from "lucide-react";

type SidebarFooterProps = {
  onLogout: () => void;
};

const SidebarFooter = ({ onLogout }: SidebarFooterProps) => {
  return (
    <div className="mt-auto pt-4 border-t border-gray-100">
      <CustomNavLink
        href="/login"
        icon={<LogOut size={18} />}
        onClick={onLogout}
        className="hover:bg-red-200 hover:text-black"
      >
        Sair
      </CustomNavLink>
    </div>
  );
};

export default SidebarFooter;
