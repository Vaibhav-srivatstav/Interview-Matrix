import { ProfileView } from '@/components/profile/profile-view'

export default function ProfilePage() {
  return (
    <div className="min-h-screen bg-background">
    
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="space-y-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">Profile</h1>
            <p className="text-muted-foreground text-lg">Your auto-generated candidate profile</p>
          </div>

          <ProfileView />
        </div>
      </main>
    </div>
  )
}