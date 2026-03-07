"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Building2,
  FolderKanban,
  FileText,
  Receipt,
  UserCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navigation = [
  { name: "ダッシュボード", href: "/dashboard", icon: LayoutDashboard },
  { name: "顧客一覧", href: "/customers", icon: Users },
  { name: "物件一覧", href: "/properties", icon: Building2 },
  { name: "案件一覧", href: "/projects", icon: FolderKanban },
  { name: "見積一覧", href: "/estimates", icon: FileText },
  { name: "請求一覧", href: "/invoices", icon: Receipt },
  { name: "担当者一覧", href: "/staff", icon: UserCircle },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="flex h-screen w-64 flex-col border-r border-gray-200 bg-gradient-to-b from-white to-gray-50/50 shadow-sm">
      <div className="flex h-16 items-center border-b border-gray-200 bg-white/80 backdrop-blur-sm px-6">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center shadow-md">
            <Building2 className="h-5 w-5 text-white" />
          </div>
          <h1 className="text-lg font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
            不動産見積・請求
          </h1>
        </div>
      </div>
      <nav className="flex-1 space-y-1 px-3 py-4">
        {navigation.map((item) => {
          const isActive = pathname === item.href || pathname?.startsWith(item.href + "/");
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
                isActive
                  ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-md shadow-blue-500/30"
                  : "text-gray-700 hover:bg-gray-100 hover:text-gray-900 hover:shadow-sm"
              )}
            >
              <item.icon className={cn("h-5 w-5", isActive ? "text-white" : "text-gray-500")} />
              {item.name}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}

