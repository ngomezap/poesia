import './App.css'
import { useEffect, useState } from 'react'
import { poems as fallbackPoems, type Poem, type PoemType } from './data/poems'

const POEMS_API_URL = '/api/poems'

type ApiPoem = {
  slug: string
  title: string
  body: string
  type: PoemType
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
    type: apiPoem.type,
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

function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function App() {
  const [poems, setPoems] = useState<Poem[]>(fallbackPoems)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

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

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const cleanTitle = title.trim()
    const cleanBody = body.trim()

    if (!cleanTitle || !cleanBody) {
      setSubmitError('Titulo y poema son obligatorios.')
      return
    }

    const baseSlug = slugify(cleanTitle) || 'poema'
    const slug = `${baseSlug}-${Date.now()}`

    try {
      setIsSubmitting(true)
      setSubmitError(null)

      const response = await fetch(POEMS_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          slug,
          title: cleanTitle,
          body: cleanBody,
        }),
      })

      if (!response.ok) {
        throw new Error(`La API devolvio ${response.status}`)
      }

      const newPoem: Poem = {
        type: 'poem',
        title: cleanTitle,
        lines: cleanBody
          .split(/\r?\n/)
          .map((line) => line.trim())
          .filter((line) => line.length > 0),
      }

      setPoems((prev) => [newPoem, ...prev])
      setTitle('')
      setBody('')
      setIsModalOpen(false)
    } catch {
      setSubmitError('No se pudo guardar el poema en la API.')
    } finally {
      setIsSubmitting(false)
    }
  }

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

      <button
        className="upload-button"
        type="button"
        onClick={() => setIsModalOpen(true)}
      >
        Cargar poema
      </button>

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

      {isModalOpen && (
        <div className="modal-overlay" role="presentation" onClick={() => setIsModalOpen(false)}>
          <section
            className="poem-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="poem-modal-title"
            onClick={(event) => event.stopPropagation()}
          >
            <header className="poem-modal__header">
              <h2 id="poem-modal-title">Subir poema</h2>
              <button
                type="button"
                className="modal-close"
                onClick={() => setIsModalOpen(false)}
                aria-label="Cerrar modal"
              >
                ×
              </button>
            </header>

            <form className="poem-form" onSubmit={handleSubmit}>
              <label htmlFor="poem-title">Titulo</label>
              <input
                id="poem-title"
                name="title"
                type="text"
                placeholder="Ej: Niebla de enero"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
              />

              <label htmlFor="poem-body">Poema</label>
              <textarea
                id="poem-body"
                name="body"
                rows={7}
                placeholder="Escribe aqui tus versos"
                value={body}
                onChange={(event) => setBody(event.target.value)}
              />

              {submitError && <p className="intro">{submitError}</p>}

              <button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Guardando...' : 'Guardar'}
              </button>
            </form>
          </section>
        </div>
      )}

      <footer className="page-footer">Santander, palabras entre la bruma y la montaña.</footer>
    </main>
  )
}

export default App
