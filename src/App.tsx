import { About } from './components/About'
import { Backdrop } from './components/Backdrop'
import { Contact } from './components/Contact'
import { Experience } from './components/Experience'
import { Footer } from './components/Footer'
import { Hero } from './components/Hero'
import { NavBar } from './components/NavBar'
import { Skills } from './components/Skills'
import { useTranslation } from './i18n/i18n'

export default function App() {
  const { t } = useTranslation()

  return (
    <>
      <a href="#main" className="skip-link">
        {t('ui.skip')}
      </a>
      <Backdrop />
      <NavBar />

      <main id="main" tabIndex={-1} className="relative outline-none">
        <Hero />
        <About />
        <Experience />
        <Skills />
        <Contact />
      </main>

      <Footer />
    </>
  )
}
