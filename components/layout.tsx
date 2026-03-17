"use client";

import { useState, useEffect } from "react";
import { Sidebar } from "./sidebar";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";

export function AppLayout({ children }: { children: React.ReactNode }) {
  // モバイルではデフォルトで閉じる、PCでは開く
  const [isSidebarOpen, setIsSidebarOpen] = useState(() => {
    if (typeof window !== "undefined") {
      // ローカルストレージから状態を復元
      const saved = localStorage.getItem("sidebarOpen");
      if (saved !== null) {
        return saved === "true";
      }
      // 初回は画面サイズに応じて決定
      return window.innerWidth >= 768;
    }
    return true; // SSR時はデフォルトで開く
  });

  // サイドバーの状態をローカルストレージに保存
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("sidebarOpen", String(isSidebarOpen));
    }
  }, [isSidebarOpen]);

  // 画面サイズ変更時: モバイルにしたときだけ閉じる（PCではユーザーの開閉状態を維持）
  useEffect(() => {
    const handleResize = () => {
      if (typeof window !== "undefined" && window.innerWidth < 768) {
        setIsSidebarOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="flex h-screen overflow-hidden bg-gradient-to-br from-gray-50 via-white to-gray-50">
      {/* オーバーレイ（モバイル用） */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* サイドバー（開閉可能・PCでも閉じられる） */}
      <div
        className={cn(
          "inset-y-0 left-0 z-50 transition-transform duration-300 ease-in-out",
          isSidebarOpen ? "fixed md:static translate-x-0" : "fixed -translate-x-full"
        )}
      >
        <Sidebar onClose={() => setIsSidebarOpen(false)} />
      </div>

      {/* メインコンテンツ */}
      <main className="flex-1 overflow-y-auto relative">
        {/* メニュー開閉ボタン（モバイル・PC共通） */}
        <div className="sticky top-0 z-30 bg-white/80 backdrop-blur-sm border-b border-gray-200">
          <div className="flex items-center gap-4 p-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              aria-label={isSidebarOpen ? "メニューを閉じる" : "メニューを開く"}
            >
              {isSidebarOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>
            <h2 className="text-lg font-semibold">不動産見積・請求システム</h2>
          </div>
        </div>

        <div className="container mx-auto p-6 max-w-7xl">{children}</div>
      </main>
    </div>
  );
}

