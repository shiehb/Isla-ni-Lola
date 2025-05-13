import Image from "next/image"
import { createServerSupabaseClient } from "@/lib/supabase"

async function getTeamMembers() {
  const supabase = createServerSupabaseClient()
  const { data, error } = await supabase.from("team_members").select("*").order("name")

  if (error) {
    console.error("Error fetching team members:", error)
    return []
  }

  return data || []
}

export default async function AboutUs() {
  const teamMembers = await getTeamMembers()

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold font-pacifico mb-8 text-center">About Us</h1>

      <div className="max-w-3xl mx-auto mb-16 text-center">
        <p className="text-lg mb-4">
          Indulge in the delightful flavors of our handcrafted desserts and specialty coffee, where every bite and sip
          brings warmth and joy. At Isla ni Lola, we blend tradition with creativity to offer you an unforgettable café
          experience.
        </p>
        <p className="text-lg mb-4">
          Founded in 2023, we've become a beloved spot for dessert lovers and coffee enthusiasts alike. From rich
          Filipino-inspired sweets to globally influenced treats, each creation is made with passion and the finest
          ingredients. Whether you're craving a decadent pastry, a refreshing drink, or a cozy place to unwind, we
          invite you to savor the moment with us.
        </p>
        <p className="text-lg mb-4">Come, treat yourself—because life is sweeter with dessert!</p>
      </div>

      {/* Team Section */}
      <section className="py-12">
        <h2 className="text-2xl font-bold font-pacifico text-center mb-12">Our Team</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {teamMembers.map((member) => (
            <div key={member.id} className="flex flex-col items-center">
              <div className="mb-4 overflow-hidden rounded-full border-4 border-gray-300 shadow-lg">
                <Image
                  src={member.image_url || "/placeholder.svg?height=200&width=200"}
                  alt={member.name}
                  width={200}
                  height={200}
                  className="object-cover"
                />
              </div>
              <h3 className="text-xl font-semibold">{member.name}</h3>
              <p className="text-gray-600">{member.role}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
