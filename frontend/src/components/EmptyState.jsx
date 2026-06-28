export default function EmptyState({ icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      {icon && <div className="text-4xl mb-4">{icon}</div>}
      {title && (
        <h3 className="font-display font-semibold text-lg text-text mb-2">
          {title}
        </h3>
      )}
      {description && (
        <p className="text-muted text-sm max-w-sm mb-5 leading-relaxed">
          {description}
        </p>
      )}
      {action && action}
    </div>
  );
}
