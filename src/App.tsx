import { useState, useEffect, useRef, useCallback } from 'react'
import { mockNews, NewsArticle } from './data/mockNews'
import Header from './components/Header'
import NewsCard from './components/NewsCard'
import BottomNav from './components/BottomNav'

type Feed = 'home' | 'trending' | 'profile'

export default function App() {
  const [articles, setArticles] = useState<NewsArticle[]>([])
  const [displayedArticles, setDisplayedArticles] = useState<NewsArticle[]>([])
  const [currentFeed, setCurrentFeed] = useState<Feed>('home')
  const [isLoading, setIsLoading] = useState(true)
  const [isPulling, setIsPulling] = useState(false)
  const [itemsPerPage] = useState(5)
  const [displayedCount, setDisplayedCount] = useState(itemsPerPage)
  const feedContainerRef = useRef<HTMLDivElement>(null)
  const pullStartYRef = useRef(0)

  // Initialize with mock data
  useEffect(() => {
    const timer = setTimeout(() => {
      // Filter based on feed
      if (currentFeed === 'trending') {
        // Show only tech and business articles for trending
        const filtered = mockNews.filter(a => a.category === 'tech' || a.category === 'business')
        setArticles(filtered)
      } else {
        setArticles(mockNews)
      }
      setDisplayedCount(itemsPerPage)
      setIsLoading(false)
    }, 500)
    return () => clearTimeout(timer)
  }, [currentFeed, itemsPerPage])

  // Update displayed articles based on displayedCount
  useEffect(() => {
    setDisplayedArticles(articles.slice(0, displayedCount))
  }, [articles, displayedCount])

  // Infinite scroll
  useEffect(() => {
    const container = feedContainerRef.current
    if (!container) return

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = container
      if (scrollTop + clientHeight >= scrollHeight - 500) {
        setDisplayedCount(prev => Math.min(prev + itemsPerPage, articles.length))
      }
    }

    container.addEventListener('scroll', handleScroll)
    return () => container.removeEventListener('scroll', handleScroll)
  }, [articles.length, itemsPerPage])

  // Pull to refresh
  const handleTouchStart = (e: React.TouchEvent) => {
    if (feedContainerRef.current?.scrollTop === 0) {
      pullStartYRef.current = e.touches[0].clientY
    }
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (feedContainerRef.current?.scrollTop === 0) {
      const pullDistance = e.touches[0].clientY - pullStartYRef.current
      if (pullDistance > 60) {
        setIsPulling(true)
      }
    }
  }

  const handleTouchEnd = useCallback(() => {
    if (isPulling) {
      setIsPulling(false)
      setIsLoading(true)
      const timer = setTimeout(() => {
        setDisplayedCount(itemsPerPage)
        setIsLoading(false)
      }, 800)
      return () => clearTimeout(timer)
    }
  }, [isPulling, itemsPerPage])

  const handleReactionClick = (articleId: string, reaction: string) => {
    // For now, just log the reaction
    console.log(`Reacted with "${reaction}" to article ${articleId}`)
  }

  return (
    <div className="flex flex-col h-screen bg-black">
      <Header />

      {/* Main feed container */}
      <div
        ref={feedContainerRef}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        className="flex-1 overflow-y-auto"
      >
        {/* Pull to refresh indicator */}
        {isPulling && (
          <div className="sticky top-0 z-10 bg-black border-b border-dark-border py-4 text-center">
            <div className="inline-block">
              <div className="w-8 h-8 border-2 border-electric-blue border-t-transparent rounded-full animate-spin"></div>
            </div>
            <p className="text-text-secondary text-sm mt-2">loading slingshot news...</p>
          </div>
        )}

        <div className="max-w-2xl mx-auto px-4 md:px-6 py-6">
          {isLoading && !isPulling && displayedArticles.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center py-20">
              <div className="w-12 h-12 border-4 border-electric-blue border-t-transparent rounded-full animate-spin mb-4"></div>
              <p className="text-text-secondary">loading slingshot news...</p>
            </div>
          ) : displayedArticles.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center py-20">
              <p className="text-2xl text-text-secondary">no news yet 💀</p>
            </div>
          ) : (
            <div className="space-y-4">
              {displayedArticles.map(article => (
                <NewsCard
                  key={article.id}
                  article={article}
                  onReactionClick={handleReactionClick}
                />
              ))}
              {displayedCount < articles.length && (
                <div className="py-8 text-center">
                  <div className="inline-block">
                    <div className="w-6 h-6 border-2 border-electric-blue border-t-transparent rounded-full animate-spin"></div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <BottomNav currentFeed={currentFeed} onFeedChange={setCurrentFeed} />
    </div>
  )
}
