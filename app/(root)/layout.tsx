import Navbar from "@/components/Navbar";
import { redirect } from "next/navigation";
import { auth } from "@/auth";

export default async function Layout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const session = await auth();

  if (!session) redirect("/sign-up");

  return (
    <main className="font-work-sans">
      <Navbar />

      {children}
    </main>
  );
}
