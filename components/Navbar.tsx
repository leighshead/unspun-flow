'use client'

import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { LogOut, Home } from 'lucide-react'

export default function Navbar({ userName, userRole }: { userName: string; userRole: string }) {
  const router = useRouter()
  const supabase = createClient()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <h1 className="text-xl font-bold text-primary-600">
              Unspun Media Annotation
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push('/')}
              className="flex items-center gap-2 text-gray-700 hover:text-primary-600"
            >
              <Home size={20} />
              <span>Home</span>
            </button>
            <span className="text-sm text-gray-600">
              {userName} ({userRole})
            </span>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 text-gray-700 hover:text-red-600"
            >
              <LogOut size={20} />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  )
}
