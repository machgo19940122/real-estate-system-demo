import { AppLayout } from "@/components/layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { properties, projects, getCustomerById } from "@/src/data/mock";
import { formatDate } from "@/lib/utils";
import { ArrowLeft, MapPin, User, Calendar, Building2 } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

export default async function PropertyDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const property = properties.find((p) => p.id === parseInt(id));

  if (!property) {
    notFound();
  }

  const propertyProjects = projects.filter((p) => p.property_id === property.id);

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Link href="/properties">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              戻る
            </Button>
          </Link>
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
              {property.name}
            </h1>
            <p className="text-gray-600 mt-1">物件詳細情報</p>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* 基本情報 */}
          <Card className="border-0 shadow-lg">
            <CardHeader className="border-b">
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5 text-blue-600" />
                基本情報
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500">住所</p>
                  <p className="font-medium">{property.address}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <User className="h-5 w-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500">所有者</p>
                  <p className="font-medium">{property.owner}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Calendar className="h-5 w-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500">登録日</p>
                  <p className="font-medium">
                    {property.created_at ? formatDate(property.created_at) : "-"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 関連案件 */}
          <Card className="border-0 shadow-lg">
            <CardHeader className="border-b">
              <CardTitle>関連案件 ({propertyProjects.length}件)</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              {propertyProjects.length > 0 ? (
                <div className="space-y-3">
                  {propertyProjects.map((project) => {
                    const customer = getCustomerById(project.customer_id);
                    return (
                      <Link
                        key={project.id}
                        href={`/projects/${project.id}`}
                        className="block p-4 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50/50 transition-all"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-gray-900">{project.name}</p>
                            <p className="text-sm text-gray-500 mt-1">{customer?.name}</p>
                          </div>
                          <span
                            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                              project.status === "完了"
                                ? "bg-green-100 text-green-800"
                                : project.status === "契約済"
                                ? "bg-blue-100 text-blue-800"
                                : project.status === "工事中"
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-gray-100 text-gray-800"
                            }`}
                          >
                            {project.status}
                          </span>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">関連案件がありません</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}

