"use client"

import { motion } from "framer-motion"
import Image from "next/image"

const sponsors = [
  {
    name: "ATAST Student Section",
    logo: "/sponsors/ATAST Student section (2).png"
  },
  {
    name: "EduTech",
    logo: "/sponsors/edutech.png"
  },
  {
    name: "ATAST",
    logo: "/sponsors/logo_atast.png"
  },
  {
    name: "VEX Robotics",
    logo: "/sponsors/vex_robotics_logo.png"
  }
]

export function SponsorsSection() {
  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">Our Partners</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Collaborating with leading organizations in robotics and education
          </p>
        </motion.div>

        <div className="relative w-full overflow-hidden">
          {/* Gradient Overlays */}
          <div className="absolute left-0 top-0 bottom-0 w-40 bg-gradient-to-r from-background to-transparent z-10" />
          <div className="absolute right-0 top-0 bottom-0 w-40 bg-gradient-to-l from-background to-transparent z-10" />
          
          <div className="flex">
            {[1, 2].map((groupIndex) => (
              <motion.div
                key={groupIndex}
                initial={{ x: "0%" }}
                animate={{ x: "-100%" }}
                transition={{
                  duration: 20,
                  repeat: Infinity,
                  ease: "linear",
                  repeatDelay: 0
                }}
                className="flex gap-20 items-center"
              >
                {sponsors.map((sponsor, index) => (
                  <motion.div
                    key={`${sponsor.name}-${groupIndex}-${index}`}
                    whileHover={{ scale: 1.05 }}
                    className="relative w-[200px] h-[100px] flex-shrink-0"
                  >
                    <Image
                      src={sponsor.logo}
                      alt={sponsor.name}
                      fill
                      className="object-contain hover:brightness-125 transition-all"
                    />
                  </motion.div>
                ))}
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
} 