import { NavLink, Route, Routes } from 'react-router-dom'
import Start from './screens/Start'
import Themen from './screens/Themen'
import Quiz from './screens/Quiz'
import Statistik from './screens/Statistik'
import Einstellungen from './screens/Einstellungen'

export default function App() {
  return (
    <div className="app">
      <main className="inhalt">
        <Routes>
          <Route path="/" element={<Start />} />
          <Route path="/themen" element={<Themen />} />
          <Route path="/quiz" element={<Quiz />} />
          <Route path="/statistik" element={<Statistik />} />
          <Route path="/einstellungen" element={<Einstellungen />} />
        </Routes>
      </main>
      <nav className="tabbar">
        <NavLink to="/" end>
          Start
        </NavLink>
        <NavLink to="/themen">Themen</NavLink>
        <NavLink to="/statistik">Statistik</NavLink>
        <NavLink to="/einstellungen">Einstellungen</NavLink>
      </nav>
    </div>
  )
}
