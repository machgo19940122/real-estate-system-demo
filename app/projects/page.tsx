import { redirect } from "next/navigation";

export default function ProjectsPage() {
  // 案件管理機能はいったん利用しないため、ダッシュボードへリダイレクト
  redirect("/dashboard");
}

