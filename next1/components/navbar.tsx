"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ModeToggle } from "@/components/mode-toggle"
import { Menu, X, Video, User } from "lucide-react"
import { useState } from "react"

export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-2">
          <Link href="/" className="flex items-center gap-2">
            <Video className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold">VideoInsight</span>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6">
          <Link href="#" className="text-sm font-medium transition-colors hover:text-primary">
            Dashboard
          </Link>
          <Link href="#" className="text-sm font-medium transition-colors hover:text-primary">
            Analytics
          </Link>
          <Link href="#" className="text-sm font-medium transition-colors hover:text-primary">
            History
          </Link>
          <Link href="#" className="text-sm font-medium transition-colors hover:text-primary">
            Settings
          </Link>
        </nav>

        <div className="flex items-center gap-4">
          <ModeToggle />
          <Button variant="outline" size="icon" className="rounded-full">
            <User className="h-4 w-4" />
            <span className="sr-only">User account</span>
          </Button>
          <Button className="hidden md:flex">Start Recording</Button>
          <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="md:hidden border-t p-4 space-y-4 bg-background">
          <Link href="#" className="block py-2 text-sm font-medium transition-colors hover:text-primary">
            Dashboard
          </Link>
          <Link href="#" className="block py-2 text-sm font-medium transition-colors hover:text-primary">
            Analytics
          </Link>
          <Link href="#" className="block py-2 text-sm font-medium transition-colors hover:text-primary">
            History
          </Link>
          <Link href="#" className="block py-2 text-sm font-medium transition-colors hover:text-primary">
            Settings
          </Link>
          <Button className="w-full mt-2">Start Recording</Button>
        </div>
      )}
    </header>
  )
}

