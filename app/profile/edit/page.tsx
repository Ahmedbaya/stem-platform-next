import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"
import clientPromise from "@/lib/db"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ProfileEditForm } from "../../components/profile-edit-form"

// Prevent page caching
export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function EditProfilePage() {
  const session = await getServerSession(authOptions)

  if (!session?.user?.email) {
    redirect("/login")
  }

  try {
    const client = await clientPromise
    const db = client.db()

    const userProfile = await db
      .collection("users")
      .findOne({ email: session.user.email })

    if (!userProfile) {
      throw new Error("User profile not found")
    }

    return (
      <div className="container py-8">
        <Card>
          <CardHeader>
            <CardTitle>Edit Profile</CardTitle>
            <CardDescription>Update your personal information</CardDescription>
          </CardHeader>
          <CardContent>
            <ProfileEditForm
              initialData={{
                name: userProfile.name || session.user.name || "",
                email: userProfile.email || session.user.email,
                image: userProfile.image || session.user.image || undefined,
              }}
            />
          </CardContent>
        </Card>
      </div>
    )
  } catch (error) {
    console.error('Error loading profile:', error)
    return (
      <div className="container py-8">
        <Card>
          <CardHeader>
            <CardTitle>Error</CardTitle>
            <CardDescription>Failed to load profile information</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-center text-muted-foreground">
              An error occurred while loading your profile. Please try again later.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }
} 