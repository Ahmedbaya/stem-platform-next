import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

const users = [
  {
    id: 1,
    name: "John Doe",
    email: "john@example.com",
    role: "admin",
    image: "/placeholder.svg?height=32&width=32",
    initials: "JD",
    status: "active",
  },
  {
    id: 2,
    name: "Alice Smith",
    email: "alice@example.com",
    role: "organizer",
    image: "/placeholder.svg?height=32&width=32",
    initials: "AS",
    status: "active",
  },
  {
    id: 3,
    name: "Bob Johnson",
    email: "bob@example.com",
    role: "judge",
    image: "/placeholder.svg?height=32&width=32",
    initials: "BJ",
    status: "inactive",
  },
  {
    id: 4,
    name: "Emma Wilson",
    email: "emma@example.com",
    role: "participant",
    image: "/placeholder.svg?height=32&width=32",
    initials: "EW",
    status: "active",
  },
]

export function UserManagement() {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <Button size="sm" variant="outline">
          Filter
        </Button>
        <Button size="sm">Add User</Button>
      </div>
      <div className="space-y-3">
        {users.map((user) => (
          <div key={user.id} className="flex items-center justify-between p-3 bg-muted/40 rounded-lg">
            <div className="flex items-center gap-3">
              <Avatar className="h-8 w-8">
                <AvatarImage src={user.image} alt={user.name} />
                <AvatarFallback>{user.initials}</AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm font-medium">{user.name}</p>
                <p className="text-xs text-muted-foreground">{user.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={user.status === "active" ? "default" : "secondary"} className="capitalize">
                {user.role}
              </Badge>
              <Button size="sm" variant="ghost">
                Edit
              </Button>
            </div>
          </div>
        ))}
      </div>
      <Button size="sm" variant="outline" className="w-full">
        View All Users
      </Button>
    </div>
  )
}
