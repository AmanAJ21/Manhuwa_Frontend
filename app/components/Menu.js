'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Home() {
  const pathname = usePathname();

  // Helper to check if link is active
  const isActive = (path) => pathname === path;

  return (
    <nav className="nav" role="navigation" aria-label="Primary Navigation">
      <ul className="nav-list">
        <li className="nav-item">
          <Link href="/" className={isActive('/') ? 'active' : ''} aria-current={isActive('/') ? 'page' : undefined}>
            Home
          </Link>
        </li>
        <li className="nav-item">
          <Link href="/AddSite" className={isActive('/AddSite') ? 'active' : ''} aria-current={isActive('/AddSite') ? 'page' : undefined}>
            Add Site
          </Link>
        </li>
        <li className="nav-item">
          <Link href="/AddManhuwa" className={isActive('/AddManhuwa') ? 'active' : ''} aria-current={isActive('/AddManhuwa') ? 'page' : undefined}>
            Add Manhuwa
          </Link>
        </li>
        <li className="nav-item">
          <Link href="/Setting" className={isActive('/Setting') ? 'active' : ''} aria-current={isActive('/Setting') ? 'page' : undefined}>
            Setting
          </Link>
        </li>
      </ul>

      <style jsx>{`
        :root {
          --color-bg:rgb(89, 143, 231);
          --color-text: #f1f5f9;
          --color-primary: #3b82f6;
          --color-hover-bg: rgba(59, 130, 246, 0.1);
          --color-focus-outline: #60a5fa;
        }

        .nav {
          background-color: var(--color-bg);
          padding: 1rem 3rem;
          box-shadow: 0 2px 6px rgba(238, 117, 117, 0.15);
          user-select: none;
        }

        .nav-list {
          display: flex;
          gap: 2.5rem;
          list-style: none;
          margin: 0;
          padding: 0;
          justify-content: center;
          align-items: center;
        }

        .nav-item a {
          color: var(--color-text);
          text-decoration: none;
          font-weight: 600;
          font-size: 1.125rem;
          padding: 0.5rem 0.25rem;
          border-bottom: 3px solid transparent;
          border-radius: 4px;
          transition: 
            color 0.3s ease,
            border-bottom-color 0.3s ease,
            background-color 0.2s ease;
          display: inline-block;
        }

        /* Hover & focus styles */
        .nav-item a:hover,
        .nav-item a:focus-visible {
          color: var(--color-primary);
          border-bottom-color: var(--color-primary);
          background-color: var(--color-hover-bg);
          outline-offset: 4px;
          outline: 2px solid var(--color-focus-outline);
          outline-radius: 4px;
        }

        /* Active link styling */
        .nav-item a.active,
        .nav-item a[aria-current='page'] {
          color: var(--color-primary);
          border-bottom-color: var(--color-primary);
          font-weight: 700;
        }

        /* Responsive: stack vertically on small screens */
        @media (max-width: 600px) {
          .nav {
            padding: 1rem 1.5rem;
          }

          .nav-list {
            flex-direction: column;
            gap: 1.25rem;
          }

          .nav-item a {
            font-size: 1rem;
            padding: 0.5rem 0.5rem;
            text-align: center;
          }
        }
      `}</style>
    </nav>
  );
}
