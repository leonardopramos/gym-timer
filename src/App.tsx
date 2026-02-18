import './App.css'
import { RestTimer } from './components/RestTimer'

function App() {
  return (
    <main className="page">
      <header className="heading">
        <p className="eyebrow">Gym timer</p>
        <h1>Descanso1234 </h1>
        <p className="subtitle">Defina o tempo de descanso e inicie o cronômetro.</p>
      </header>

      <RestTimer />
    </main>
  )
}

export default App
