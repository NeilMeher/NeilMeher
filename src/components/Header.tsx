export default function Header() {
  return (
    <header className="sticky top-0 z-20 bg-black border-b border-dark-border">
      <div className="max-w-2xl mx-auto px-4 md:px-6 py-4 flex items-center">
        <h1 className="text-2xl font-bold tracking-tight">
          <span className="text-electric-blue">slingshot</span>
          <span className="font-light text-white ml-2">news</span>
        </h1>
      </div>
    </header>
  )
}
