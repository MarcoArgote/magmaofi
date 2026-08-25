import React, { useState, useEffect } from 'react'
import { projectService, type Project } from '../services/projectService'
import { Music, Film, Download, Play, CheckCircle, Clock } from 'lucide-react'

const ClientDashboard: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadProjects()
  }, [])

  const loadProjects = async () => {
    try {
      const data = await projectService.getClientProjects()
      setProjects(data)
    } catch (error) {
      console.error('Error loading projects:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <div className="dashboard-loading">Cargando tus proyectos...</div>

  return (
    <div className="client-dashboard reveal">
      <div className="dashboard-header">
        <div>
          <h1>Mis Proyectos</h1>
          <p className="muted">Monitorea el progreso de tus producciones en AISY Music Studio</p>
        </div>
      </div>

      <div className="projects-grid">
        {projects.map(p => (
          <div key={p.id} className="project-client-card">
            <div className="project-card-main">
              <div className="project-type-badge">
                {p.type === 'music' ? <Music size={24} /> : <Film size={24} />}
                <span>{p.type === 'music' ? 'Música' : 'Video'}</span>
              </div>
              
              <div className="project-info">
                <h3>{p.title}</h3>
                <div className="project-status">
                  {p.progress === 100 ? (
                    <span className="status-tag completed"><CheckCircle size={14} /> Completado</span>
                  ) : (
                    <span className="status-tag in-progress"><Clock size={14} /> En proceso</span>
                  )}
                  {p.is_paid && <span className="status-tag paid">Pagado 100%</span>}
                </div>
              </div>
            </div>

            <div className="project-progress-section">
              <div className="progress-header">
                <span>Progreso del trabajo</span>
                <span className="progress-value">{p.progress}%</span>
              </div>
              <div className="progress-bar-container">
                <div 
                  className="progress-bar-fill" 
                  style={{ width: `${p.progress}%` }}
                ></div>
              </div>
            </div>

            <div className="project-actions-grid">
              <div className="action-block">
                <span className="action-label">Vista Previa</span>
                {p.preview_url ? (
                  <a href={p.preview_url} target="_blank" rel="noopener noreferrer" className="btn ghost preview-btn">
                    <Play size={18} /> Escuchar / Ver Adelanto
                  </a>
                ) : (
                  <div className="empty-action">No hay vista previa disponible aún.</div>
                )}
              </div>

              <div className="action-block">
                <span className="action-label">Entrega Final</span>
                {p.is_paid ? (
                  p.final_url ? (
                    <a href={p.final_url} target="_blank" rel="noopener noreferrer" className="btn primary download-btn">
                      <Download size={18} /> Descargar Trabajo Final
                    </a>
                  ) : (
                    <div className="empty-action">El archivo final se subirá pronto.</div>
                  )
                ) : (
                  <div className="locked-action">
                    <p>Habilita la descarga completando el 100% de tu pago.</p>
                    <button className="btn disabled" disabled>
                      Bloqueado por Pago Pendiente
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}

        {projects.length === 0 && (
          <div className="empty-projects-state">
            <Layout size={48} className="muted-icon" />
            <h3>Aún no tienes proyectos asignados</h3>
            <p>Cuando comencemos tu producción, aparecerá aquí para que la monitorees.</p>
          </div>
        )}
      </div>
    </div>
  )
}

const Layout = ({ size, className }: { size: number, className: string }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <rect width="18" height="18" x="3" y="3" rx="2" />
    <path d="M3 9h18" />
    <path d="M9 21V9" />
  </svg>
)

export default ClientDashboard
