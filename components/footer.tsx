import Link from "next/link"
import { Facebook, Instagram, Twitter } from "lucide-react"

export default function Footer() {
  return (
    <footer className="bg-gray-200 py-6">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0 text-center md:text-left">
            <p className="text-sm">Isla ni Lola</p>
            <p className="text-sm">Puerto Princesa</p>
            <p className="text-sm">Palawan</p>
          </div>

          <div className="flex space-x-4">
            <Link href="#" aria-label="Facebook">
              <Facebook className="h-5 w-5" />
            </Link>
            <Link href="#" aria-label="Instagram">
              <Instagram className="h-5 w-5" />
            </Link>
            <Link href="#" aria-label="Twitter">
              <Twitter className="h-5 w-5" />
            </Link>
          </div>

          <div className="mt-4 md:mt-0">
            <p className="text-sm">0921-2121-2121</p>
          </div>
        </div>
      </div>
    </footer>
  )
}
