import ProfileDetails from '@/components/profileDeatils'

// REQUIRED for static export
export async function generateStaticParams() {
  // Example: fetch all profile IDs
  const res = await fetch('https://api.example.com/profiles')
  const profiles = await res.json()

  return profiles.map(profile => ({
    id: profile.id.toString(),
  }))
}

export default function Page({ params }) {
  return (
    <div>
      <ProfileDetails id={params.id} />
    </div>
  )
}
