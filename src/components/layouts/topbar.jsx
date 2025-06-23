// /src/components/layouts/topbar.jsx
import { signOut } from "@/auth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LogOut, Settings, User } from "lucide-react";

/**
 * User data from session
 * @typedef {Object} SessionUser
 * @property {string} id - User ID
 * @property {string} name - User display name
 * @property {string} email - User email
 * @property {string} [image] - User profile image URL
 */

/**
 * Top navigation bar with user profile and actions
 * Displays breadcrumbs and user account menu
 * @param {Object} props - Component props
 * @param {SessionUser} props.user - Authenticated user data
 * @returns {JSX.Element} Top bar component
 */
export default function TopBar({ user }) {
  /**
   * Handle user sign out
   */
  async function handleSignOut() {
    "use server";
    await signOut({ redirectTo: "/" });
  }

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Breadcrumbs / Page Title Area */}
        <div className="flex items-center space-x-4">
          <h2 className="text-lg font-semibold text-gray-900">Dashboard</h2>
        </div>

        {/* User Profile Menu */}
        <div className="flex items-center space-x-4">
          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center space-x-3 hover:bg-gray-50 rounded-md p-2 transition-colors">
              <Avatar className="h-8 w-8">
                <AvatarImage src={user?.image} alt={user?.name} />
                <AvatarFallback>
                  {user?.name?.charAt(0)?.toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
              <div className="text-left">
                <p className="text-sm font-medium text-gray-900">
                  {user?.name || "User"}
                </p>
                <p className="text-xs text-gray-500">{user?.email}</p>
              </div>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />

              <DropdownMenuItem>
                <User className="mr-2 h-4 w-4" />
                <span>Profile</span>
              </DropdownMenuItem>

              <DropdownMenuItem>
                <Settings className="mr-2 h-4 w-4" />
                <span>Settings</span>
              </DropdownMenuItem>

              <DropdownMenuSeparator />

              <DropdownMenuItem asChild>
                <form action={handleSignOut}>
                  <button type="submit" className="flex items-center w-full">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Sign out</span>
                  </button>
                </form>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
