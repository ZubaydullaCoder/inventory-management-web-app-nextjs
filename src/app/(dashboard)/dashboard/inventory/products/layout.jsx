// /src/app/(dashboard)/dashboard/inventory/products/layout.jsx
import React from "react";

/**
 * Products section layout that enables intercepting modals.
 * Renders both the main content and the modal slot.
 * @param {Object} props
 * @param {React.ReactNode} props.children
 * @param {React.ReactNode} props.modal
 */
export default function ProductsLayout({ children, modal }) {
  return (
    <>
      {children}
      {modal}
    </>
  );
}
