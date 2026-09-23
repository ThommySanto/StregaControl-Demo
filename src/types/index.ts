// Tipi condivisi, allineati allo schema del database (vedi README).
// Verranno affinati man mano che implementiamo ogni modulo.

export type Category = 'allestimento' | 'elettrico' | 'audio' | 'luci'

export interface Edition {
  id: string
  name: string
  year: number
  base_map_id: string
  created_at: string
  updated_at: string
}

export interface Zone {
  id: string
  edition_id: string
  name: string
  center_x: number
  center_y: number
  zoom_level: number
}

export interface Poi {
  id: string
  edition_id: string
  zone_id: string | null
  name: string
  icon: string
  description: string | null
  x: number
  y: number
}

export interface MapElement {
  id: string
  edition_id: string
  zone_id: string | null
  category: Category
  type: string
  name: string
  notes: string | null
  x: number
  y: number
  quantity: number | null
  created_at: string
  updated_at: string
}
