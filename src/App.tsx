import { useState, useEffect, useRef, useCallback } from 'react'
import { mockNews, NewsArticle } from './data/mockNews'
import ReelsCard from './components/ReelsCard'
import BottomNav from './components/BottomNav'

type Feed = 'home' | 'trending' | 'profile'

export default function App() {
  const [articles, setArticles] = useState<NewsArticle[]>([])
  const [currentFeed, setCurrentFeed] = useState<Feed>('home')
  const [isLoading, setIsLoading] = useState(true)
  const feedContainerRef = useRef<HTMLDivElement>(null)

  // Initialize with mock data
  useEffect(() => {
    const timer = setTimeout(() => {
      if (currentFeed === 'trending') {
        const filtered = mockNews.filter(a => a.category === 'tech' || a.category === 'business')
        setArticles(filtered)
      } else {
        setArticles(mockNews)
      }
      setIsLoading(false)
    }, 300)
    return () => clearTimeout(timer)
  }, [currentFeed])

  const handleReactionClick = (articleId: string, reaction: string) => {
    console.log(`Reacted with "${reaction}" to article ${articleId}`)
  }

  if (isLoading) {
    return (
      <div className="w-full h-screen bg-black flex flex-col items-center justify-center">
        <div className="w-12 h-12 border-4 border-electric-blue border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-text-secondary">loading slingshot news...</p>
      </div>
    )
  }

  if (articles.length === 0) {
    return (
      <div className="w-full h-screen bg-black flex flex-col items-center justify-center">
        <p className="text-2xl text-text-secondary">no news yet 💀</p>
      </div>
    )
  }

  return (
    <div className="relative w-full h-screen bg-black overflow-hidden">
      {/* Full-screen snap scroll container */}
      <div
        ref={feedContainerRef}
        className="w-full h-full overflow-y-scroll snap-y snap-mandatory scroll-smooth"
        style={{ scrollBehavior: 'smooth' }}
      >
        {articles.map(article => (
          <div key={article.id} className="w-full h-screen snap-start snap-always flex-shrink-0">
            <ReelsCard
              article={article}
              onReactionClick={handleReactionClick}
            />
          </div>
        ))}
      </div>

      {/* Overlay bottom nav */}
      <div className="fixed bottom-0 left-0 right-0 z-50">
        <BottomNav currentFeed={currentFeed} onFeedChange={setCurrentFeed} />
      </div>
    </div>
  )
}
