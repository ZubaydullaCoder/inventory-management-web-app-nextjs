// /src/components/layouts/sidebar.jsx
import Link from "next/link";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  Truck,
  Tags,
  BarChart3,
  Settings,
} from "lucide-react";

/**
 * Navigation menu items for the sidebar
 * @typedef {Object} NavItem
 * @property {string} title - Display title
 * @property {string} href - Route path
 * @property {React.ComponentType} icon - Lucide icon component
 * @property {NavItem[]} [children] - Sub-navigation items
 */

/** @type {NavItem[]} */
const navigationItems = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Inventory",
    href: "/inventory",
    icon: Package,
    children: [
      { title: "Products", href: "/inventory/products", icon: Package },
      { title: "Categories", href: "/inventory/categories", icon: Tags },
    ],
  },
  {
    title: "Sales",
    href: "/sales",
    icon: ShoppingCart,
  },
  {
    title: "Customers",
    href: "/customers",
    icon: Users,
  },
  {
    title: "Suppliers",
    href: "/suppliers",
    icon: Truck,
  },
  {
    title: "Reports",
    href: "/reports",
    icon: BarChart3,
  },
  {
    title: "Settings",
    href: "/settings",
    icon: Settings,
  },
];

/**
 * Sidebar navigation component with collapsible menu items
 * Displays primary navigation for authenticated users
 * @returns {JSX.Element} Sidebar with navigation menu
 */
export default function Sidebar() {
  return (
    <aside className="w-64 bg-white border-r border-gray-200 min-h-screen">
      <div className="p-6">
        <h1 className="text-xl font-bold text-gray-900">Inventory Manager</h1>
      </div>

      <nav className="mt-6">
        <div className="px-3">
          {navigationItems.map((item) => (
            <div key={item.href} className="mb-1">
              <Link
                href={item.href}
                className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 hover:text-gray-900 rounded-md transition-colors"
              >
                <item.icon className="w-5 h-5 mr-3 text-gray-400" />
                {item.title}
              </Link>

              {/* Sub-navigation */}
              {item.children && (
                <div className="ml-6 mt-1 space-y-1">
                  {item.children.map((child) => (
                    <Link
                      key={child.href}
                      href={child.href}
                      className="flex items-center px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 hover:text-gray-900 rounded-md transition-colors"
                    >
                      <child.icon className="w-4 h-4 mr-3 text-gray-400" />
                      {child.title}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </nav>
    </aside>
  );
}
