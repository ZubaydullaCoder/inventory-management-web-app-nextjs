// /src/app/(dashboard)/layout.jsx
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Sidebar from "@/components/layouts/sidebar";
import TopBar from "@/components/layouts/topbar";

/**
 * Authenticated dashboard layout that wraps all protected routes
 * Renders sidebar navigation and top bar for authenticated users
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components to render
 * @param {React.ReactNode} props.modal - Modal slot for intercepting routes
 * @returns {JSX.Element} Dashboard layout with sidebar and topbar
 */
export default async function DashboardLayout({ children, modal }) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        {/* Sidebar */}
        <Sidebar />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col">
          {/* Top Bar */}
          <TopBar user={session.user} />

          {/* Page Content */}
          <main className="flex-1 p-6">{children}</main>
        </div>
      </div>

      {/* Modal Slot for Intercepting Routes */}
      {modal}
    </div>
  );
}
