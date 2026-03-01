import './App.css'
import { useEffect, useState } from 'react'
import { poems as fallbackPoems, type Poem } from './data/poems'

const POEMS_API_URL = 'https://honoratorainbows.igomez-ap.workers.dev/api/poems'

type ApiPoem = {
  slug: string
  title: string
  body: string
  created_at: string
}

function isApiPoem(value: unknown): value is ApiPoem {
  if (!value || typeof value !== 'object') return false
  const poem = value as Partial<ApiPoem>
  return (
    typeof poem.slug === 'string' &&
    typeof poem.title === 'string' &&
    typeof poem.body === 'string' &&
    typeof poem.created_at === 'string'
  )
}

function toPoem(apiPoem: ApiPoem): Poem {
  const lines = apiPoem.body
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0)

  return {
    type: 'poem',
    title: apiPoem.title,
    lines: lines.length > 0 ? lines : [apiPoem.body],
  }
}

function normalizePoems(payload: unknown): Poem[] {
  if (Array.isArray(payload)) {
    return payload.filter(isApiPoem).map(toPoem)
  }

  if (payload && typeof payload === 'object') {
    const data = (payload as { poems?: unknown }).poems
    if (Array.isArray(data)) {
      return data.filter(isApiPoem).map(toPoem)
    }
  }

  return []
}

function App() {
  const [poems, setPoems] = useState<Poem[]>(fallbackPoems)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const controller = new AbortController()

    async function loadPoems() {
      try {
        setIsLoading(true)
        setError(null)

        const response = await fetch(POEMS_API_URL, { signal: controller.signal })
        if (!response.ok) {
          throw new Error(`La API devolvio ${response.status}`)
        }

        const payload = (await response.json()) as unknown
        const normalized = normalizePoems(payload)
        if (normalized.length === 0) {
          throw new Error('La API no devolvio poemas validos')
        }

        setPoems(normalized)
      } catch (err) {
        if ((err as DOMException).name !== 'AbortError') {
          setError('No se pudo cargar la API, mostrando poemas locales.')
          setPoems(fallbackPoems)
        }
      } finally {
        setIsLoading(false)
      }
    }

    void loadPoems()

    return () => controller.abort()
  }, [])

  return (
    <main className="poetry-page">
      <header className="hero">
        <p className="eyebrow">Cuaderno digital</p>
        <h1>Honorato Rainbows</h1>
        <p className="intro">
          Un espacio mínimo para versos breves. Borradores, piezas terminadas y
          notas que aun respiran.
        </p>
      </header>

      {isLoading && <p className="intro">Cargando poemas desde la API...</p>}
      {error && !isLoading && <p className="intro">{error}</p>}

      <section className="poem-list" aria-label="Listado de poesias">
        {poems.map((poem, poemIndex) => (
          <article className={`poem-card ${poem.type === 'quote' ? 'quote-card' : 'poem-card--poem'}`} key={`${poem.type}-${poem.title ?? poemIndex}`}>
            {poem.type === 'poem' && poem.title && <h2>{poem.title}</h2>}
            <div className="poem-lines">
              {poem.lines.map((line, index) => (
                <p key={`${poem.type}-${poem.title ?? poemIndex}-${index}`}>{line}</p>
              ))}
            </div>
          </article>
        ))}
      </section>

      <footer className="page-footer">Santander, palabras entre la bruma y la montaña.</footer>
    </main>
  )
}

export default App
