import { seedData } from './seedData'

type LocalDatabase = ReturnType<typeof seedData>

const STORAGE_KEY = 'strega-control-db'
const LEGACY_STORAGE_KEY = 'demo_db'

function readDatabase(): LocalDatabase {
  const stored = localStorage.getItem(STORAGE_KEY) ?? localStorage.getItem(LEGACY_STORAGE_KEY)
  if (stored) return JSON.parse(stored) as LocalDatabase

  const initial = seedData()
  localStorage.setItem(STORAGE_KEY, JSON.stringify(initial))
  return initial
}

function writeDatabase(database: LocalDatabase) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(database))
}

function createId() {
  return crypto.randomUUID()
}

export async function listRows<T>(table: keyof LocalDatabase, filters: Record<string, unknown> = {}) {
  const database = readDatabase()
  const rows = (database[table] as unknown as T[]).filter((row) =>
    Object.entries(filters).every(([column, value]) => (row as Record<string, unknown>)[column] === value),
  )
  return rows
}

export async function getRow<T>(table: keyof LocalDatabase, filters: Record<string, unknown>) {
  const rows = await listRows<T>(table, filters)
  return rows[0] ?? null
}

export async function insertRow<T extends Record<string, unknown>>(
  table: keyof LocalDatabase,
  values: T,
) {
  const database = readDatabase()
  const row = {
    id: createId(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    ...values,
  } as T
  ;(database[table] as unknown as T[]).push(row)
  writeDatabase(database)
  return row
}

export async function updateRow<T extends Record<string, unknown>>(
  table: keyof LocalDatabase,
  id: string,
  patch: Partial<T>,
) {
  const database = readDatabase()
  const rows = database[table] as unknown as T[]
  const index = rows.findIndex((row) => row.id === id)
  if (index < 0) return null

  rows[index] = { ...rows[index], ...patch, updated_at: new Date().toISOString() }
  writeDatabase(database)
  return rows[index]
}

export async function deleteRow(table: keyof LocalDatabase, id: string) {
  const database = readDatabase()
  const rows = database[table] as unknown as Array<{ id: string }>
  const nextRows = rows.filter((row) => row.id !== id)
  if (nextRows.length === rows.length) return false

  database[table] = nextRows as never
  writeDatabase(database)
  return true
}