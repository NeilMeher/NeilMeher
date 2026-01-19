import { Home, Flame, User } from 'lucide-react'

interface BottomNavProps {
  currentFeed: 'home' | 'trending' | 'profile'
  onFeedChange: (feed: 'home' | 'trending' | 'profile') => void
}

export default function BottomNav({ currentFeed, onFeedChange }: BottomNavProps) {
  const navItems = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'trending', label: 'Trending', icon: Flame },
    { id: 'profile', label: 'Profile', icon: User }
  ]

  return (
    <nav className="bg-gradient-to-t from-black via-black to-transparent backdrop-blur-nav">
      <div className="px-4 md:px-6 py-4 flex items-center justify-center gap-8">
        {navItems.map(item => {
          const Icon = item.icon
          const isActive = currentFeed === item.id

          return (
            <button
              key={item.id}
              onClick={() => onFeedChange(item.id as any)}
              className="p-2 rounded-lg transition-all duration-200 group"
              aria-label={item.label}
            >
              <Icon
                className={`nav-icon ${
                  isActive ? 'text-electric-blue fill-electric-blue' : 'text-text-secondary group-hover:text-white'
                }`}
                size={28}
              />
            </button>
          )
        })}
      </div>
    </nav>
  )
}
