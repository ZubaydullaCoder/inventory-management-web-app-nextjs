// /src/components/ui/page-header.jsx
import { Button } from "@/components/ui/button";

/**
 * Reusable page header component for consistent page layouts
 * Displays page title, description, and optional action button
 * @param {Object} props - Component props
 * @param {string} props.title - Page title
 * @param {string} [props.description] - Optional page description
 * @param {string} [props.actionLabel] - Label for action button
 * @param {string} [props.actionHref] - Link URL for action button
 * @param {() => void} [props.onAction] - Click handler for action button
 * @returns {JSX.Element} Page header component
 */
export default function PageHeader({
  title,
  description,
  actionLabel,
  actionHref,
  onAction,
}) {
  return (
    <div className="flex items-center justify-between mb-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
        {description && (
          <p className="mt-1 text-sm text-gray-600">{description}</p>
        )}
      </div>

      {actionLabel && (
        <div>
          {actionHref ? (
            <Button asChild>
              <a href={actionHref}>{actionLabel}</a>
            </Button>
          ) : (
            <Button onClick={onAction}>{actionLabel}</Button>
          )}
        </div>
      )}
    </div>
  );
}
