import { NavLink, useLocation } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { siteConfig } from '../../config/site'
import { navConfig } from '../../config/navigation'
import './Sidebar.css'

function GithubIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
      className="github-icon"
    >
      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
    </svg>
  )
}

function HamburgerIcon({ open }: { open: boolean }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      {open ? (
        <path d="M18 6L6 18M6 6l12 12" />
      ) : (
        <>
          <path d="M3 12h18M3 6h18M3 18h18" />
        </>
      )}
    </svg>
  )
}

export function Sidebar() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const location = useLocation()

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 768px)')
    const handler = () => setIsMobile(mq.matches)
    setIsMobile(mq.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) =>
      e.key === 'Escape' && setMobileOpen(false)
    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [])

  const navContent = (
    <nav className="sidebar-nav">
      {navConfig.map((category) => (
        <div key={category.label} className="nav-category">
          <span className="nav-category-label">{category.label}</span>
          <ul className="nav-items">
            {category.items.map((item) => (
              <li key={item.path}>
                <NavLink
                  to={item.path ? `/${item.path}` : '/'}
                  className={({ isActive }) => {
                    const active =
                      isActive ||
                      (item.children?.some(
                        (c) => location.pathname === `/${c.path}`
                      ) ?? false)
                    return `nav-link ${active ? 'active' : ''}`
                  }}
                  onClick={() => setMobileOpen(false)}
                >
                  {item.label}
                </NavLink>
                {item.children && item.children.length > 0 && (
                  <ul className="nav-items nav-sub-items">
                    {item.children.map((child) => (
                      <li key={child.path}>
                        <NavLink
                          to={`/${child.path}`}
                          className={({ isActive }) => {
                            const childActive =
                              isActive ||
                              (child.children?.some(
                                (c) => location.pathname === `/${c.path}`
                              ) ?? false)
                            return `nav-link nav-sub-link ${childActive ? 'active' : ''}`
                          }}
                          onClick={() => setMobileOpen(false)}
                        >
                          {child.label}
                        </NavLink>
                        {child.children && child.children.length > 0 && (
                          <ul className="nav-items nav-sub-items">
                            {child.children.map((sub) => (
                              <li key={sub.path}>
                                <NavLink
                                  to={`/${sub.path}`}
                                  className={({ isActive }) =>
                                    `nav-link nav-sub-link ${isActive ? 'active' : ''}`
                                  }
                                  onClick={() => setMobileOpen(false)}
                                >
                                  {sub.label}
                                </NavLink>
                              </li>
                            ))}
                          </ul>
                        )}
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
          </ul>
        </div>
      ))}
      <a
        href={siteConfig.githubUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="github-link"
        aria-label="View on GitHub"
      >
        <GithubIcon />
        <span>Repository</span>
      </a>
    </nav>
  )

  return (
    <>
      <button
        type="button"
        className="hamburger-btn"
        aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
        aria-expanded={mobileOpen}
        onClick={() => setMobileOpen(!mobileOpen)}
      >
        <HamburgerIcon open={mobileOpen} />
      </button>
      <div
        className={`sidebar-overlay ${mobileOpen ? 'open' : ''}`}
        onClick={() => setMobileOpen(false)}
        aria-hidden={!mobileOpen}
      />
      <aside
        className={`sidebar ${mobileOpen ? 'mobile-open' : ''}`}
        aria-hidden={isMobile && !mobileOpen}
      >
        <div className="sidebar-header">
          <span className="sidebar-title">{siteConfig.title}</span>
        </div>
        {navContent}
      </aside>
    </>
  )
}
