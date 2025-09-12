import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"

const services = [
  {
    name: "Authentication Service",
    status: "operational",
    uptime: 100,
  },
  {
    name: "Database",
    status: "operational",
    uptime: 99.98,
  },
  {
    name: "Storage Service",
    status: "operational",
    uptime: 99.95,
  },
  {
    name: "API Gateway",
    status: "operational",
    uptime: 99.99,
  },
  {
    name: "Notification Service",
    status: "degraded",
    uptime: 98.5,
  },
]

export function SystemStatus() {
  return (
    <div className="space-y-4">
      {services.map((service) => (
        <div key={service.name} className="space-y-2">
          <div className="flex justify-between items-center">
            <p className="text-sm font-medium">{service.name}</p>
            <Badge
              variant={
                service.status === "operational"
                  ? "default"
                  : service.status === "degraded"
                    ? "secondary"
                    : "destructive"
              }
              className="capitalize"
            >
              {service.status}
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            <Progress value={service.uptime} className="h-2" />
            <span className="text-xs text-muted-foreground w-12">{service.uptime}%</span>
          </div>
        </div>
      ))}
      <div className="pt-2 text-xs text-muted-foreground text-center">Last updated: {new Date().toLocaleString()}</div>
    </div>
  )
}
