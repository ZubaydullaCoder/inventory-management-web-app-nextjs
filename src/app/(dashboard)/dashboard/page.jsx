// /src/app/(dashboard)/dashboard/page.jsx
import { auth, signOut } from "@/auth";
import { redirect } from "next/navigation";

/**
 * Dashboard page - protected, only accessible to authenticated users.
 * Displays a welcome message and a sign out button.
 */
export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  /**
   * JSDoc type casting to inform the editor about our custom session shape.
   * @type {import('next-auth').Session & { user: { id: string } }}
   */
  const typedSession = session;

  return (
    <main className="container max-w-2xl py-16">
      <h1 className="text-3xl font-bold mb-4">Dashboard</h1>
      <p className="mb-2">Welcome, {typedSession.user.name || "User"}!</p>
      <p className="mb-8 text-muted-foreground">
        Your ID: {typedSession.user.id}
      </p>
      <form
        action={async () => {
          "use server";
          await signOut({ callbackUrl: "/" });
        }}
      >
        <button
          type="submit"
          className="bg-primary text-primary-foreground px-4 py-2 rounded font-medium hover:bg-primary/90 transition"
        >
          Sign Out
        </button>
      </form>
    </main>
  );
}
