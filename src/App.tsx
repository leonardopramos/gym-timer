import { useState } from 'react'
import './App.css'
import { RestTimer } from './components/RestTimer'

type Mode = 'menu' | 'musculacao' | 'luta'

function App() {
  const [mode, setMode] = useState<Mode>('menu')

  const goHome = () => setMode('menu')

  return (
    <main className="page">
      <header className="heading">
        <p className="eyebrow">Gym timer</p>
        {mode === 'menu' && <h1>Escolha o treino</h1>}
        {mode === 'musculacao' && <h1>Descanso</h1>}
        {mode === 'luta' && <h1>Timer de luta</h1>}
        <p className="subtitle">
          {mode === 'menu'
            ? 'Selecione a modalidade para abrir o cronômetro.'
            : 'Defina o tempo de descanso e inicie o cronômetro.'}
        </p>
      </header>

      {mode === 'menu' && (
        <section className="card menu-grid" aria-label="Escolher modalidade">
          <button className="mode-tile" onClick={() => setMode('musculacao')}>
            <span className="emoji" aria-hidden="true">
              🏋️‍♂️
            </span>
            <span className="tile-title">Musculação</span>
          </button>
          <button className="mode-tile" onClick={() => setMode('luta')}>
            <span className="emoji" aria-hidden="true">
              🥊
            </span>
            <span className="tile-title">Luta</span>
          </button>
        </section>
      )}

      {mode === 'musculacao' && <RestTimer />}

      {mode === 'luta' && (
        <section className="card placeholder">
          <p className="coming-soon">Timer de boxe em breve 👀</p>
        </section>
      )}

      {mode !== 'menu' && (
        <div className="actions sticky-actions">
          <button className="btn ghost" onClick={goHome}>
            Voltar
          </button>
        </div>
      )}
    </main>
  )
}

export default App
