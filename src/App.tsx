import { useRef, useState, useEffect } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'
import producerPhoto from '/img/vark-optimized.webp'
import directorPhoto from '/img/argot-optimized.webp'
import aisyLogo from '/img/logo-aisy.webp'
import { supabase } from './lib/supabaseClient'
import type { User } from '@supabase/supabase-js'
import './App.css'
import AdminDashboard from './components/AdminDashboard'
import ClientDashboard from './components/ClientDashboard'
import ProjectDashboard from './components/ProjectDashboard'
import { Eye, EyeOff, LogOut } from 'lucide-react'

gsap.registerPlugin(ScrollTrigger, useGSAP)

function App() {
  const root = useRef<HTMLDivElement | null>(null)
  const heroRef = useRef<HTMLElement | null>(null)
  const producerRef = useRef<HTMLImageElement | null>(null)
  const directorRef = useRef<HTMLImageElement | null>(null)
  const [menuOpen, setMenuOpen] = useState(false)
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login')
  const [user, setUser] = useState<User | null>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [view, setView] = useState<'landing' | 'admin' | 'projects'>('landing')
  const [authLoading, setAuthLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

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
          gsap.fromTo(
            '.fade-in',
            { autoAlpha: 0, y: 18 },
            {
              autoAlpha: 1,
              y: 0,
              duration: 1.1,
              ease: 'power3.out',
              delay: 0.15,
            },
          )

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

  const toggleMenu = () => {
    setMenuOpen(!menuOpen)
  }

  const openAuth = (mode: 'login' | 'register') => {
    setAuthMode(mode)
    setShowAuthModal(true)
    setMenuOpen(false)
  }

  const handleWhatsAppSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const nombre = formData.get('nombre')
    const servicio = formData.get('servicio')
    const mensaje = formData.get('mensaje')

    const text = `Hola AISY! Mi nombre es ${nombre}. Me interesa el servicio: ${servicio}. Mi consulta: ${mensaje}`
    const encodedText = encodeURIComponent(text)
    window.open(`https://wa.me/59165335510?text=${encodedText}`, '_blank')
  }

  const checkAdminStatus = async (userId: string) => {
    const { data } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .single()
    
    if (data && (data.role === 'admin' || data.role === 'owner')) {
      setIsAdmin(true)
    } else {
      setIsAdmin(false)
    }
  }

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      if (session?.user) checkAdminStatus(session.user.id)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        checkAdminStatus(session.user.id)
      } else {
        setIsAdmin(false)
        setView('landing')
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const handleAuth = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setAuthLoading(true)
    const formData = new FormData(e.currentTarget)
    const email = formData.get('email') as string
    const password = formData.get('password') as string
    const fullName = formData.get('fullName') as string

    if (authMode === 'register') {
      if (password.length < 6) {
        alert('La contraseña debe tener al menos 6 caracteres.')
        setAuthLoading(false)
        return
      }
    }

    try {
      if (authMode === 'login') {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { full_name: fullName } }
        })
        if (error) {
          if (error.message.includes('already registered')) {
            throw new Error('Este correo ya está registrado.')
          }
          throw error
        }
        alert('¡Registro exitoso! Revisa tu correo para confirmar.')
      }
      setShowAuthModal(false)
    } catch (error: any) {
      alert(error.message)
    } finally {
      setAuthLoading(false)
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    setView('landing')
  }

  useEffect(() => {
    const links = document.querySelectorAll<HTMLAnchorElement>('a[href^="#"]')

    const handleAnchorClick = (event: Event) => {
      const link = event.currentTarget as HTMLAnchorElement
      const href = link.getAttribute('href')
      if (!href || href === '#') return

      const targetElement = document.getElementById(href.substring(1))
      if (!targetElement) return

      event.preventDefault()
      window.scrollTo({
        top: targetElement.offsetTop,
        behavior: 'smooth',
      })
    }

    links.forEach((link) => link.addEventListener('click', handleAnchorClick))

    return () => {
      links.forEach((link) => link.removeEventListener('click', handleAnchorClick))
    }
  }, [])

  return (
    <div className="page" ref={root}>
      <header className="site-header">
        <a className="brand" href="#inicio" aria-label="AISY, ir al inicio">
          <img className="brand-logo" src={aisyLogo} alt="Logo de AISY" />
          <span>AISY</span>
        </a>
        <button className={`menu-toggle ${menuOpen ? 'open' : ''}`} onClick={toggleMenu} aria-label="Abrir navegación">
          <span className="menu-icon"></span>
          <span className="menu-text">Menú</span>
        </button>
        <nav className={`nav ${menuOpen ? 'open' : ''}`}>
          <a href="#inicio" onClick={() => { setView('landing'); setMenuOpen(false); }}>Inicio</a>
          <a href="#catalogo" onClick={() => { setView('landing'); setMenuOpen(false); }}>Catálogo</a>
          <a href="#nosotros" onClick={() => { setView('landing'); setMenuOpen(false); }}>Nosotros</a>
          <a href="#contacto" onClick={() => { setView('landing'); setMenuOpen(false); }}>Contáctanos</a>
          {user && (
            <a href="#" onClick={(e) => { e.preventDefault(); setView('projects'); setMenuOpen(false); }}>
              {isAdmin ? 'Gestión Proyectos' : 'Mis Proyectos'}
            </a>
          )}
          {!user && (
            <div className="mobile-auth-actions">
              <button type="button" className="btn ghost" onClick={() => openAuth('login')}>Entrar</button>
              <button type="button" className="btn primary" onClick={() => openAuth('register')}>Registrarme</button>
            </div>
          )}
        </nav>
        <div className="header-actions">
          {user ? (
            <div className="user-controls">
              {isAdmin && (
                <button type="button" className={`btn ${view === 'admin' ? 'primary' : 'ghost'}`} onClick={() => setView('admin')}>
                  Finanzas
                </button>
              )}
              <button type="button" className={`btn ${view === 'projects' ? 'primary' : 'ghost'} nav-link-btn`} onClick={() => setView('projects')}>
                {isAdmin ? 'Proyectos' : 'Mi Portal'}
              </button>
              {view !== 'landing' && (
                <button type="button" className="btn ghost" onClick={() => setView('landing')}>Sitio Web</button>
              )}
              <button type="button" className="logout-icon-btn" onClick={handleLogout} title="Cerrar Sesión">
                <LogOut size={20} />
              </button>
            </div>
          ) : (
            <div className="auth-btns">
              <button type="button" className="btn ghost" onClick={() => openAuth('login')}>Entrar</button>
              <button type="button" className="btn primary" onClick={() => openAuth('register')}>Registrarme</button>
            </div>
          )}
        </div>
      </header>

      {view === 'admin' ? (
        <div className="container py-8">
          <AdminDashboard />
        </div>
      ) : view === 'projects' ? (
        <div className="container py-8">
          {isAdmin ? <ProjectDashboard /> : <ClientDashboard />}
        </div>
      ) : (
        <>
          <main>
            <section id="inicio" className="hero" ref={heroRef}>
              <div className="hero-copy reveal">
                <div className="hero-status"><span></span>AISY creative system / online</div>
                <p className="eyebrow">AISY Music Studio</p>
                <h1 className="hero-title">Cbba<br /><span>Bolivia.</span></h1>
                <p className="lead">Producción musical y audiovisual para artistas que quieren sonar distinto y verse inolvidables.</p>
                <div className="hero-actions">
                  <a href="#catalogo" className="btn primary">Explorar planes</a>
                  <a href="#contacto" className="btn ghost">Iniciar proyecto</a>
                </div>
              </div>
              <div className="hero-visual fade-in">
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
            <div className="promo-strip"><span>Oferta activa</span><strong>10% OFF</strong><span>en video, música y combos</span></div>
            <p className="eyebrow">Planes AISY</p>
            <h2>Planes para video, musica y combos</h2>
            <p>
              Planes para video, musica y combos listos para artistas
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
                  <div className="price-before"><span>Antes</span><s>Bs 350</s></div>
                  <div className="price-now"><span className="plan-currency">Bs</span><span className="plan-amount">315</span></div>
                  <span className="discount-chip">−10%</span>
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
                <a href="#contacto" className="btn primary">
                  Reservar este plan
                </a>
              </article>
              <article className="plan-card highlight reveal">
                <div className="plan-tags">
                  <span className="plan-pill accent">Video</span>
                  <span className="plan-pill">Estandar</span>
                </div>
                <h4>Video Estandar</h4>
                <p className="plan-desc">Mas presencia visual</p>
                <div className="plan-price">
                  <div className="price-before"><span>Antes</span><s>Bs 550</s></div>
                  <div className="price-now"><span className="plan-currency">Bs</span><span className="plan-amount">495</span></div>
                  <span className="discount-chip">−10%</span>
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
                <a href="#contacto" className="btn primary">
                  Reservar este plan
                </a>
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
                  <div className="price-before"><span>Antes</span><s>Bs 199</s></div>
                  <div className="price-now"><span className="plan-currency">Bs</span><span className="plan-amount">179</span></div>
                  <span className="discount-chip">−10%</span>
                </div>
                <p className="plan-note">Pago unico por proyecto</p>
                <ul className="plan-features">
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
                <a href="#contacto" className="btn primary">
                  Reservar este plan
                </a>
              </article>
              <article className="plan-card reveal">
                <div className="plan-tags">
                  <span className="plan-pill mint">Instrumental</span>
                  <span className="plan-pill">Personalizado</span>
                </div>
                <h4>Instrumental Personalizado</h4>
                <p className="plan-desc">Beat personalizado</p>
                <p className="plan-kicker">Desde</p>
                <div className="plan-price regular-price">
                  <div className="price-now"><span className="plan-currency">Bs</span><span className="plan-amount">99</span></div>
                </div>
                <p className="plan-note">Pago unico por proyecto</p>
                <ul className="plan-features">
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
                    Ver licencias y detalles
                  </summary>
                  <div className="tier-comparison">
                    <div className="tier-block">
                      <div className="tier-header">
                        <span className="tier-name">Básica</span>
                        <span className="tier-price">Bs 99</span>
                      </div>
                      <ul className="tier-features">
                        <li className="yes">Beat personalizado</li>
                        <li className="no">Uso comercial</li>
                        <li className="no">Entrega WAV</li>
                        <li className="no">Derechos exclusivos</li>
                        <li className="no">Soporte post-venta</li>
                      </ul>
                    </div>
                    
                    <div className="tier-block highlight">
                      <div className="tier-header">
                        <span className="tier-name">Gold</span>
                        <span className="tier-price">Bs 120</span>
                      </div>
                      <ul className="tier-features">
                        <li className="yes">Beat personalizado</li>
                        <li className="yes">Uso comercial</li>
                        <li className="yes">Entrega WAV</li>
                        <li className="no">Derechos exclusivos</li>
                        <li className="no">Soporte post-venta</li>
                      </ul>
                    </div>

                    <div className="tier-block exclusive">
                      <div className="tier-header">
                        <span className="tier-name">Exclusiva</span>
                        <span className="tier-price">Bs 350</span>
                      </div>
                      <ul className="tier-features">
                        <li className="yes">Beat personalizado</li>
                        <li className="yes">Uso comercial</li>
                        <li className="yes">Entrega WAV</li>
                        <li className="yes">Derechos exclusivos</li>
                        <li className="yes">Soporte post-venta</li>
                      </ul>
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
                  <div className="price-before"><span>Antes</span><s>Bs 520</s></div>
                  <div className="price-now"><span className="plan-currency">Bs</span><span className="plan-amount">468</span></div>
                  <span className="discount-chip">−10%</span>
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
                <a href="#contacto" className="btn primary">
                  Reservar este plan
                </a>
              </article>
              <article className="plan-card recommended reveal">
                <span className="plan-badge mint">Recomendado</span>
                <div className="plan-tags">
                  <span className="plan-pill accent">Combo</span>
                </div>
                <h4>Combo Estandar</h4>
                <p className="plan-desc">Video estandar + produccion musical.</p>
                <div className="plan-price">
                  <div className="price-before"><span>Antes</span><s>Bs 720</s></div>
                  <div className="price-now"><span className="plan-currency">Bs</span><span className="plan-amount">648</span></div>
                  <span className="discount-chip">−10%</span>
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
                <a href="#contacto" className="btn primary">
                  Reservar este plan
                </a>
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
                En AISY, la música no es solo un trabajo; es un legado. Somos dos hermanos apasionados por la producción de audio y video. Fusionamos nuestra conexión personal con la disciplina técnica para ofrecer un espacio donde los artistas emergentes pueden transformar sus ideas en hits. Nuestra misión es simple: darle a tu talento el impulso y la estructura que necesita para destacar en la industria urbana.
              </p>
              <ul className="values">
                <li>Mazter y mezcla.</li>
                <li>Direccion creativa.</li>
                <li>Asesorias si en caso necesitaras.</li>
              </ul>
            </div>
            <div className="panel-grid">
              <div className="panel reveal">
                <h4>Productor Musical</h4>
                <p>
                  Beats, tracking y mezcla. Enfoque en
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
                <h4>Velocidad</h4>
                <p>
                  Entrega en menos de 3 dias.
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
              Envia tu propuesta. Respondemos con propuesta, calendario y costo en
              menos de 24 horas.
            </p>
          </div>
          <div className="contact-grid">
            <div className="reveal">
              <p className="lead">AISY Music Studio</p>
              <ul className="contact-list">
                <li>
                  <span>Direccion:</span> Cochabamba, Bolivia
                </li>
                <li>
                  <span>Horario:</span> Lun a Domingos, 24/7
                </li>
                <li>
                  <span>Contactame:</span> +591 65335510
                </li>
              </ul>
            </div>

            <form className="contact-form reveal" onSubmit={handleWhatsAppSubmit}>
              <div className="form-field">
                <label htmlFor="nombre">Nombre</label>
                <input 
                  type="text" 
                  id="nombre" 
                  name="nombre" 
                  key={user?.id || 'guest'}
                  defaultValue={user?.user_metadata?.full_name || ''}
                  placeholder="Tu nombre" 
                  required 
                />
              </div>
              <div className="form-field">
                <label htmlFor="servicio">Servicio de interés</label>
                <select id="servicio" name="servicio" className="form-input">
                  <option value="Video">Producción de Video</option>
                  <option value="Musica">Producción Musical</option>
                  <option value="Combo">Combo AISY</option>
                  <option value="Otro">Otro / Consulta General</option>
                </select>
              </div>
              <div className="form-field">
                <label htmlFor="mensaje">Mensaje</label>
                <textarea id="mensaje" name="mensaje" placeholder="Cuéntanos tu proyecto..." required></textarea>
              </div>
              <button type="submit" className="btn primary whatsapp">
                Enviar a WhatsApp
              </button>
            </form>
          </div>
        </section>

          <footer className="footer">
            AISY Music Studio — sonido y visión en otra dimensión.
          </footer>
        </main>
      </>
    )}

      {showAuthModal && (
        <div className="auth-overlay" onClick={() => setShowAuthModal(false)}>
          <div className="auth-modal" onClick={(e) => e.stopPropagation()}>
            <button className="close-modal" onClick={() => setShowAuthModal(false)}>&times;</button>

            <div className="auth-tabs">
              <button
                className={`auth-tab ${authMode === 'login' ? 'active' : ''}`}
                onClick={() => setAuthMode('login')}
              >
                Login
              </button>
              <button
                className={`auth-tab ${authMode === 'register' ? 'active' : ''}`}
                onClick={() => setAuthMode('register')}
              >
                Registro
              </button>
            </div>

            {authMode === 'login' ? (
              <form className="auth-form-container" onSubmit={handleAuth}>
                <h3>Bienvenido de nuevo</h3>
                <p className="helper">Ingresa a tu cuenta de artista.</p>
                <div className="form-field">
                  <label>Email</label>
                  <input type="email" name="email" placeholder="tu@email.com" required />
                </div>
                <div className="form-field">
                  <label>Password</label>
                  <div className="password-input-wrapper">
                    <input 
                      type={showPassword ? 'text' : 'password'} 
                      name="password" 
                      placeholder="********" 
                      required 
                    />
                    <button 
                      type="button" 
                      className="password-toggle"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>
                <button type="submit" className="btn primary" disabled={authLoading}>
                  {authLoading ? 'Cargando...' : 'Entrar'}
                </button>
              </form>
            ) : (
              <form className="auth-form-container" onSubmit={handleAuth}>
                <h3>Únete a la familia</h3>
                <p className="helper">Crea tu cuenta para gestionar tus proyectos.</p>
                <div className="form-field">
                  <label>Nombre</label>
                  <input type="text" name="fullName" placeholder="Tu nombre artístico" required />
                </div>
                <div className="form-field">
                  <label>Email</label>
                  <input type="email" name="email" placeholder="tu@email.com" required />
                </div>
                <div className="form-field">
                  <label>Password</label>
                  <div className="password-input-wrapper">
                    <input 
                      type={showPassword ? 'text' : 'password'} 
                      name="password" 
                      placeholder="********" 
                      required 
                    />
                    <button 
                      type="button" 
                      className="password-toggle"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>
                <button type="submit" className="btn primary" disabled={authLoading}>
                  {authLoading ? 'Cargando...' : 'Registrarme'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default App
