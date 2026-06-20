import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth/session";
import { ROLES } from "@/lib/baserow/constants";

export default async function HomePage() {
  const user = await getSessionUser();
  if (!user) {
    redirect("/login");
  }
  redirect("/select-condominio");
}
