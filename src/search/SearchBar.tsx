interface SearchBarProps {
  query: string
  onChange: (value: string) => void
}

export function SearchBar({ query, onChange }: SearchBarProps) {
  return (
    <div className="relative">
      <span className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400">
        🔍
      </span>
      <input
        type="search"
        value={query}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Cerca elemento, tipo o zona…"
        className="w-full rounded-full border border-gray-300 bg-white py-1.5 pl-8 pr-3 text-sm focus:border-gray-400 focus:outline-none"
      />
    </div>
  )
}
