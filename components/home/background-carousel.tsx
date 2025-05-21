"use client"

import { useEffect, useState } from "react"
import Image from "next/image"

const images = [
  "/backgrounds/robotics-1.jpg",
  "/backgrounds/robotics-2.jpg",
  "/backgrounds/robotics-3.jpg",
  "/backgrounds/robotics-4.jpg",
]

export function BackgroundCarousel() {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % images.length)
    }, 5000) // Change image every 5 seconds

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="absolute inset-0 overflow-hidden">
      {images.map((src, index) => (
        <div
          key={src}
          className="absolute inset-0 transition-opacity duration-1000"
          style={{
            opacity: index === currentImageIndex ? 1 : 0,
          }}
        >
          <Image
            src={src}
            alt="Background"
            fill
            className="object-cover"
            priority={index === 0}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/60 to-background" />
        </div>
      ))}
    </div>
  )
} 