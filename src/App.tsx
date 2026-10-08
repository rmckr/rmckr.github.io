import { Backdrop } from './components/Backdrop'
import { Footer } from './components/Footer'
import { Hero } from './components/Hero'
import { NavBar } from './components/NavBar'
import { Ticker } from './components/Ticker'
import { sections } from './data/sections'

export default function App() {
  return (
    <>
      {/* Fixed ambient layer (horizon grid, glow, cursor spotlight) */}
      <Backdrop/>

      {/* Everything above it, so translucent section backgrounds let it show through */}
      <div className={'relative z-10'}>
        <div className={'noise'} aria-hidden={'true'}/>
        <NavBar/>
        <Hero/>
        <Ticker/>
        {sections.map((item) => <item.Section key={item.id}/>)}
        <Footer/>
      </div>
    </>
  )
}
