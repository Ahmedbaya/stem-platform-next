"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  AlertTriangle,
  Bell,
  Mail,
  Shield,
  User,
  Lock,
  Settings,
  Loader2,
  Globe,
  Clock
} from "lucide-react"
import { toast } from "sonner"

interface UserSettings {
  notifications: {
    email: boolean
    push: boolean
    competitionUpdates: boolean
    newMessages: boolean
  }
  privacy: {
    profileVisibility: "public" | "private"
    showScore: boolean
    showSubmissions: boolean
  }
  preferences: {
    language: string
    timezone: string
    theme: "light" | "dark" | "system"
  }
  security: {
    twoFactorEnabled: boolean
    lastPasswordChange: string
    sessionTimeout: number
  }
}

const defaultSettings: UserSettings = {
  notifications: {
    email: true,
    push: true,
    competitionUpdates: true,
    newMessages: true
  },
  privacy: {
    profileVisibility: "public",
    showScore: true,
    showSubmissions: true
  },
  preferences: {
    language: "en",
    timezone: "UTC",
    theme: "system"
  },
  security: {
    twoFactorEnabled: false,
    lastPasswordChange: new Date().toISOString(),
    sessionTimeout: 30
  }
}

export default function SettingsPage() {
  const { data: session } = useSession()
  const [settings, setSettings] = useState<UserSettings>(defaultSettings)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchSettings()
  }, [])

  async function fetchSettings() {
    try {
      setLoading(true)
      const response = await fetch("/api/settings")
      if (!response.ok) throw new Error("Failed to fetch settings")
      const data = await response.json()
      setSettings(data)
    } catch (error) {
      console.error("Error fetching settings:", error)
      toast.error("Failed to load settings")
    } finally {
      setLoading(false)
    }
  }

  async function updateSettings(section: keyof UserSettings, key: string, value: any) {
    try {
      setSaving(true)
      const response = await fetch("/api/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          section,
          key,
          value
        })
      })

      if (!response.ok) throw new Error("Failed to update settings")
      
      setSettings(prev => ({
        ...prev,
        [section]: {
          ...prev[section],
          [key]: value
        }
      }))
      
      toast.success("Settings updated successfully")
    } catch (error) {
      console.error("Error updating settings:", error)
      toast.error("Failed to update settings")
    } finally {
      setSaving(false)
    }
  }

  if (!session?.user) {
    return (
      <div className="container py-8">
        <Card>
          <CardContent className="flex items-center justify-center h-[400px]">
            <div className="text-center">
              <AlertTriangle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2">Access Denied</h2>
              <p className="text-muted-foreground">
                Please sign in to view settings.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="container py-8 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="container py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Settings</h1>
          <p className="text-muted-foreground">
            Manage your account settings and preferences
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-sm">
            {(session.user.role || "user").charAt(0).toUpperCase() + (session.user.role || "user").slice(1)}
          </Badge>
        </div>
      </div>

      <Tabs defaultValue="notifications" className="space-y-4">
        <TabsList>
          <TabsTrigger value="notifications">
            <Bell className="h-4 w-4 mr-2" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="privacy">
            <Lock className="h-4 w-4 mr-2" />
            Privacy
          </TabsTrigger>
          <TabsTrigger value="preferences">
            <Settings className="h-4 w-4 mr-2" />
            Preferences
          </TabsTrigger>
          <TabsTrigger value="security">
            <Shield className="h-4 w-4 mr-2" />
            Security
          </TabsTrigger>
        </TabsList>

        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Notification Settings</CardTitle>
              <CardDescription>
                Configure how you want to receive notifications
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Email Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive notifications via email
                  </p>
                </div>
                <Switch
                  checked={settings.notifications.email}
                  onCheckedChange={(checked) =>
                    updateSettings("notifications", "email", checked)
                  }
                  disabled={saving}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Push Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive push notifications in your browser
                  </p>
                </div>
                <Switch
                  checked={settings.notifications.push}
                  onCheckedChange={(checked) =>
                    updateSettings("notifications", "push", checked)
                  }
                  disabled={saving}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Competition Updates</Label>
                  <p className="text-sm text-muted-foreground">
                    Get notified about competition status changes
                  </p>
                </div>
                <Switch
                  checked={settings.notifications.competitionUpdates}
                  onCheckedChange={(checked) =>
                    updateSettings("notifications", "competitionUpdates", checked)
                  }
                  disabled={saving}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>New Messages</Label>
                  <p className="text-sm text-muted-foreground">
                    Get notified when you receive new messages
                  </p>
                </div>
                <Switch
                  checked={settings.notifications.newMessages}
                  onCheckedChange={(checked) =>
                    updateSettings("notifications", "newMessages", checked)
                  }
                  disabled={saving}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="privacy">
          <Card>
            <CardHeader>
              <CardTitle>Privacy Settings</CardTitle>
              <CardDescription>
                Manage your privacy preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Profile Visibility</Label>
                  <select
                    className="w-full p-2 border rounded-md"
                    value={settings.privacy.profileVisibility}
                    onChange={(e) =>
                      updateSettings("privacy", "profileVisibility", e.target.value)
                    }
                    disabled={saving}
                  >
                    <option value="public">Public</option>
                    <option value="private">Private</option>
                  </select>
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Show Score</Label>
                    <p className="text-sm text-muted-foreground">
                      Display your competition scores on your profile
                    </p>
                  </div>
                  <Switch
                    checked={settings.privacy.showScore}
                    onCheckedChange={(checked) =>
                      updateSettings("privacy", "showScore", checked)
                    }
                    disabled={saving}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Show Submissions</Label>
                    <p className="text-sm text-muted-foreground">
                      Make your submissions visible to others
                    </p>
                  </div>
                  <Switch
                    checked={settings.privacy.showSubmissions}
                    onCheckedChange={(checked) =>
                      updateSettings("privacy", "showSubmissions", checked)
                    }
                    disabled={saving}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="preferences">
          <Card>
            <CardHeader>
              <CardTitle>Preferences</CardTitle>
              <CardDescription>
                Customize your experience
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Language</Label>
                  <select
                    className="w-full p-2 border rounded-md"
                    value={settings.preferences.language}
                    onChange={(e) =>
                      updateSettings("preferences", "language", e.target.value)
                    }
                    disabled={saving}
                  >
                    <option value="en">English</option>
                    <option value="es">Spanish</option>
                    <option value="fr">French</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>Timezone</Label>
                  <select
                    className="w-full p-2 border rounded-md"
                    value={settings.preferences.timezone}
                    onChange={(e) =>
                      updateSettings("preferences", "timezone", e.target.value)
                    }
                    disabled={saving}
                  >
                    <option value="UTC">UTC</option>
                    <option value="EST">Eastern Time</option>
                    <option value="PST">Pacific Time</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>Theme</Label>
                  <select
                    className="w-full p-2 border rounded-md"
                    value={settings.preferences.theme}
                    onChange={(e) =>
                      updateSettings("preferences", "theme", e.target.value as "light" | "dark" | "system")
                    }
                    disabled={saving}
                  >
                    <option value="light">Light</option>
                    <option value="dark">Dark</option>
                    <option value="system">System</option>
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
              <CardDescription>
                Manage your account security
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Two-Factor Authentication</Label>
                  <p className="text-sm text-muted-foreground">
                    Add an extra layer of security to your account
                  </p>
                </div>
                <Switch
                  checked={settings.security.twoFactorEnabled}
                  onCheckedChange={(checked) =>
                    updateSettings("security", "twoFactorEnabled", checked)
                  }
                  disabled={saving}
                />
              </div>
              <div className="space-y-2">
                <Label>Session Timeout (minutes)</Label>
                <Input
                  type="number"
                  value={settings.security.sessionTimeout}
                  onChange={(e) =>
                    updateSettings("security", "sessionTimeout", parseInt(e.target.value))
                  }
                  min={15}
                  max={120}
                  disabled={saving}
                />
              </div>
              <div className="space-y-2">
                <Label>Last Password Change</Label>
                <p className="text-sm text-muted-foreground">
                  {new Date(settings.security.lastPasswordChange).toLocaleDateString()}
                </p>
                <Button
                  variant="outline"
                  onClick={() => {/* Implement password change flow */}}
                  className="mt-2"
                >
                  Change Password
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
} 