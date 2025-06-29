// /src/components/features/products/product-name-validation.jsx
"use client";

import { CheckCircle, XCircle, Loader2 } from "lucide-react";

/**
 * Product name validation indicator component
 * @param {Object} props
 * @param {string} props.watchedName - Current name being watched
 * @param {Object} props.product - Original product data
 * @param {boolean} props.isChecking - Whether validation is in progress
 * @param {boolean} props.isUnique - Whether the name is unique
 * @param {string} props.error - Validation error message
 * @param {boolean} props.hasChecked - Whether validation has been performed
 * @returns {JSX.Element|null} Validation indicator or null
 */
export default function ProductNameValidation({
  watchedName,
  product,
  isChecking,
  isUnique,
  error,
  hasChecked,
}) {
  if (!watchedName || watchedName.trim().length === 0) return null;
  if (product && watchedName === product.name) return null; // No need to validate unchanged name

  if (isChecking) {
    return (
      <div className="flex items-center text-sm text-blue-600">
        <Loader2 className="w-4 h-4 mr-1 animate-spin" />
        Checking availability...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center text-sm text-red-600">
        <XCircle className="w-4 h-4 mr-1" />
        Error checking name
      </div>
    );
  }

  if (hasChecked && isUnique) {
    return (
      <div className="flex items-center text-sm text-green-600">
        <CheckCircle className="w-4 h-4 mr-1" />
        Name is available
      </div>
    );
  }

  if (hasChecked && !isUnique) {
    return (
      <div className="flex items-center text-sm text-red-600">
        <XCircle className="w-4 h-4 mr-1" />A product with this name already
        exists
      </div>
    );
  }

  return null;
}
