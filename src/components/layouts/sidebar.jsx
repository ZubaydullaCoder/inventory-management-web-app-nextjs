// /src/components/layouts/sidebar.jsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  Truck,
  Tags,
  BarChart3,
  Settings,
  Menu,
  X,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

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
    href: "/dashboard/inventory",
    icon: Package,
    children: [
      {
        title: "Products",
        href: "/dashboard/inventory/products",
        icon: Package,
      },
      {
        title: "Categories",
        href: "/dashboard/inventory/categories",
        icon: Tags,
      },
    ],
  },
  {
    title: "Sales",
    href: "/dashboard/sales",
    icon: ShoppingCart,
  },
  {
    title: "Customers",
    href: "/dashboard/customers",
    icon: Users,
  },
  {
    title: "Suppliers",
    href: "/dashboard/suppliers",
    icon: Truck,
  },
  {
    title: "Reports",
    href: "/dashboard/reports",
    icon: BarChart3,
  },
  {
    title: "Settings",
    href: "/dashboard/settings",
    icon: Settings,
  },
];

/**
 * Individual navigation item component
 * @param {Object} props - Component props
 * @param {NavItem} props.item - Navigation item data
 * @param {boolean} props.isCollapsed - Whether sidebar is collapsed
 * @param {string} props.currentPath - Current pathname
 * @returns {JSX.Element} Navigation item
 */
function NavItem({ item, isCollapsed, currentPath }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const hasChildren = item.children && item.children.length > 0;
  const isActive = currentPath === item.href;
  const hasActiveChild =
    hasChildren && item.children.some((child) => currentPath === child.href);

  // Auto-expand if has active child
  useEffect(() => {
    if (hasActiveChild && !isCollapsed) {
      setIsExpanded(true);
    }
  }, [hasActiveChild, isCollapsed]);

  // Collapse children when sidebar collapses
  useEffect(() => {
    if (isCollapsed) {
      setIsExpanded(false);
    }
  }, [isCollapsed]);

  const handleToggle = () => {
    if (!isCollapsed && hasChildren) {
      setIsExpanded(!isExpanded);
    }
  };

  return (
    <div className="mb-1">
      <div
        className={cn(
          "flex items-center justify-between px-3 py-2 text-sm font-medium rounded-md transition-colors cursor-pointer group",
          isActive || hasActiveChild
            ? "bg-primary/10 text-primary"
            : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
        )}
        onClick={handleToggle}
      >
        <Link
          href={item.href}
          className="flex items-center flex-1 min-w-0"
          onClick={(e) => hasChildren && e.preventDefault()}
        >
          <item.icon
            className={cn(
              "w-5 h-5 flex-shrink-0",
              isActive || hasActiveChild ? "text-primary" : "text-gray-400"
            )}
          />
          {!isCollapsed && <span className="ml-3 truncate">{item.title}</span>}
        </Link>

        {hasChildren && !isCollapsed && (
          <ChevronRight
            className={cn(
              "w-4 h-4 flex-shrink-0 transition-transform text-gray-400",
              isExpanded && "rotate-90"
            )}
          />
        )}
      </div>

      {/* Sub-navigation */}
      {hasChildren && isExpanded && !isCollapsed && (
        <div className="ml-6 mt-1 space-y-1">
          {item.children.map((child) => {
            const isChildActive = currentPath === child.href;
            return (
              <Link
                key={child.href}
                href={child.href}
                className={cn(
                  "flex items-center px-3 py-2 text-sm rounded-md transition-colors",
                  isChildActive
                    ? "bg-primary/10 text-primary"
                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                )}
              >
                <child.icon
                  className={cn(
                    "w-4 h-4 mr-3 flex-shrink-0",
                    isChildActive ? "text-primary" : "text-gray-400"
                  )}
                />
                <span className="truncate">{child.title}</span>
              </Link>
            );
          })}
        </div>
      )}

      {/* Tooltip for collapsed state */}
      {isCollapsed && (
        <div className="absolute left-16 top-0 invisible group-hover:visible z-50 bg-gray-900 text-white text-xs rounded px-2 py-1 whitespace-nowrap">
          {item.title}
        </div>
      )}
    </div>
  );
}

/**
 * Sidebar navigation component with collapsible functionality
 * Displays primary navigation for authenticated users with responsive behavior
 * @returns {JSX.Element} Collapsible sidebar with navigation menu
 */
export default function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const pathname = usePathname();

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileOpen(false);
  }, [pathname]);

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  const toggleMobileMenu = () => {
    setIsMobileOpen(!isMobileOpen);
  };

  return (
    <>
      {/* Mobile menu button */}
      <Button
        variant="ghost"
        size="sm"
        className="fixed top-4 left-4 z-50 md:hidden"
        onClick={toggleMobileMenu}
      >
        {isMobileOpen ? (
          <X className="w-5 h-5" />
        ) : (
          <Menu className="w-5 h-5" />
        )}
      </Button>

      {/* Mobile overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "bg-white border-r border-gray-200 min-h-screen transition-all duration-300 flex flex-col z-50",
          // Desktop responsive width
          isCollapsed ? "w-16" : "w-64",
          // Mobile positioning
          "fixed md:relative",
          isMobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        )}
      >
        {/* Header */}
        <div
          className={cn(
            "p-6 border-b border-gray-100 flex items-center",
            isCollapsed && "px-3 justify-center"
          )}
        >
          {!isCollapsed ? (
            <h1 className="text-xl font-bold text-gray-900">
              Inventory Manager
            </h1>
          ) : (
            <Package className="w-8 h-8 text-primary" />
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 mt-6 px-3 overflow-y-auto">
          {navigationItems.map((item) => (
            <div key={item.href} className="relative">
              <NavItem
                item={item}
                isCollapsed={isCollapsed}
                currentPath={pathname}
              />
            </div>
          ))}
        </nav>

        {/* Toggle button - Desktop only */}
        <div className="p-3 border-t border-gray-100 hidden md:block">
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleCollapse}
            className={cn(
              "w-full flex items-center",
              isCollapsed ? "justify-center" : "justify-start"
            )}
          >
            <Menu className="w-4 h-4" />
            {!isCollapsed && <span className="ml-2">Collapse</span>}
          </Button>
        </div>
      </aside>
    </>
  );
}
