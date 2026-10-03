import { Footer } from './components/Footer'
import { Hero } from './components/Hero'
import { NavBar } from './components/NavBar'
import { sections } from './data/sections'

export default function App() {
  return (
    <div style={{ background: 'var(--color-bg)', minHeight: '100vh' }}>
      <div className={'noise'}/>
      <NavBar/>
      <Hero/>
      {sections.map((item) => <item.Section key={item.id}/>)}
      <Footer/>
    </div>
  )
}
