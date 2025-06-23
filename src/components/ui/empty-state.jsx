// /src/components/ui/empty-state.jsx
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

/**
 * Empty state component to display when no data is available
 * Provides consistent messaging and call-to-action for empty lists
 * @param {Object} props - Component props
 * @param {React.ComponentType} [props.icon] - Icon component to display
 * @param {string} props.title - Primary message title
 * @param {string} [props.description] - Optional description text
 * @param {string} [props.actionLabel] - Label for action button
 * @param {string} [props.actionHref] - Link URL for action button
 * @param {() => void} [props.onAction] - Click handler for action button
 * @returns {JSX.Element} Empty state component
 */
export default function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  actionHref,
  onAction,
}) {
  return (
    <Card className="w-full">
      <CardContent className="flex flex-col items-center justify-center py-12 px-6 text-center">
        {Icon && (
          <div className="mb-4">
            <Icon className="h-12 w-12 text-gray-400" />
          </div>
        )}

        <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>

        {description && (
          <p className="text-sm text-gray-600 mb-6 max-w-sm">{description}</p>
        )}

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
      </CardContent>
    </Card>
  );
}
