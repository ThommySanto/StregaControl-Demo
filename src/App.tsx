import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { isSupabaseConfigured } from '@/db/supabaseClient'
import DashboardPage from '@/editions/DashboardPage'
import MapPage from '@/map/MapPage'
import ConfigErrorScreen from '@/ui/ConfigErrorScreen'

export const APP_NAME = 'StregaControl-Demo'

export default function App() {
  if (!isSupabaseConfigured) {
    return <ConfigErrorScreen />
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Navigate to="/" replace />} />
        <Route path="/" element={<DashboardPage />} />
        <Route path="/mappa" element={<MapPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
