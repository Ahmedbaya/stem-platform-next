export function Button({ children, variant = "default", ...props }) {
  return (
    <button className={`button ${variant}`} {...props}>
      {children}
    </button>
  )
}

