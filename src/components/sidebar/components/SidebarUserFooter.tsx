"use client";

import Image from "next/image";
import { User, LogOut } from "lucide-react";
import { CustomNavLink } from "./CustomNavLink";

type SidebarUserFooterProps = {
  userName: string;
  userImage?: string | null;
  onLogout: () => void;
};

export const SidebarUserFooter = ({
  userName,
  userImage,
  onLogout,
}: SidebarUserFooterProps) => {
  return (
    <div className="mt-auto pt-4 border-t border-gray-100 flex flex-col gap-1">
      <CustomNavLink
        href="/profile"
        icon={
          userImage ? (
            <Image
              src={userImage}
              alt="Avatar do usuário"
              width={24}
              height={24}
              className="rounded-full object-cover"
              unoptimized={userImage.startsWith("data:")}
            />
          ) : (
            <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center">
              <User size={14} className="text-gray-600" />
            </div>
          )
        }
      >
        {userName}
      </CustomNavLink>

      <CustomNavLink
        href="/login"
        icon={<LogOut size={18} />}
        onClick={onLogout}
      >
        Sair
      </CustomNavLink>
    </div>
  );
};
