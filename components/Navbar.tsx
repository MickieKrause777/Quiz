import React from "react";
import Link from "next/link";
import Image from "next/image";
import { auth, signOut } from "@/auth";
import { db } from "@/database/drizzle";
import { eq } from "drizzle-orm";
import { users } from "@/database/schema";
import { notFound } from "next/navigation";

const Navbar = async () => {
  const session = await auth();
  if (!session?.user?.email) {
    notFound();
  }
  const user = await db.query.users.findFirst({
    where: eq(users.email, session?.user?.email),
  });
  if (!user) {
    notFound();
  }
  const { xp } = user;

  return (
    <header className="px-3 py-3 shadow-sm font-work-sans dark-gradient">
      <nav className="flex justify-between items-center">
        <Link href="/">
          <Image
            src="/logo.ico"
            alt="logo"
            width={50}
            height={30}
            className="rounded-full"
          />
        </Link>

        <div className="flex items-center gap-2">
          <>
            <Link href="/quiz/create">
              <button className="max-sm:hidden btn-primary">Create</button>
            </Link>

            <form
              action={async () => {
                "use server";

                await signOut({ redirectTo: "/" });
              }}
            >
              <button type="submit" className="btn-primary">
                Logout
              </button>
            </form>

            <Link
              href={`/user/${session?.user?.id}`}
            >
              <button className="btn-primary">{session?.user?.name}</button>
            </Link>

            <span className="text-16-medium max-sm:hidden">
              Current XP: {xp}
            </span>
          </>
        </div>
      </nav>
    </header>
  );
};
export default Navbar;
