export interface NewsArticle {
  id: string
  category: 'tech' | 'business' | 'science' | 'health' | 'world'
  genZHeadline: string
  bullets: string[]
  sourceUrl: string
  sourceName: string
  timestamp: number
}

export const mockNews: NewsArticle[] = [
  {
    id: '1',
    category: 'tech',
    genZHeadline: 'apple vision pro flopping harder than expected 💀',
    bullets: [
      'sales way below projections, analysts calling it mid',
      'price point ($3500) got people saying nah fr',
      'some devs already abandoning the platform',
      'apple saying "trust the process" but stock took a hit',
      'gen z mostly ignoring it, boomers confused by it'
    ],
    sourceUrl: 'https://example.com/apple-vision',
    sourceName: 'Bloomberg',
    timestamp: Date.now() - 86400000
  },
  {
    id: '2',
    category: 'tech',
    genZHeadline: 'elon\'s x/twitter finally killing blue checks and nobody cares anymore 😭',
    bullets: [
      'blue check system costing them verified users left and right',
      'celebrities actively leaving, choosing bluesky instead',
      'advertisers still ghosting despite rate cuts',
      'moderation is chaos, no cap',
      'discourse has been cooked since day one'
    ],
    sourceUrl: 'https://example.com/twitter-blue',
    sourceName: 'The Verge',
    timestamp: Date.now() - 172800000
  },
  {
    id: '3',
    category: 'business',
    genZHeadline: '2024 layoffs were absolutely unhinged 🔥',
    bullets: [
      'tech companies cutting 260k jobs in one year',
      'crypto bros took biggest L, fx empire completely cooked',
      'wall street says "growth at all costs" still applies',
      'gen z workers learning the hard way that nothing is stable',
      'side hustles and creator economy stepping up big time'
    ],
    sourceUrl: 'https://example.com/2024-layoffs',
    sourceName: 'Reuters',
    timestamp: Date.now() - 259200000
  },
  {
    id: '4',
    category: 'business',
    genZHeadline: 'coffee prices went nuclear, nobody can afford their morning drink 🫠',
    bullets: [
      'arabica beans hitting 15-year highs, supply chain being weird',
      'starbucks basic drink now costs like a full meal',
      'gen z turning to instant coffee, settling for the L',
      'climate change literally destroying coffee harvests',
      'brown girl summer might have to become home brew summer'
    ],
    sourceUrl: 'https://example.com/coffee-prices',
    sourceName: 'Financial Times',
    timestamp: Date.now() - 345600000
  },
  {
    id: '5',
    category: 'science',
    genZHeadline: 'scientists just proved octopuses are actually aliens fr fr 🧠',
    bullets: [
      'new study suggests octopus ancestors came from space',
      'their intelligence and weird genetics don\'t match earth stuff',
      'can regrow limbs like it\'s nothing, no other animal does that',
      'they literally have blue blood and 9 brains',
      'suddenly aliens existing feels way more plausible ngl'
    ],
    sourceUrl: 'https://example.com/octopus-aliens',
    sourceName: 'Nature Science',
    timestamp: Date.now() - 432000000
  },
  {
    id: '6',
    category: 'science',
    genZHeadline: 'time actually might not exist and physicists are lowkey losing it 💀',
    bullets: [
      'quantum physicists saying time is just a construct, fr',
      'einstein had it right but also kinda wrong??',
      'past, present, future might all be happening at once',
      'gen z brain already cooked from thinking about this',
      'philosophy majors finally vindicated after all these years'
    ],
    sourceUrl: 'https://example.com/time-physics',
    sourceName: 'Scientific American',
    timestamp: Date.now() - 518400000
  },
  {
    id: '7',
    category: 'health',
    genZHeadline: 'sleep is the most unhinged thing your body does and we finally understand why 😴',
    bullets: [
      'new research shows sleep is when your brain literally cleans itself',
      'not sleeping enough is making gen z actually cooked',
      'your brain cells shrink 60% to let toxins out, wild af',
      'sleep debt is real and it\'s making you stupid, sorry',
      'all-nighters are now scientifically the worst idea ever'
    ],
    sourceUrl: 'https://example.com/sleep-science',
    sourceName: 'Health & Wellness Today',
    timestamp: Date.now() - 604800000
  },
  {
    id: '8',
    category: 'health',
    genZHeadline: 'dopamine detox is apparently just going outside and touching grass 🌱',
    bullets: [
      'TikTok trends about dopamine detox were lowkey cap this whole time',
      'science says you just need to exist without your phone',
      'boring activities are actually therapy if you let them be',
      'gen z will never recover from the realization',
      'touching grass (literal grass) is the most based health hack'
    ],
    sourceUrl: 'https://example.com/dopamine-detox',
    sourceName: 'Psychology Today',
    timestamp: Date.now() - 691200000
  },
  {
    id: '9',
    category: 'world',
    genZHeadline: 'gen z is literally saving the planet while boomers watched it burn 🌍',
    bullets: [
      'climate activists under 30 making actual policy changes happen',
      'renewable energy adoption skyrocketing, coal industry cooked',
      'young people choosing careers in sustainability over finance',
      'divestment movements actually working, not just performative',
      'probably too late but at least gen z is trying fr'
    ],
    sourceUrl: 'https://example.com/gen-z-climate',
    sourceName: 'BBC World',
    timestamp: Date.now() - 777600000
  },
  {
    id: '10',
    category: 'world',
    genZHeadline: 'remote work revolution means you can now live literally anywhere 📍',
    bullets: [
      'companies finally realizing offices were just a flex anyway',
      'gen z moving to random countries because why not',
      'cost of living arbitrage is literally free real estate',
      'timezone chaos but at least you can afford rent now',
      'the laptop is the new American dream'
    ],
    sourceUrl: 'https://example.com/remote-work',
    sourceName: 'Forbes',
    timestamp: Date.now() - 864000000
  }
]
