"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, X } from "lucide-react"

interface ProductSearchProps {
  initialQuery?: string
  initialCategory?: string
  categories: string[]
}

export default function ProductSearch({
  initialQuery = "",
  initialCategory = "all",
  categories = [],
}: ProductSearchProps) {
  const [query, setQuery] = useState(initialQuery)
  const [category, setCategory] = useState(initialCategory)
  const router = useRouter()
  const inputRef = useRef<HTMLInputElement>(null)

  // Update local state when props change
  useEffect(() => {
    setQuery(initialQuery)
    setCategory(initialCategory)
  }, [initialQuery, initialCategory])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()

    // Build the query string
    const params = new URLSearchParams()
    if (query) params.set("query", query)
    if (category !== "all") params.set("category", category)

    // Navigate to the shop page with the search parameters
    router.push(`/shop?${params.toString()}`)
  }

  const handleClear = () => {
    setQuery("")
    setCategory("all")
    router.push("/shop")

    // Focus the input after clearing
    if (inputRef.current) {
      inputRef.current.focus()
    }
  }

  const handleCategoryChange = (value: string) => {
    setCategory(value)

    // Build the query string
    const params = new URLSearchParams()
    if (query) params.set("query", query)
    if (value !== "all") params.set("category", value)

    // Navigate to the shop page with the search parameters
    router.push(`/shop?${params.toString()}`)
  }

  return (
    <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-3">
      <div className="relative flex-grow">
        <Input
          ref={inputRef}
          type="text"
          placeholder="Search products..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="pr-10"
        />
        {query && (
          <button
            type="button"
            onClick={() => setQuery("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      <Select value={category} onValueChange={handleCategoryChange}>
        <SelectTrigger className="w-full md:w-[180px]">
          <SelectValue placeholder="Category" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Categories</SelectItem>
          {categories.map((cat) => (
            <SelectItem key={cat} value={cat}>
              {cat}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Button type="submit" className="flex items-center gap-2">
        <Search className="h-4 w-4" />
        Search
      </Button>

      {(query || category !== "all") && (
        <Button type="button" variant="outline" onClick={handleClear}>
          Clear Filters
        </Button>
      )}
    </form>
  )
}
