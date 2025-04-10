import { ReactNode } from "react";
import { redirect } from "next/navigation";
import { auth } from "@/auth";

const AuthLayout = async ({ children }: { children: ReactNode }) => {
  const session = await auth();

  if (session) redirect("/");

  return <div className="auth-layout">{children}</div>;
};

export default AuthLayout;
