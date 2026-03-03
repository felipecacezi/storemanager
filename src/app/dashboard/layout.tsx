import { SidebarProvider, Sidebar, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/sidebar";
import { cookies, headers } from "next/headers";

async function getCompanyStatus() {
  const headersList = await headers();
  const protocol = headersList.get("x-forwarded-proto") ?? "http";
  const host = headersList.get("host");
  if (!host) return { hasCompany: true };

  const baseUrl = `${protocol}://${host}`;
  const cookieHeader = (await cookies()).toString();

  try {
    const response = await fetch(`${baseUrl}/api/settings/company/status`, {
      headers: {
        Cookie: cookieHeader,
      },
      cache: "no-store",
    });

    if (!response.ok) {
      return { hasCompany: true };
    }

    return response.json();
  } catch {
    return { hasCompany: true };
  }
}

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const status = await getCompanyStatus();
  return (
    <SidebarProvider>
      <Sidebar>
        <AppSidebar companyLocked={!status?.hasCompany} />
      </Sidebar>
      <SidebarInset>{children}</SidebarInset>
    </SidebarProvider>
  );
}
