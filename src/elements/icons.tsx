import type { Category } from '@/types'

// Icone vettoriali per i marker sulla mappa (sostituiscono le emoji, §41).
// Silhouette piene (non contorni sottili) disegnate per occupare quasi
// tutto il riquadro 0..24, cosi' restano grandi e leggibili nel cerchio
// bianco del marker invece di sembrare un puntino piccolo al centro.
// Restano comunque vettoriali: nitide a qualunque livello di zoom.

function Bolt() {
  return <path d="M13 1.5 3 14h6.5l-1 8.5L19 10h-6.5L13 1.5z" fill="currentColor" />
}

function Bulb() {
  return (
    <>
      <path
        d="M12 2c-5 0-8.5 3.7-8.5 8 0 3 1.7 5 3.3 6.6.9.9 1.4 1.6 1.6 2.4h7.2c.2-.8.7-1.5 1.6-2.4C18.8 15 20.5 13 20.5 10c0-4.3-3.5-8-8.5-8z"
        fill="currentColor"
      />
      <rect x="8.3" y="20" width="7.4" height="2.3" rx="1.1" fill="currentColor" />
    </>
  )
}

function Sun() {
  return (
    <>
      <circle cx="12" cy="12" r="5.3" fill="currentColor" />
      <path
        d="M12 1v3.4M12 19.6V23M23 12h-3.4M4.4 12H1M19.8 4.2l-2.4 2.4M6.6 17.4l-2.4 2.4M19.8 19.8l-2.4-2.4M6.6 6.6 4.2 4.2"
        stroke="currentColor"
        strokeWidth="2.6"
        strokeLinecap="round"
      />
    </>
  )
}

function Wave() {
  return (
    <path
      d="M1.5 13c2.2-6 5.7-6 7.8 0s5.7 6 7.8 0 5.7-6 7.8 0"
      fill="none"
      stroke="currentColor"
      strokeWidth="3.4"
      strokeLinecap="round"
    />
  )
}

function Speaker() {
  return (
    <>
      <path d="M2 9v6h3.8l5.4 4.2V4.8L5.8 9H2z" fill="currentColor" />
      <path
        d="M15.2 8.3a5.4 5.4 0 0 1 0 7.4M18.6 4.9a10.2 10.2 0 0 1 0 14.2"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="round"
      />
    </>
  )
}

function Plug() {
  return (
    <>
      <rect x="8" y="1.5" width="2.6" height="7" rx="1" fill="currentColor" />
      <rect x="13.4" y="1.5" width="2.6" height="7" rx="1" fill="currentColor" />
      <path d="M4.5 7h15v6.5c0 4.1-3.4 7.5-7.5 7.5s-7.5-3.4-7.5-7.5V7z" fill="currentColor" />
      <rect x="10.7" y="21" width="2.6" height="2.2" rx="1" fill="currentColor" />
    </>
  )
}

function Cloud() {
  return (
    <path
      d="M6.8 20c-3.3 0-5.8-2.7-5.8-5.8 0-2.8 2-5.1 4.6-5.7C6.5 4.6 9.6 2 13.3 2c4.1 0 7.5 3.1 7.9 7.1 2.2.6 3.8 2.6 3.8 5 0 2.9-2.3 5.9-5.6 5.9H6.8z"
      fill="currentColor"
    />
  )
}

function Star() {
  return (
    <path
      d="M12 1.5l3.2 7.4 8 .7-6.1 5.3 1.9 7.9L12 18.6l-6.9 4.2 1.9-7.9-6.1-5.3 8-.7L12 1.5z"
      fill="currentColor"
    />
  )
}

// Path per tipo specifico (element.type)
const TYPE_ICONS: Record<string, () => JSX.Element> = {
  macchina_fumo: Cloud,
  apparecchiatura: Plug,
  punto_alimentazione: Bolt,
  altra_utenza: Bolt,
  cassa: Speaker,
  faretto: Bulb,
  strip_led: Wave,
  punto_luce: Sun,
  altra_luce: Bulb,
}

// Fallback per categoria, se un tipo non ha un'icona dedicata
// (copre anche "scenografia", unico tipo di "allestimento")
const CATEGORY_ICONS: Record<Category, () => JSX.Element> = {
  allestimento: Star,
  elettrico: Bolt,
  audio: Speaker,
  luci: Bulb,
}

interface TypeIconProps {
  type: string
  category: Category
  size: number // lato del riquadro icona, in unita' mappa (coerente col radius del marker)
  color?: string
}

export function TypeIcon({ type, category, size, color = '#fff' }: TypeIconProps) {
  const Icon = TYPE_ICONS[type] ?? CATEGORY_ICONS[category]
  const scale = size / 24
  return (
    // <g> con trasformazione diretta invece di un <svg> annidato: un <svg>
    // dentro l'<svg> della mappa crea un nuovo "viewport" e su alcuni
    // browser/touch puo' rendere impreciso il pointer capture durante il
    // trascinamento del marker. Con <g> restiamo nello stesso sistema di
    // coordinate della mappa, niente nesting, drag preciso come prima.
    <g transform={`translate(${-size / 2}, ${-size / 2}) scale(${scale})`} style={{ pointerEvents: 'none', color }}>
      <Icon />
    </g>
  )
}
