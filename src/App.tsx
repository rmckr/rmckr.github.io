import type { RouteRecord } from 'vite-react-ssg'
import { About } from './components/About'
import { Contact } from './components/Contact'
import { Experience } from './components/Experience'
import { Footer } from './components/Footer'
import { GitHub } from './components/GitHub'
import { Hero } from './components/Hero'
import { NavBar } from './components/NavBar'
import { NotFound } from './components/NotFound'
import { Projects } from './components/Projects'
import { Skills } from './components/Skills'
import { useSmoothScroll } from './hooks/useSmoothScroll'
import { useTranslation } from './i18n/i18n'

function Home() {
  const { t } = useTranslation()

  // The page is one scroll: the wheel is smoothed, and links that ask for it
  // ride to their section instead of jumping.
  useSmoothScroll()

  return (
    <>
      <a href="#main" className="skip-link label">
        {t('ui.skip')}
      </a>
      <NavBar />

      <main id="main" tabIndex={-1} className="relative outline-none">
        <Hero />
        <Projects />
        <About />
        <Experience />
        <Skills />
        <GitHub />
        <Contact />
      </main>

      <Footer />
    </>
  )
}

// The build writes the /404 route to `dist/404.html`, which is what GitHub
// Pages serves for an unknown path; `*` is the same view when the app boots on
// a wrong URL that still points at that document.
export const routes: RouteRecord[] = [
  { path: '/', element: <Home /> },
  { path: '/404', element: <NotFound /> },
  { path: '*', element: <NotFound /> }
]
