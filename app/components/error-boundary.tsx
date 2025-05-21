"use client"

import React from "react"

interface ErrorBoundaryState {
  hasError: boolean
  error?: Error
}

export class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  ErrorBoundaryState
> {
  constructor(props: { children: React.ReactNode }) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen flex-col items-center justify-center p-4">
          <div className="rounded-lg bg-destructive/10 p-6 text-destructive">
            <h2 className="mb-2 text-lg font-semibold">Something went wrong</h2>
            <p className="mb-4 text-sm">
              {this.state.error?.message || "An unexpected error occurred"}
            </p>
            <button
              onClick={() => {
                this.setState({ hasError: false })
                window.location.reload()
              }}
              className="rounded bg-destructive px-4 py-2 text-sm text-destructive-foreground hover:bg-destructive/90"
            >
              Try again
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
} 