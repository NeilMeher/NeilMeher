import { useState, useEffect, useRef } from 'react'
import { collection, query, orderBy, limit, onSnapshot, updateDoc, doc, increment } from 'firebase/firestore'
import { db } from './firebase'
import ReelsCard from './components/ReelsCard'
import BottomNav from './components/BottomNav'

// Match the Firestore structure exactly
export interface NewsArticle {
  id: string
  sourceHeadline: string
  genZHeadline: string
  sourceDescription: string
  bullets: string[]
  imageUrl?: string
  sourceName: string
  sourceUrl: string
  category: string
  timestamp: any // Firestore timestamp
  reactions: {
    W: number
    mid: number
    cooked: number
    cap: number
  }
}

type Feed = 'home' | 'trending' | 'profile'

export default function App() {
  const [articles, setArticles] = useState<NewsArticle[]>([])
  const [currentFeed, setCurrentFeed] = useState<Feed>('home')
  const [isLoading, setIsLoading] = useState(true)
  const feedContainerRef = useRef<HTMLDivElement>(null)

  // Fetch real data from Firestore
  useEffect(() => {
    setIsLoading(true);

    // Create query
    const q = query(
      collection(db, "news"),
      orderBy("timestamp", "desc"),
      limit(20)
    );

    // Initial subscriber
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const newsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as NewsArticle[];

      setArticles(newsData);
      setIsLoading(false);
    }, (error) => {
      console.error("Error fetching news:", error);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [currentFeed]); // Re-run if feed type changes (later can add category filtering)

  const handleReactionClick = async (articleId: string, reaction: string) => {
    try {
      const docRef = doc(db, "news", articleId);
      // Optimistic update locally? 
      // For now, let firestore sync handle it via onSnapshot
      await updateDoc(docRef, {
        [`reactions.${reaction}`]: increment(1)
      });
      console.log(`Reacted with "${reaction}" to article ${articleId}`);
    } catch (e) {
      console.error("Error updating reaction:", e);
    }
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
