"use client"

import { useState } from "react"
import Image, { type ImageProps } from "next/image"

interface SafeImageProps extends Omit<ImageProps, "onError"> {
  fallbackSrc?: string
}

export default function SafeImage({
  src,
  alt,
  fallbackSrc = "/placeholder.svg?height=300&width=300",
  ...props
}: SafeImageProps) {
  const [imgSrc, setImgSrc] = useState<string | null>(null)
  const [hasError, setHasError] = useState(false)

  // Use a more robust approach to handle image sources
  useState(() => {
    // Start with the provided src or fallback immediately
    setImgSrc(src || fallbackSrc)
  })

  const handleError = () => {
    if (!hasError) {
      console.log(`Image failed to load: ${src}, using fallback`)
      setImgSrc(fallbackSrc)
      setHasError(true)
    }
  }

  // Ensure we always have a valid source
  const finalSrc = imgSrc || fallbackSrc

  return <Image {...props} src={finalSrc || "/placeholder.svg"} alt={alt} onError={handleError} />
}
