"use client";

import { useEffect, useRef } from "react";
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
  X,
  CreditCard,
  BarChart3,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navigation = [
  { name: "ダッシュボード", href: "/dashboard", icon: LayoutDashboard },
  { name: "顧客一覧", href: "/customers", icon: Users },
  { name: "物件一覧", href: "/properties", icon: Building2 },
  { name: "案件一覧", href: "/projects", icon: FolderKanban },
  { name: "見積一覧", href: "/estimates", icon: FileText },
  { name: "請求一覧", href: "/invoices", icon: Receipt },
  { name: "入金管理", href: "/payments", icon: CreditCard },
  { name: "月次集計", href: "/reports/monthly", icon: BarChart3 },
  { name: "担当者一覧", href: "/staff", icon: UserCircle },
];

export function Sidebar({ onClose }: { onClose?: () => void }) {
  const pathname = usePathname();
  const sidebarRef = useRef<HTMLDivElement>(null);
  const touchStartX = useRef<number>(0);
  const touchEndX = useRef<number>(0);

  const handleLinkClick = () => {
    // モバイルサイズ（768px未満）の場合のみサイドバーを閉じる
    if (typeof window !== "undefined" && window.innerWidth < 768 && onClose) {
      onClose();
    }
  };

  // スワイプで閉じる機能（モバイルのみ）
  useEffect(() => {
    if (!onClose || !sidebarRef.current) return;

    const sidebar = sidebarRef.current;

    const handleTouchStart = (e: TouchEvent) => {
      touchStartX.current = e.touches[0].clientX;
    };

    const handleTouchMove = (e: TouchEvent) => {
      touchEndX.current = e.touches[0].clientX;
    };

    const handleTouchEnd = () => {
      const swipeDistance = touchStartX.current - touchEndX.current;
      // 左にスワイプ（100px以上）で閉じる
      if (swipeDistance > 100 && typeof window !== "undefined" && window.innerWidth < 768) {
        onClose();
      }
    };

    sidebar.addEventListener("touchstart", handleTouchStart);
    sidebar.addEventListener("touchmove", handleTouchMove);
    sidebar.addEventListener("touchend", handleTouchEnd);

    return () => {
      sidebar.removeEventListener("touchstart", handleTouchStart);
      sidebar.removeEventListener("touchmove", handleTouchMove);
      sidebar.removeEventListener("touchend", handleTouchEnd);
    };
  }, [onClose]);

  return (
    <div
      ref={sidebarRef}
      className="flex h-screen w-64 md:w-64 flex-col border-r border-gray-200 bg-gradient-to-b from-white to-gray-50/50 shadow-sm bg-white"
    >
      <div className="flex h-16 items-center justify-between border-b border-gray-200 bg-white/80 backdrop-blur-sm px-4 md:px-6">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center shadow-md">
            <Building2 className="h-5 w-5 text-white" />
          </div>
          <h1 className="text-base md:text-lg font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
            不動産見積・請求
          </h1>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="md:hidden p-2 -mr-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors active:bg-gray-200"
            aria-label="メニューを閉じる"
          >
            <X className="h-6 w-6" />
          </button>
        )}
      </div>
      <nav className="flex-1 space-y-2 px-3 md:px-3 py-4 overflow-y-auto">
        {navigation.map((item) => {
          const isActive = pathname === item.href || pathname?.startsWith(item.href + "/");
          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={handleLinkClick}
              className={cn(
                "flex items-center gap-3 rounded-xl px-4 py-3.5 md:py-2.5 text-base md:text-sm font-medium transition-all duration-200 active:scale-[0.98]",
                "md:hover:bg-gray-100 md:hover:text-gray-900 md:hover:shadow-sm",
                isActive
                  ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-md shadow-blue-500/30"
                  : "text-gray-700 bg-gray-50/50 md:bg-transparent"
              )}
            >
              <item.icon
                className={cn(
                  "h-6 w-6 md:h-5 md:w-5 flex-shrink-0",
                  isActive ? "text-white" : "text-gray-500"
                )}
              />
              <span className="font-medium">{item.name}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}

