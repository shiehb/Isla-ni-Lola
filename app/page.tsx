import Link from "next/link"
import Image from "next/image"

export default function Home() {
  const favorites = [
    {
      name: "Banana Turon",
      image: "https://i.imghippo.com/files/oNws3581LaA.jpg",
    },
    {
      name: "Cream Puffs",
      image: "https://i.imghippo.com/files/sEvJ7881Fs.jpg",
    },
    {
      name: "Kapeng Barako",
      image: "https://i.imghippo.com/files/eLi6959TBM.webp",
    },
  ]

  return (
    <>
      {/* Hero Section */}
      <section
        className="py-16 bg-cover bg-center"
        style={{ backgroundImage: "url('https://i.imghippo.com/files/MyNd6285NZI.jpg')" }}
      >
        <div className="container mx-auto px-4 flex flex-col items-center md:flex-row md:justify-between">
          <div className="mb-8 md:mb-0">
            <h1 className="text-4xl md:text-6xl text-white font-pacifico leading-snug text-center md:text-left">
              <span className="block">A Filipino Cafe</span>
              <span className="block">right at the heart of Palawan</span>
            </h1>
            <div className="flex space-x-4 mt-4">
              <Link href="/shop" className="bg-white text-black px-6 py-2 rounded-full hover:bg-gray-200 transition">
                Order Now
              </Link>
            </div>
          </div>
          <div>
            <Image
              src="/placeholder.svg"
              alt="Cafe featured drink"
              width={200}
              height={200}
              className="rounded-lg"
            />
          </div>
        </div>
      </section>

      {/* Filipino Favorites Section */}
      <section className="py-12 bg-gray-100">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold text-center mb-8">Filipino Favorites</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {favorites.map((item, index) => (
              <div key={index} className="flex flex-col items-center">
                <div className="mb-2">
                  <Image
                    src={item.image || "/placeholder.svg"}
                    alt={item.name}
                    width={400}
                    height={400}
                    className="w-full h-64 object-cover rounded-lg"
                  />
                </div>
                <h3 className="font-medium text-lg">{item.name}</h3>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonial Section */}
      <section className="py-16" style={{ background: "#d7c1a0" }}>
        <div className="container mx-auto px-4 max-w-3xl text-center">
          <div className="text-5xl text-white mb-4">“</div>
          <p className="italic text-lg text-white mb-6">
            “Isla ni Lola Cafe serves some of the most authentic Filipino dishes I&apos;ve ever tasted. The flavors
            brought me back to my childhood in the province — warm, comforting, and full of heart. Truly a hidden gem.”
          </p>
          <div className="flex justify-center text-yellow-500 mb-4">
            {[1, 2, 3, 4, 5].map((star) => (
              <span key={star} className="text-2xl">
                ★
              </span>
            ))}
          </div>
          <p className="font-semibold text-gray-800">Isla ni Lola - Food Critic, SLU Bites</p>
        </div>
      </section>
    </>
  )
}
