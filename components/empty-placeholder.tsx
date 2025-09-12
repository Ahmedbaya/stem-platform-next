interface EmptyPlaceholderProps {
  children?: React.ReactNode
  className?: string
}

export function EmptyPlaceholder({
  children,
  className,
}: EmptyPlaceholderProps) {
  return (
    <div
      className={`flex min-h-[400px] flex-col items-center justify-center rounded-md border border-dashed p-8 text-center animate-in fade-in-50 ${className}`}
    >
      <div className="mx-auto flex max-w-[420px] flex-col items-center justify-center text-center">
        {children}
      </div>
    </div>
  )
}

interface EmptyPlaceholderIconProps {
  name: React.ComponentType<{ className?: string }>
  className?: string
}

export function EmptyPlaceholderIcon({
  name: Icon,
  className,
}: EmptyPlaceholderIconProps) {
  return <Icon className={`h-24 w-24 text-muted-foreground/70 ${className}`} />
}

interface EmptyPlaceholderTitleProps {
  children: React.ReactNode
}

export function EmptyPlaceholderTitle({ children }: EmptyPlaceholderTitleProps) {
  return <h2 className="mt-6 text-xl font-semibold">{children}</h2>
}

interface EmptyPlaceholderDescriptionProps {
  children: React.ReactNode
}

export function EmptyPlaceholderDescription({
  children,
}: EmptyPlaceholderDescriptionProps) {
  return <p className="mb-8 mt-2 text-center text-sm text-muted-foreground">{children}</p>
} 