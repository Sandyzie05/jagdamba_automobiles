import AdminPage from './AdminPage'
import StorefrontPage from './StorefrontPage'

const adminPathPattern = /(?:^|\/)admin(?:\.html)?$/i

export default function App() {
  const normalizedPath = window.location.pathname.replace(/\/+$/, '') || '/'
  const isAdminPage = adminPathPattern.test(normalizedPath)

  return isAdminPage ? <AdminPage /> : <StorefrontPage />
}
