import { redirect } from "next/navigation";

export default function LoginPage() {
  // Redirect to the NextAuth signin page
  redirect("/api/auth/signin");
}
