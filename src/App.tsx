import { HashRouter, Routes, Route, Navigate } from 'react-router-dom'
import DashboardPage from '@/editions/DashboardPage'
import MapPage from '@/map/MapPage'

export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/mappa" element={<MapPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </HashRouter>
  )
}
