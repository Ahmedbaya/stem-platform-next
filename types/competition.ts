export interface Award {
  title: string
  description: string
  value: string
}

export interface Competition {
  _id: string
  title: string
  description: string
  type: string
  startDate: string
  endDate: string
  registrationDeadline: string
  maxTeams: number
  location: string
  organizerId: string
  status: "registration" | "upcoming" | "ongoing" | "completed"
  awards: Award[]
} 
