import { redirect } from "next/navigation";
import { AdminDashboard } from "@/components/admin/AdminDashboard";
import { getAdminDashboardData } from "@/lib/data";
import { isAdminLoggedIn } from "@/lib/session";

export default async function AdminPage() {
  if (!(await isAdminLoggedIn())) {
    redirect("/admin/login");
  }

  const data = await getAdminDashboardData();

  return <AdminDashboard initialData={data} />;
}

