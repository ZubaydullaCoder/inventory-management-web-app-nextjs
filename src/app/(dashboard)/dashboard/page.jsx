// /src/app/(dashboard)/dashboard/page.jsx
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import OnboardingGuide from "@/components/features/dashboard/onboarding-guide";

/**
 * User data counts for determining onboarding state
 * @typedef {Object} UserDataCounts
 * @property {number} categories - Number of user's categories
 * @property {number} suppliers - Number of user's suppliers
 * @property {number} customers - Number of user's customers
 * @property {number} products - Number of user's products
 */

/**
 * Fetches user data counts to determine if onboarding should be shown
 * @param {string} userId - The authenticated user's ID
 * @returns {Promise<UserDataCounts>} User data counts
 */
async function getUserDataCounts(userId) {
  try {
    const response = await fetch(
      `${process.env.NEXTAUTH_URL}/api/dashboard/counts?userId=${userId}`,
      {
        cache: "no-store", // Always fetch fresh data for dashboard
      }
    );

    if (!response.ok) {
      throw new Error("Failed to fetch user data counts");
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching user data counts:", error);
    // Return empty counts on error to show onboarding
    return { categories: 0, suppliers: 0, customers: 0, products: 0 };
  }
}

/**
 * Main dashboard page that shows onboarding guide for new users
 * or dashboard widgets for users with existing data
 * Server Component that fetches initial data and orchestrates layout
 * @returns {Promise<JSX.Element>} Dashboard page component
 */
export default async function DashboardPage() {
  // Re-verify authentication (Defense in Depth)
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  // Fetch user data counts to determine onboarding state
  const dataCounts = await getUserDataCounts(session.user.id);

  // Determine if user needs onboarding (has no data)
  const totalItems =
    dataCounts.categories +
    dataCounts.suppliers +
    dataCounts.customers +
    dataCounts.products;
  const showOnboarding = totalItems === 0;

  return (
    <div className="space-y-6">
      {showOnboarding ? (
        <OnboardingGuide />
      ) : (
        <div className="space-y-6">
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Dashboard widgets will be implemented in Phase 3 */}
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Welcome Back!
              </h3>
              <p className="text-gray-600">
                Your dashboard widgets will appear here once Phase 3 is
                implemented.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
