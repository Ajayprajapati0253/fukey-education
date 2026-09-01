import AdminLayout from './layouts/admin/AdminLayout'
import AdminDashboardPage from './features/admin/dashboard/pages/AdminDashboardPage'

function App() {
  return (
    <AdminLayout>
      <AdminDashboardPage />
    </AdminLayout>
  )
}

export default App