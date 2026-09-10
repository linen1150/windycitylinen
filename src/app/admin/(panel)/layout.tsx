import { requireAdmin } from "@/lib/auth";
import { AdminNav } from "@/components/admin/admin-nav";
import { logout } from "./actions";

export default async function PanelLayout({ children }: LayoutProps<"/admin">) {
  const admin = await requireAdmin();

  return (
    <div className="flex min-h-screen">
      <aside className="hidden w-56 shrink-0 flex-col bg-ink px-3 py-6 text-[#EDE7D8] sm:flex">
        <div className="px-3 pb-5">
          <div className="font-script text-xl">Windy City Linen</div>
          <div className="mt-1 text-[11px] uppercase tracking-wide text-brass">Admin</div>
        </div>
        <AdminNav />
        <form action={logout} className="mt-auto px-3 pt-6">
          <div className="mb-2 truncate text-[11px] text-white/50">{admin.email}</div>
          <button className="text-xs text-white/70 underline hover:text-white">Sign out</button>
        </form>
      </aside>

      <div className="min-w-0 flex-1">
        <div className="border-b border-line bg-white px-4 py-3 sm:hidden">
          <AdminNav variant="mobile" />
        </div>
        <div className="p-5 sm:p-8">{children}</div>
      </div>
    </div>
  );
}
