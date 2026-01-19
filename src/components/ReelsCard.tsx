import { useState } from 'react'
import { NewsArticle } from '../data/mockNews'

interface ReelsCardProps {
  article: NewsArticle
  onReactionClick: (articleId: string, reaction: string) => void
}

const REACTIONS = ['W', 'mid', 'cooked', 'cap']

export default function ReelsCard({ article, onReactionClick }: ReelsCardProps) {
  const [activeReactions, setActiveReactions] = useState<Set<string>>(new Set())

  const handleReactionToggle = (reaction: string) => {
    const newActive = new Set(activeReactions)
    if (newActive.has(reaction)) {
      newActive.delete(reaction)
    } else {
      newActive.add(reaction)
    }
    setActiveReactions(newActive)
    onReactionClick(article.id, reaction)
  }

  const handleOpenOriginal = () => {
    window.open(article.sourceUrl, '_blank')
  }

  return (
    <div className="w-full h-screen bg-black flex flex-col items-center justify-center relative p-4 overflow-hidden">
      {/* Gradient background effect */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-electric-blue rounded-full blur-3xl"></div>
      </div>

      {/* Content container */}
      <div className="relative z-10 w-full max-w-md flex flex-col items-center justify-center h-full px-6">
        {/* Category badge */}
        <div className="mb-8 self-start">
          <span className="bg-electric-blue text-black text-xs font-semibold uppercase rounded-full px-4 py-1.5 inline-block">
            {article.category}
          </span>
        </div>

        {/* Headline - larger for full screen */}
        <h2 className="text-4xl md:text-5xl font-black text-white mb-8 leading-tight text-center">
          {article.genZHeadline}
        </h2>

        {/* Bullet points - scrollable */}
        <div className="w-full mb-8 max-h-48 overflow-y-auto scrollbar-hide">
          <ul className="space-y-3">
            {article.bullets.map((bullet, idx) => (
              <li key={idx} className="text-text-secondary text-base flex items-start gap-3">
                <span className="text-electric-blue flex-shrink-0 mt-0.5">•</span>
                <span className="leading-relaxed">{bullet}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Source info */}
        <div className="w-full mb-8 flex items-center justify-between">
          <button
            onClick={handleOpenOriginal}
            className="text-electric-blue hover:text-white text-sm font-semibold transition-colors duration-200 flex items-center gap-2"
          >
            read original
            <span>↗</span>
          </button>
          <span className="text-text-secondary text-xs">{article.sourceName}</span>
        </div>

        {/* Reactions - pill shaped at bottom */}
        <div className="w-full flex gap-2 flex-wrap justify-center">
          {REACTIONS.map(reaction => (
            <button
              key={reaction}
              onClick={() => handleReactionToggle(reaction)}
              className={`px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-200 ${
                activeReactions.has(reaction)
                  ? 'bg-electric-blue text-black'
                  : 'bg-dark-border text-text-secondary hover:bg-electric-blue hover:text-black'
              }`}
            >
              {reaction}
            </button>
          ))}
        </div>
      </div>

      {/* Side indicators - scroll position */}
      <div className="fixed right-4 top-1/2 -translate-y-1/2 z-20 flex flex-col gap-2 md:flex">
        <div className="w-1 h-1 bg-electric-blue rounded-full"></div>
        <div className="w-1 h-6 bg-dark-border rounded-full"></div>
        <div className="w-1 h-1 bg-text-secondary rounded-full"></div>
      </div>
    </div>
  )
}
