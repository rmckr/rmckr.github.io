import { Backdrop } from './components/Backdrop'
import { Footer } from './components/Footer'
import { Hero } from './components/Hero'
import { NavBar } from './components/NavBar'
import { sections } from './data/sections'
import { useSmoothScroll } from './hooks/useSmoothScroll'

export default function App() {
  // Lenis wheel smoothing + proximity snap on every section except the hero
  useSmoothScroll()

  return (
    <>
      {/* Fixed ambient layer (horizon grid, glow, cursor spotlight) */}
      <Backdrop />

      {/* Everything above it, so the transparent pages let it show through */}
      <div className={'relative z-10'}>
        <div className={'noise'} aria-hidden={'true'} />
        <NavBar />
        <Hero />
        {/* Plain sections; the hero's dissolve hands off into the first one
            via #hero + section in index.css */}
        {sections.map((item) => (
          <item.Section key={item.id} />
        ))}
        <Footer />
      </div>
    </>
  )
}
