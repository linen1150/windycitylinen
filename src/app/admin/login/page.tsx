import { redirect } from "next/navigation";
import { getAdmin } from "@/lib/auth";
import { LoginForm } from "./login-form";

export default async function LoginPage() {
  if (await getAdmin()) redirect("/admin");

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center">
          <div className="font-script text-3xl text-ink">Windy City Linen</div>
          <p className="mt-1 text-sm text-ink-soft">Admin sign in</p>
        </div>
        <div className="mt-6 border border-line bg-white p-6">
          <LoginForm />
        </div>
      </div>
    </div>
  );
}
