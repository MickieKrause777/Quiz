import Navbar from "@/components/Navbar";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import Footer from "@/components/Footer";

export default async function Layout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const session = await auth();

  if (!session) redirect("/sign-up");

  return (
    <div className="min-h-screen flex flex-col font-work-sans">
      <main className="flex-grow">
        <Navbar />
        {children}
      </main>
      <Footer />
    </div>
  );
}
