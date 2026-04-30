import { useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'
import producerPhoto from '/img/vark.png'
import directorPhoto from '/img/argot.png'
import './App.css'

gsap.registerPlugin(ScrollTrigger, useGSAP)

function App() {
  const root = useRef<HTMLDivElement | null>(null)
  const heroRef = useRef<HTMLElement | null>(null)
  const producerRef = useRef<HTMLImageElement | null>(null)
  const directorRef = useRef<HTMLImageElement | null>(null)

  useGSAP(
    () => {
      const mm = gsap.matchMedia()

      mm.add(
        {
          reduceMotion: '(prefers-reduced-motion: reduce)',
        },
        (context) => {
          const { reduceMotion } = context.conditions as {
            reduceMotion: boolean
          }

          if (reduceMotion) {
            gsap.set('.reveal', { autoAlpha: 1, y: 0 })
            return
          }

          gsap.set('.reveal', { autoAlpha: 0, y: 24 })

          const images = [producerRef.current, directorRef.current].filter(
            Boolean,
          )

          if (images.length) {
            gsap.set(images, { scale: 1, transformOrigin: 'center' })
            gsap.to(images, {
              scale: 1.15,
              ease: 'none',
              scrollTrigger: {
                trigger: heroRef.current,
                start: 'top bottom',
                end: 'bottom top',
                scrub: 0.6,
                invalidateOnRefresh: true,
              },
            })
          }

          ScrollTrigger.batch('.reveal', {
            start: 'top 85%',
            end: 'bottom 15%',
            onEnter: (batch) =>
              gsap.to(batch, {
                autoAlpha: 1,
                y: 0,
                duration: 0.9,
                ease: 'power3.out',
                stagger: 0.12,
                overwrite: true,
              }),
            onLeaveBack: (batch) =>
              gsap.set(batch, {
                autoAlpha: 0,
                y: 24,
                overwrite: true,
              }),
          })

          ScrollTrigger.refresh()
        },
      )

      return () => mm.revert()
    },
    { scope: root },
  )

  return (
    <div className="page" ref={root}>
      <header className="site-header">
        <div className="brand">
          <span className="brand-mark" aria-hidden="true"></span>
          MAGMA
        </div>
        <nav className="nav">
          <a href="#inicio">Inicio</a>
          <a href="#catalogo">Catalogo</a>
          <a href="#nosotros">Nosotros</a>
          <a href="#contacto">Contactanos</a>
          <a href="#acceso">Login</a>
        </nav>
        <div className="header-actions">
          <button type="button" className="btn ghost">
            Login
          </button>
          <button type="button" className="btn primary">
            Register
          </button>
        </div>
      </header>

      <main>
        <section id="inicio" className="hero" ref={heroRef}>
          <div className="hero-copy">
            <p className="eyebrow reveal">Magma Studio</p>
            <h1 className="hero-title reveal">
              Empieza con nosotros.
            </h1>
            <p className="lead reveal">
              Estudio para musica y video. Grabamos, mezclamos y
              dirigimos tu idea. Haz tu idea una musica con videoclip.
            </p>
            <div className="hero-actions reveal">
              <button type="button" className="btn primary">
                Reservar estudio
              </button>
              <button type="button" className="btn ghost">
                Ver catalogo
              </button>
            </div>
            <div className="hero-metrics reveal">
              <div>
                <span className="metric-number">+2000</span>
                <span className="metric-label">visitas a la pagina</span>
              </div>
              <div>
                <span className="metric-number">4K</span>
                <span className="metric-label">Video y color</span>
              </div>
              <div>
                <span className="metric-number">+5</span>
                <span className="metric-label">Años de experiencia</span>
              </div>
            </div>
            <div className="signal-line" aria-hidden="true"></div>
          </div>
          <div className="hero-visual">
            <div className="image-row">
              <div className="image-container">
                <img
                  ref={producerRef}
                  src={producerPhoto}
                  alt="Productor musical en estudio"
                  loading="lazy"
                />
                <p className="image-label">Productor musical</p>
              </div>
              <div className="image-container">
                <img
                  ref={directorRef}
                  src={directorPhoto}
                  alt="Director de video en set"
                  loading="lazy"
                />
                <p className="image-label">Director de video</p>
              </div>
            </div>
            
          </div>
        </section>

        <section id="catalogo" className="section plans">
          <div className="section-header reveal">
            <p className="eyebrow">Planes Magma</p>
            <h2>Planes claros para video, musica y combos</h2>
            <p>
              Planes claros para video, musica y combos listos para artistas
              que quieren verse y sonar pro.
            </p>
          </div>

          <div className="plan-category">
            <div className="plan-category-header reveal">
              <p className="category-kicker">Categoria</p>
              <h3>Video</h3>
            </div>
            <div className="plan-grid">
              <article className="plan-card reveal">
                <div className="plan-tags">
                  <span className="plan-pill accent">Video</span>
                  <span className="plan-pill">Simple</span>
                </div>
                <h4>Video Simple</h4>
                <p className="plan-desc">SIMPLE</p>
                <div className="plan-price">
                  <span className="plan-currency">Bs</span>
                  <span className="plan-amount">350</span>
                </div>
                <p className="plan-note">Pago unico por proyecto</p>
                <ul className="plan-features">
                  <li>
                    <span className="plan-check">✓</span>3 escenas.
                  </li>
                  <li>
                    <span className="plan-check">✓</span>Tomas simples y
                    directas.
                  </li>
                  <li>
                    <span className="plan-check">✓</span>Edicion basica.
                  </li>
                  <li>
                    <span className="plan-check">✓</span>Entrega lista para
                    redes sociales.
                  </li>
                </ul>
                <button type="button" className="btn ghost">
                  Mas informacion
                </button>
              </article>
              <article className="plan-card highlight reveal">
                <div className="plan-tags">
                  <span className="plan-pill accent">Video</span>
                  <span className="plan-pill">Estandar</span>
                </div>
                <h4>Video Estandar</h4>
                <p className="plan-desc">Mas presencia visual</p>
                <div className="plan-price">
                  <span className="plan-currency">Bs</span>
                  <span className="plan-amount">550</span>
                </div>
                <p className="plan-note">Pago unico por proyecto</p>
                <ul className="plan-features">
                  <li>
                    <span className="plan-check">✓</span>5 escenas.
                  </li>
                  <li>
                    <span className="plan-check">✓</span>Mejor ritmo visual.
                  </li>
                  <li>
                    <span className="plan-check">✓</span>Edicion con mayor
                    detalle.
                  </li>
                  <li>
                    <span className="plan-check">✓</span>Entrega lista para
                    redes sociales.
                  </li>
                </ul>
                <button type="button" className="btn primary">
                  Reservar este plan
                </button>
              </article>
            </div>
          </div>

          <div className="plan-category">
            <div className="plan-category-header reveal">
              <p className="category-kicker">Categoria</p>
              <h3>Musica e instrumental</h3>
            </div>
            <div className="plan-grid">
              <article className="plan-card reveal">
                <div className="plan-tags">
                  <span className="plan-pill mint">Musica</span>
                  <span className="plan-pill">Simple</span>
                </div>
                <h4>Musica Simple</h4>
                <p className="plan-desc">1 sesion con beat del artista</p>
                <div className="plan-price">
                  <span className="plan-currency">Bs</span>
                  <span className="plan-amount">199</span>
                </div>
                <p className="plan-note">Pago unico por proyecto</p>
                <ul className="plan-features">
                  <li>
                    <span className="plan-check">✓</span>1 sesion de
                    grabacion.
                  </li>
                  <li>
                    <span className="plan-check">✓</span>Produccion sobre beat
                    del artista.
                  </li>
                  <li>
                    <span className="plan-check">✓</span>Guia artistica
                    basica.
                  </li>
                  <li>
                    <span className="plan-check">✓</span>Entrega limpia del
                    proyecto.
                  </li>
                </ul>
                <button type="button" className="btn ghost">
                  Reservar este plan
                </button>
              </article>
              <article className="plan-card reveal">
                <div className="plan-tags">
                  <span className="plan-pill mint">Instrumental</span>
                  <span className="plan-pill">Personalizado</span>
                </div>
                <h4>Instrumental Personalizado</h4>
                <p className="plan-desc">Beat personalizado</p>
                <p className="plan-kicker">Desde</p>
                <div className="plan-price">
                  <span className="plan-currency">Bs</span>
                  <span className="plan-amount">99</span>
                </div>
                <p className="plan-note">Pago unico por proyecto</p>
                <ul className="plan-features">
                  <li>
                    <span className="plan-check">✓</span>1 sesion de
                    grabacion.
                  </li>
                  <li>
                    <span className="plan-check">✓</span>Beat personalizado.
                  </li>
                  <li>
                    <span className="plan-check">✓</span>Produccion trabajada.
                  </li>
                  <li>
                    <span className="plan-check">✓</span>Entrega profesional
                    del tema.
                  </li>
                </ul>
                <details className="license-accordion">
                  <summary className="btn ghost plan-toggle">
                    Mas informacion
                  </summary>
                  <div className="license-scroll">
                    <div className="license-table">
                      <div className="license-cell license-head"></div>
                      <div className="license-cell license-head">
                        Basica
                        <span>Bs 99</span>
                      </div>
                      <div className="license-cell license-head">
                        Gold
                        <span>Bs 120</span>
                      </div>
                      <div className="license-cell license-head">
                        Exclusiva
                        <span>Bs 350</span>
                      </div>

                      <div className="license-cell license-feature">
                        Beat personalizado
                      </div>
                      <div className="license-cell">
                        <span className="license-flag yes">✓</span>
                      </div>
                      <div className="license-cell">
                        <span className="license-flag yes">✓</span>
                      </div>
                      <div className="license-cell">
                        <span className="license-flag yes">✓</span>
                      </div>

                      <div className="license-cell license-feature">
                        Uso comercial
                      </div>
                      <div className="license-cell">
                        <span className="license-flag no">X</span>
                      </div>
                      <div className="license-cell">
                        <span className="license-flag yes">✓</span>
                      </div>
                      <div className="license-cell">
                        <span className="license-flag yes">✓</span>
                      </div>

                      <div className="license-cell license-feature">
                        Entrega WAV
                      </div>
                      <div className="license-cell">
                        <span className="license-flag no">X</span>
                      </div>
                      <div className="license-cell">
                        <span className="license-flag no">✓</span>
                      </div>
                      <div className="license-cell">
                        <span className="license-flag yes">✓</span>
                      </div>

                      <div className="license-cell license-feature">
                        Derechos exclusivos
                      </div>
                      <div className="license-cell">
                        <span className="license-flag no">X</span>
                      </div>
                      <div className="license-cell">
                        <span className="license-flag no">X</span>
                      </div>
                      <div className="license-cell">
                        <span className="license-flag yes">✓</span>
                      </div>

                      <div className="license-cell license-feature">
                        Soporte post-venta
                      </div>
                      <div className="license-cell">
                        <span className="license-flag no">X</span>
                      </div>
                      <div className="license-cell">
                        <span className="license-flag no">X</span>
                      </div>
                      <div className="license-cell">
                        <span className="license-flag yes">✓</span>
                      </div>
                    </div>
                  </div>
                </details>
              </article>
            </div>
          </div>

          <div className="plan-category">
            <div className="plan-category-header reveal">
              <p className="category-kicker">Categoria</p>
              <h3>Combos</h3>
            </div>
            <div className="plan-grid">
              <article className="plan-card popular reveal">
                <span className="plan-badge">Mas popular</span>
                <div className="plan-tags">
                  <span className="plan-pill accent">Combo</span>
                </div>
                <h4>Combo Basico</h4>
                <p className="plan-desc">
                  Video basico + produccion con beat del artista.
                </p>
                <div className="plan-price">
                  <span className="plan-currency">Bs</span>
                  <span className="plan-amount">520</span>
                </div>
                <p className="plan-note">Pago unico por proyecto</p>
                <ul className="plan-features">
                  <li>
                    <span className="plan-check">✓</span>Video basico incluido.
                  </li>
                  <li>
                    <span className="plan-check">✓</span>1 sesion de
                    produccion.
                  </li>
                  <li>
                    <span className="plan-check">✓</span>Beat proporcionado por
                    el artista.
                  </li>
                  <li>
                    <span className="plan-check">✓</span>Ideal para lanzamiento
                    rapido.
                  </li>
                </ul>
                <button type="button" className="btn primary">
                  Reservar este plan
                </button>
              </article>
              <article className="plan-card recommended reveal">
                <span className="plan-badge mint">Recomendado</span>
                <div className="plan-tags">
                  <span className="plan-pill accent">Combo</span>
                </div>
                <h4>Combo Estandar</h4>
                <p className="plan-desc">Video estandar + produccion musical.</p>
                <div className="plan-price">
                  <span className="plan-currency">Bs</span>
                  <span className="plan-amount">720</span>
                </div>
                <p className="plan-note">Pago unico por proyecto</p>
                <ul className="plan-features">
                  <li>
                    <span className="plan-check">✓</span>Video estandar incluido.
                  </li>
                  <li>
                    <span className="plan-check">✓</span>Produccion estandar
                    completa.
                  </li>
                  <li>
                    <span className="plan-check">✓</span>Beat proporcionado por el artista.
                  </li>
                  
                  <li>
                    <span className="plan-check">✓</span>Mejor relacion imagen
                    + sonido.
                  </li>
                </ul>
                <button type="button" className="btn primary">
                  Reservar este plan
                </button>
              </article>
            </div>
          </div>
        </section>

        <section id="nosotros" className="section">
          <div className="section-header reveal">
            <p className="eyebrow">Nosotros</p>
            <h2>Sonido y vision en un solo equipo</h2>
          </div>
          <div className="split">
            <div className="reveal">
              <p className="lead">
                Somos un duo de productor musical y director de video. Nuestro
                flujo une sonido y camara para piezas que se sienten vivas. En
                2026 abrimos Magma como estudio urbano para artistas, marcas y
                crews que quieren un look autentico.
              </p>
              <ul className="values">
                <li>Detalle tecnico y mezcla limpia.</li>
                <li>Direccion creativa con guion visual.</li>
                <li>Entrega rapida con backups seguros.</li>
              </ul>
            </div>
            <div className="panel-grid">
              <div className="panel reveal">
                <h4>Productor Musical</h4>
                <p>
                  Beats, tracking y mezcla final con actitud. Enfoque en
                  dinamica y punch.
                </p>
              </div>
              <div className="panel reveal">
                <h4>Director de Video</h4>
                <p>
                  Direccion de arte, camara y edicion con narrativa urbana y
                  ritmo rapido.
                </p>
              </div>
              <div className="panel reveal">
                <h4>Pipeline</h4>
                <p>
                  Un solo calendario, archivos ordenados y seguimiento por
                  Supabase cuando este listo.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section id="contacto" className="section">
          <div className="section-header reveal">
            <p className="eyebrow">Contactanos</p>
            <h2>Cuentalo y lo aterrizamos</h2>
            <p>
              Envia tu brief. Respondemos con propuesta, calendario y costo en
              menos de 24 horas.
            </p>
          </div>
          <div className="contact-grid">
            <div className="reveal">
              <p className="lead">Magma Studio</p>
              <ul className="contact-list">
                <li>
                  <span>Direccion:</span> Zona Centro, CDMX
                </li>
                <li>
                  <span>Horario:</span> Lun a Sab, 10:00 - 22:00
                </li>
                <li>
                  <span>Email:</span> hola@magma.studio
                </li>
                <li>
                  <span>Tel:</span> +52 55 0000 0000
                </li>
              </ul>
            </div>
            <form
              className="contact-form reveal"
              onSubmit={(event) => event.preventDefault()}
            >
              <label className="form-field">
                Nombre
                <input type="text" placeholder="Tu nombre" />
              </label>
              <label className="form-field">
                Email
                <input type="email" placeholder="tu@email.com" />
              </label>
              <label className="form-field">
                Proyecto
                <input type="text" placeholder="EP, video, campana" />
              </label>
              <label className="form-field">
                Mensaje
                <textarea placeholder="Que necesitas y para cuando"></textarea>
              </label>
              <div className="form-actions">
                <button type="submit" className="btn primary">
                  Enviar brief
                </button>
                <button type="button" className="btn whatsapp">
                  WhatsApp
                </button>
              </div>
            </form>
          </div>
        </section>

        <section id="acceso" className="section">
          <div className="section-header reveal">
            <p className="eyebrow">Acceso</p>
            <h2>Login y Register</h2>
            <p>
              Pantallas listas para integrar con Supabase cuando activemos la
              base de datos.
            </p>
          </div>
          <div className="auth-grid">
            <div className="auth-card reveal">
              <h3>Login</h3>
              <label className="form-field">
                Email
                <input type="email" placeholder="tu@email.com" />
              </label>
              <label className="form-field">
                Password
                <input type="password" placeholder="********" />
              </label>
              <button type="button" className="btn primary">
                Entrar
              </button>
              <p className="helper">Proximamente conectado a Supabase.</p>
            </div>
            <div className="auth-card reveal">
              <h3>Register</h3>
              <label className="form-field">
                Nombre
                <input type="text" placeholder="Tu nombre" />
              </label>
              <label className="form-field">
                Email
                <input type="email" placeholder="tu@email.com" />
              </label>
              <label className="form-field">
                Password
                <input type="password" placeholder="********" />
              </label>
              <button type="button" className="btn ghost">
                Crear cuenta
              </button>
              <p className="helper">Registro informativo por ahora.</p>
            </div>
          </div>
        </section>
      </main>

      <footer className="footer">
        Magma Studio - sonido y vision en un solo golpe.
      </footer>
    </div>
  )
}

export default App
