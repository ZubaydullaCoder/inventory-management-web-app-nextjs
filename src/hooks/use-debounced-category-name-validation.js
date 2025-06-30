// /src/hooks/use-debounced-category-name-validation.js
import { useState, useEffect, useCallback, useRef } from "react";
import { useDebounce } from "use-debounce";
import { normalizeName } from "@/lib/utils";

/**
 * Hook for debounced category name validation.
 * Only performs validation if the normalized name has changed and is not the initial name.
 * @param {string} name - Current category name from the form
 * @param {string} initialName - The original name of the category when loaded
 * @param {string} [excludeId] - Category ID to exclude from validation (for updates)
 * @param {number} [delay=500] - Debounce delay in milliseconds
 * @returns {Object} Validation state object
 */
export function useDebouncedCategoryNameValidation(
  name,
  initialName,
  excludeId = null,
  delay = 500
) {
  const [isChecking, setIsChecking] = useState(false);
  const [isUnique, setIsUnique] = useState(null);
  const [error, setError] = useState(null);
  const lastCheckedNameRef = useRef(null);

  const [debouncedName] = useDebounce(name, delay);

  const checkName = useCallback(
    async (nameToCheck) => {
      // Normalize the incoming name immediately
      const normalizedName = normalizeName(nameToCheck);
      // Also normalize the initial name for a fair comparison
      const normalizedInitialName = normalizeName(initialName);

      // Guard: Don't run if the normalized name is the same as the initial name or already checked
      if (
        normalizedName === normalizedInitialName ||
        normalizedName === lastCheckedNameRef.current
      ) {
        // If the user types back to the original name, clear previous validation state
        if (normalizedName === normalizedInitialName) {
          setIsUnique(null);
          setError(null);
          lastCheckedNameRef.current = null; // Reset the last checked name ref
        }
        return;
      }

      // If the normalized name is empty, reset state and stop
      if (normalizedName.length === 0) {
        setIsUnique(null);
        setError(null);
        lastCheckedNameRef.current = "";
        return;
      }

      lastCheckedNameRef.current = normalizedName;
      setIsChecking(true);
      setError(null);
      setIsUnique(null);

      try {
        // The name sent to the API is now the normalized one
        const params = new URLSearchParams({ name: normalizedName });
        if (excludeId) {
          params.append("excludeId", excludeId);
        }

        const response = await fetch(`/api/categories/check-name?${params}`);
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
    [excludeId, initialName]
  );

  useEffect(() => {
    // Only start checking if the form has been populated (name is not undefined)
    if (typeof name !== "undefined") {
      checkName(debouncedName);
    }
  }, [debouncedName, name, checkName]);

  return {
    isChecking,
    isUnique,
    error,
    hasChecked: isUnique !== null || error !== null,
  };
}
