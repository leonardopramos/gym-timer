import { useMemo, useState } from 'react'

type PlanKey = 'A' | 'B' | 'C' | 'D'
type Exercise = { name: string; sets: number }

const planText: Record<PlanKey, string[]> = {
  A: [
    'Rotação de ombros com elástico - 1x50"',
    'Mobilidade escapular na puxada - 1x50"',
    'Alongamento do peitoral no espaldar - 1x50"',
    'Supino reto na barra - 1x20 (aquecimento)',
    'Supino reto na barra - 3x10',
    'Supino inclinado no smith - 3x10',
    'Voador peitoral - 3x12 + 1x10/10 (dropset)',
    'Elevação lateral na polia média - 3x12',
    'Tríceps testa com halter no banco reto - 3x12',
  ],
  B: [
    'Rotação de ombros com elástico - 1x50"',
    'Mobilidade escapular na puxada - 1x50"',
    'Alongamento do peitoral no espaldar - 1x50"',
    'Remada articulada neutra unilateral - 1x15 (aquecimento)',
    'Remada articulada neutra unilateral - 3x12',
    'Puxada aberta - 3x12 (isometria 2")',
    'Remada baixa pronada - 3x10',
    'Crucifixo inverso com halter - 3x12',
    'Rosca direta com halter - 3x12',
  ],
  C: [
    'Alongamento do posterior de coxas - 1x50"',
    'Mobilidade de quadril em 2 apoios - 1x50"',
    'Alongamento de quadríceps - 1x50"',
    'Agachamento livre - 1x20 (aquecimento)',
    'Agachamento livre - 3x10',
    'Leg press - 3x12',
    'Afundo búlgaro no smith - 3x10',
    'Stiff com halter - 3x10',
    'Mesa flexora - 3x12',
  ],
  D: [
    'Rotação de ombros com elástico - 1x50"',
    'Mobilidade escapular na puxada - 1x50"',
    'Alongamento do peitoral no espaldar - 1x50"',
    'Elevação lateral com halter sentado - 1x15 (aquecimento)',
    'Elevação lateral com halter sentado - 3x12',
    'Elevação lateral na polia média - 3x10',
    'Desenvolvimento na máquina - 3x12',
    'Tríceps francês na polia com corda - 3x12',
    'Rosca martelo com halter - 3x12',
  ],
}

function parseExercises(list: string[]): Exercise[] {
  return list.map((item) => {
    const match = item.match(/(\d+)\s*x\s*(\d+)/i)
    const sets = match ? Number(match[1]) : 1
    return { name: item, sets: Math.max(1, sets) }
  })
}

export function TrainingRunner() {
  const [selectedPlan, setSelectedPlan] = useState<PlanKey | null>(null)
  const [started, setStarted] = useState(false)
  const [finished, setFinished] = useState(false)
  const [exerciseIdx, setExerciseIdx] = useState(0)
  const [setIdx, setSetIdx] = useState(0)

  const currentExercises = useMemo(
    () => (selectedPlan ? parseExercises(planText[selectedPlan]) : []),
    [selectedPlan],
  )

  const currentExercise = currentExercises[exerciseIdx]
  const totalExercises = currentExercises.length
  const totalSetsInPlan = useMemo(
    () => currentExercises.reduce((acc, ex) => acc + ex.sets, 0),
    [currentExercises],
  )

  const start = () => {
    if (!selectedPlan) return
    setStarted(true)
    setFinished(false)
    setExerciseIdx(0)
    setSetIdx(0)
  }

  const next = () => {
    if (!started || finished || !currentExercise) return
    if (setIdx + 1 < currentExercise.sets) {
      setSetIdx((s) => s + 1)
      return
    }
    if (exerciseIdx + 1 < totalExercises) {
      setExerciseIdx((i) => i + 1)
      setSetIdx(0)
      return
    }
    setFinished(true)
  }

  const reset = () => {
    setStarted(false)
    setFinished(false)
    setExerciseIdx(0)
    setSetIdx(0)
  }

  const progressText = selectedPlan
    ? `Exercício ${finished ? totalExercises : exerciseIdx + 1} de ${totalExercises}`
    : 'Escolha um treino'

  const setProgress =
    currentExercise && !finished
      ? `Série ${setIdx + 1} de ${currentExercise.sets}`
      : finished
        ? 'Todas as séries concluídas'
        : 'Aguardando início'

  const ctaLabel = finished
    ? 'Fazer novamente'
    : currentExercise && setIdx + 1 < currentExercise.sets
      ? 'Próxima série'
      : exerciseIdx + 1 < totalExercises
        ? 'Próximo exercício'
        : 'Concluir treino'

  return (
    <section className="card training-runner">
      <div className="runner-grid">
        <div className="runner-left">
          <p className="field-label" style={{ marginBottom: 6 }}>
            Selecione o treino
          </p>
          <div className="chips vertical">
            {(['A', 'B', 'C', 'D'] as PlanKey[]).map((plan) => (
              <button
                key={plan}
                className={`chip ${selectedPlan === plan ? 'active' : ''}`}
                onClick={() => {
                  setSelectedPlan(plan)
                  reset()
                }}
                aria-pressed={selectedPlan === plan}
              >
                Treino {plan}
              </button>
            ))}
          </div>
        </div>

        <div className="runner-right">
          {selectedPlan && started && (
            <div className="exercise-box">
              <h3 className="exercise-title">{currentExercise?.name}</h3>
              <p className="subtitle" style={{ marginTop: 4 }}>{setProgress}</p>
            </div>
          )}

          {!started && selectedPlan && (
            <p className="subtitle" style={{ marginTop: 6 }}>
              {totalExercises} exercícios · {totalSetsInPlan} séries — aperte Iniciar para começar.
            </p>
          )}
        </div>
      </div>

      <div className="exercise-view">
        {!started && (
          <button
            className="btn primary full-width"
            onClick={start}
            disabled={!selectedPlan}
            aria-disabled={!selectedPlan}
          >
            Iniciar
          </button>
        )}
        {started && !finished && currentExercise && (
          <button className="btn primary full-width" onClick={next}>
            {ctaLabel}
          </button>
        )}
        {finished && (
          <div className="finished-box">
            <span className="progress-badge done">Treino concluído</span>
            <p className="subtitle" style={{ marginTop: 6 }}>
              Boa! Você finalizou o Treino {selectedPlan}.
            </p>
            <button className="btn" onClick={reset}>
              {ctaLabel}
            </button>
          </div>
        )}
      </div>
    </section>
  )
}
