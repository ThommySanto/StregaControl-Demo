import type { Category } from '@/types'

// Catalogo delle tipologie disponibili per categoria (§13-16).
// Volutamente semplice: solo cosa serve e dove, mai dettagli tecnici
// (potenza, cablaggi, quadri...) — quelli restano al service (§2, §14-16).
export interface ElementTypeDef {
  value: string
  label: string
  icon: string // emoji per ora; sostituibile con set SVG (§41) senza toccare la logica
  hasQuantity?: boolean // utile per "quante prese/utenze", §14
}

export interface CategoryDef {
  value: Category
  label: string
  icon: string
  color: string // classe tailwind bg-*, usata staticamente nei filtri/legenda (§40)
  dot: string // colore esadecimale dello stesso tono, per i marker SVG (fill dinamico)
  types: ElementTypeDef[]
}

export const CATEGORY_DEFS: CategoryDef[] = [
  {
    value: 'allestimento',
    label: 'Allestimento',
    icon: '🎭',
    color: 'bg-violet-600',
    dot: '#7c3aed',
    types: [{ value: 'scenografia', label: 'Scenografia', icon: '🎭' }],
  },
  {
    value: 'elettrico',
    label: 'Elettrico',
    icon: '⚡',
    color: 'bg-amber-500',
    dot: '#f59e0b',
    types: [
      { value: 'macchina_fumo', label: 'Macchina del fumo', icon: '💨' },
      { value: 'apparecchiatura', label: 'Apparecchiatura', icon: '🔌' },
      { value: 'punto_alimentazione', label: 'Punto di alimentazione', icon: '⚡', hasQuantity: true },
      { value: 'altra_utenza', label: 'Altra utenza', icon: '⚡' },
    ],
  },
  {
    value: 'audio',
    label: 'Audio',
    icon: '🔊',
    color: 'bg-sky-600',
    dot: '#0284c7',
    types: [{ value: 'cassa', label: 'Cassa', icon: '🔊' }],
  },
  {
    value: 'luci',
    label: 'Luci',
    icon: '💡',
    color: 'bg-emerald-600',
    dot: '#059669',
    types: [
      { value: 'faretto', label: 'Faretto', icon: '💡' },
      { value: 'strip_led', label: 'Strip LED', icon: '〰️' },
      { value: 'punto_luce', label: 'Punto luce', icon: '🔆' },
      { value: 'altra_luce', label: 'Altra luce', icon: '💡' },
    ],
  },
]

export function getCategoryDef(category: Category): CategoryDef {
  return CATEGORY_DEFS.find((c) => c.value === category)!
}

export function getTypeDef(category: Category, type: string): ElementTypeDef | undefined {
  return getCategoryDef(category).types.find((t) => t.value === type)
}

export function getTypeIcon(category: Category, type: string): string {
  return getTypeDef(category, type)?.icon ?? getCategoryDef(category).icon
}
