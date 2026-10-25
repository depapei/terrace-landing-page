import "server-only";
import { redirect } from "next/navigation";
import { getSessionAdmin } from "./session";

/** For admin Server Components: returns the admin or redirects to login. */
export async function getCurrentAdmin() {
  const admin = await getSessionAdmin();
  if (!admin) redirect("/admin/login");
  return admin;
}
