import { useState } from 'react'
import { NewsArticle } from '../data/mockNews'

interface NewsCardProps {
  article: NewsArticle
  onReactionClick: (articleId: string, reaction: string) => void
}

const REACTIONS = ['W', 'mid', 'cooked', 'cap']

export default function NewsCard({ article, onReactionClick }: NewsCardProps) {
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

  const categoryColors: Record<string, string> = {
    tech: 'bg-electric-blue',
    business: 'bg-electric-blue',
    science: 'bg-electric-blue',
    health: 'bg-electric-blue',
    world: 'bg-electric-blue'
  }

  return (
    <article className="news-card">
      {/* Category tag */}
      <div>
        <span className={`${categoryColors[article.category]} text-black text-xs font-semibold uppercase rounded-full px-3 py-1 inline-block mb-4`}>
          {article.category}
        </span>
      </div>

      {/* Headline */}
      <h2 className="text-2xl font-bold text-white mb-4 leading-tight">
        {article.genZHeadline}
      </h2>

      {/* Bullet points */}
      <ul className="space-y-2 mb-6">
        {article.bullets.map((bullet, idx) => (
          <li key={idx} className="text-text-secondary text-sm flex items-start">
            <span className="text-electric-blue mr-3 flex-shrink-0 mt-1">•</span>
            <span>{bullet}</span>
          </li>
        ))}
      </ul>

      {/* Footer row: read original + source */}
      <div className="flex items-center justify-between mb-6 pb-6 border-b border-dark-border">
        <button
          onClick={handleOpenOriginal}
          className="text-electric-blue hover:text-white text-sm font-medium transition-colors duration-200 flex items-center gap-1"
        >
          read original
          <span>↗</span>
        </button>
        <span className="text-text-secondary text-xs">{article.sourceName}</span>
      </div>

      {/* Reaction buttons */}
      <div className="flex gap-2 flex-wrap">
        {REACTIONS.map(reaction => (
          <button
            key={reaction}
            onClick={() => handleReactionToggle(reaction)}
            className={`reaction-btn ${activeReactions.has(reaction) ? 'active' : ''}`}
          >
            {reaction}
          </button>
        ))}
      </div>
    </article>
  )
}
