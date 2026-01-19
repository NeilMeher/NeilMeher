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
    <nav className="fixed bottom-0 left-0 right-0 bg-black backdrop-blur-nav border-t border-dark-border">
      <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-around">
        {navItems.map(item => {
          const Icon = item.icon
          const isActive = currentFeed === item.id

          return (
            <button
              key={item.id}
              onClick={() => onFeedChange(item.id as any)}
              className="p-3 rounded-lg transition-all duration-200 group"
              aria-label={item.label}
            >
              <Icon
                className={`nav-icon ${
                  isActive ? 'text-electric-blue fill-electric-blue' : 'text-text-secondary group-hover:text-white'
                }`}
              />
            </button>
          )
        })}
      </div>
    </nav>
  )
}
