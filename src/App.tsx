import './App.css'
import { poems } from './data/poems'

function App() {
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

      <section className="poem-list" aria-label="Listado de poesias">
        {poems.map((poem) => (
          <article className="poem-card" key={poem.title}>
            <h2>{poem.title}</h2>
            <div className="poem-lines">
              {poem.lines.map((line, index) => (
                <p key={`${poem.title}-${index}`}>{line}</p>
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
