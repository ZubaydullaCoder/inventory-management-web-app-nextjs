// /src/lib/hooks/use-debounced-name-validation.js
import { useState, useEffect, useCallback } from "react";
import { useDebounce } from "use-debounce";

/**
 * Hook for debounced product name validation
 * @param {string} name - Product name to validate
 * @param {string} [excludeId] - Product ID to exclude from validation (for updates)
 * @param {number} [delay=500] - Debounce delay in milliseconds
 * @returns {Object} Validation state object
 */
export function useDebouncedNameValidation(
  name,
  excludeId = null,
  delay = 500
) {
  const [isChecking, setIsChecking] = useState(false);
  const [isUnique, setIsUnique] = useState(null);
  const [error, setError] = useState(null);

  const [debouncedName] = useDebounce(name, delay);

  const checkName = useCallback(
    async (nameToCheck) => {
      if (!nameToCheck || nameToCheck.trim().length === 0) {
        setIsUnique(null);
        setError(null);
        return;
      }

      setIsChecking(true);
      setError(null);

      try {
        const params = new URLSearchParams({ name: nameToCheck.trim() });
        if (excludeId) {
          params.append("excludeId", excludeId);
        }

        const response = await fetch(`/api/products/check-name?${params}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Failed to check name");
        }

        setIsUnique(data.isUnique);
      } catch (err) {
        setError(err.message);
        setIsUnique(null);
      } finally {
        setIsChecking(false);
      }
    },
    [excludeId]
  );

  useEffect(() => {
    checkName(debouncedName);
  }, [debouncedName, checkName]);

  return {
    isChecking,
    isUnique,
    error,
    hasChecked: isUnique !== null || error !== null,
  };
}
