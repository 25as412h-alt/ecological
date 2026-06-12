import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Toaster } from 'sonner'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { AppLayout } from '@/components/AppLayout'
import { MapPage } from '@/pages/MapPage'
import { RecordListPage } from '@/pages/RecordListPage'
import { RecordFormPage } from '@/pages/RecordFormPage'
import { RecordDetailPage } from '@/pages/RecordDetailPage'

export default function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <AppLayout>
          <Routes>
            <Route path="/" element={<MapPage />} />
            <Route path="/records" element={<RecordListPage />} />
            <Route path="/records/new" element={<RecordFormPage />} />
            <Route path="/records/:id" element={<RecordDetailPage />} />
            <Route path="/records/:id/edit" element={<RecordFormPage />} />
          </Routes>
        </AppLayout>
        <Toaster position="top-center" richColors />
      </BrowserRouter>
    </ErrorBoundary>
  )
}
