import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import './Layout.css'

export function Layout() {
  return (
    <div className="layout">
      <Sidebar />
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  )
}
