"use client"

import { useEffect, useState } from "react"


function FloatingNav({ show }: { show: boolean }) {
  return (
    <nav
      className={`
        absolute top-8 left-1/2 -translate-x-1/2 z-50
        px-8 py-4 rounded-full border border-secondary/60 bg-card/30 backdrop-blur-md
        shadow-lg
        transition-all duration-500
        ${show ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4 pointer-events-none"}
      `}
    >
      <span className="text-xl font-semibold tracking-tight text-foreground">
        Adrenalink
        <span className="ml-3 align-middle text-sm font-normal text-secondary/80 italic tracking-wide">
          streamlining the experience
        </span>
      </span>
    </nav>
  )
}

export function LandingDescription() {
  const [showNavbar, setShowNavbar] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      const scrollContainer = document.querySelector(".snap-y")
      if (scrollContainer) {
        const scrollPosition = scrollContainer.scrollTop
        const viewportHeight = window.innerHeight
        setShowNavbar(scrollPosition > viewportHeight * 0.5)
      }
    }

    const scrollContainer = document.querySelector(".snap-y")
    scrollContainer?.addEventListener("scroll", handleScroll)
    return () => scrollContainer?.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <section className="h-screen snap-start relative overflow-hidden bg-background">
        {/* Floating Navbar */}
        <FloatingNav show={showNavbar} />

        {/* Foreground */}
        <div className="relative z-10 h-full flex items-center justify-center px-4">
          <div className="max-w-4xl space-y-10 text-center">
            <h2 className="text-5xl md:text-6xl font-bold tracking-tight text-foreground drop-shadow-2xl">
              Revolutionizing Schools
            </h2>

            {/* Feature Cards */}
            <div className="grid md:grid-cols-3 gap-6 pt-4">
              <div className="p-6 rounded-lg border border-secondary/60 bg-card/20 backdrop-blur-sm hover:border-secondary hover:shadow-xl transition-all duration-300 group">
                <h3 className="text-xl font-semibold mb-2 text-foreground/90 group-hover:scale-105 transition-transform">Management App</h3>
                <p className="text-sm text-secondary/80">Complete school administration in one platform</p>
              </div>
              <div className="p-6 rounded-lg border border-secondary/60 bg-card/20 backdrop-blur-sm hover:border-secondary hover:shadow-xl transition-all duration-300 group">
                <h3 className="text-xl font-semibold mb-2 text-foreground/90 group-hover:scale-105 transition-transform">Equipment Tracking</h3>
                <p className="text-sm text-secondary/80">Monitor and manage all school equipment efficiently</p>
              </div>
              <div className="p-6 rounded-lg border border-secondary/60 bg-card/20 backdrop-blur-sm hover:border-secondary hover:shadow-xl transition-all duration-300 group">
                <h3 className="text-xl font-semibold mb-2 text-foreground/90 group-hover:scale-105 transition-transform">Lesson Management</h3>
                <p className="text-sm text-secondary/80">Organize and track all lessons seamlessly</p>
              </div>
              <div className="p-6 rounded-lg border border-secondary/60 bg-card/20 backdrop-blur-sm hover:border-secondary hover:shadow-xl transition-all duration-300 group">
                <h3 className="text-xl font-semibold mb-2 text-foreground/90 group-hover:scale-105 transition-transform">Booking Automation</h3>
                <p className="text-sm text-secondary/80">Automated scheduling and booking system</p>
              </div>
              <div className="p-6 rounded-lg border border-secondary/60 bg-card/20 backdrop-blur-sm hover:border-secondary hover:shadow-xl transition-all duration-300 group">
                <h3 className="text-xl font-semibold mb-2 text-foreground/90 group-hover:scale-105 transition-transform">Statistic Filtering</h3>
                <p className="text-sm text-secondary/80">Advanced analytics and reporting tools</p>
              </div>
              <div className="p-6 rounded-lg border border-secondary/60 bg-card/20 backdrop-blur-sm hover:border-secondary hover:shadow-xl transition-all duration-300 group">
                <h3 className="text-xl font-semibold mb-2 text-foreground/90 group-hover:scale-105 transition-transform">One Source of Truth</h3>
                <p className="text-sm text-secondary/80">Centralized data management for all operations</p>
              </div>
            </div>

          </div>
        </div>
    </section>
  )
}
