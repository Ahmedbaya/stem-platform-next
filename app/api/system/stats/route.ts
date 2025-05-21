import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { connectToDatabase } from "@/lib/mongodb"
import os from "os"

function formatBytes(bytes: number): string {
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"]
  if (bytes === 0) return "0 Bytes"
  const i = Math.floor(Math.log(bytes) / Math.log(1024))
  return `${parseFloat((bytes / Math.pow(1024, i)).toFixed(2))} ${sizes[i]}`
}

function formatUptime(seconds: number): string {
  const days = Math.floor(seconds / (24 * 60 * 60))
  const hours = Math.floor((seconds % (24 * 60 * 60)) / (60 * 60))
  const minutes = Math.floor((seconds % (60 * 60)) / 60)
  
  const parts = []
  if (days > 0) parts.push(`${days}d`)
  if (hours > 0) parts.push(`${hours}h`)
  if (minutes > 0) parts.push(`${minutes}m`)
  
  return parts.join(" ") || "0m"
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { db } = await connectToDatabase()

    // Get database stats
    const dbStats = await db.command({ dbStats: 1 })
    const serverStatus = await db.command({ serverStatus: 1 })

    // Calculate system metrics
    const totalMemory = os.totalmem()
    const freeMemory = os.freemem()
    const usedMemory = totalMemory - freeMemory
    const cpuUsage = os.loadavg()[0] // 1 minute load average
    const cpuCores = os.cpus().length

    const stats = {
      database: {
        status: "connected",
        connections: serverStatus.connections.current,
        collections: dbStats.collections,
        totalDocuments: dbStats.objects,
        storageSize: formatBytes(dbStats.storageSize)
      },
      server: {
        uptime: formatUptime(os.uptime()),
        nodeVersion: process.version,
        platform: `${os.type()} ${os.release()}`,
        memory: {
          total: formatBytes(totalMemory),
          used: formatBytes(usedMemory),
          free: formatBytes(freeMemory)
        },
        cpu: {
          cores: cpuCores,
          load: Math.round(cpuUsage * 100 / cpuCores) // Convert to percentage
        }
      }
    }

    return NextResponse.json(stats)

  } catch (error) {
    console.error("Error fetching system stats:", error)
    return NextResponse.json(
      { error: "Failed to fetch system statistics" },
      { status: 500 }
    )
  }
} 