// Define user role types for the application
export type UserRole = "admin" | "organizer" | "participant" | "judge" | "spectator"

// Define user session type
export interface UserSession {
  id: string
  name?: string | null
  email?: string | null
  image?: string | null
  role: UserRole
}
