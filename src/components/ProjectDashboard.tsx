import React, { useState, useEffect } from 'react'
import { projectService, type Project } from '../services/projectService'
import { Plus, Music, Film, CheckCircle, Clock, Trash2, X } from 'lucide-react'

const ProjectDashboard: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([])
  const [clients, setClients] = useState<{id: string, full_name: string}[]>([])
  const [loading, setLoading] = useState(true)
  const [showProjectModal, setShowProjectModal] = useState(false)
  const [newProject, setNewProject] = useState<Project>({
    client_id: '',
    title: '',
    type: 'music',
    progress: 0,
    preview_url: '',
    final_url: '',
    is_paid: false
  })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      const [projData, clientData] = await Promise.all([
        projectService.getProjects(),
        projectService.getClients()
      ])
      setProjects(projData)
      setClients(clientData as any)
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddProject = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await projectService.createProject(newProject)
      setShowProjectModal(false)
      loadData()
      setNewProject({
        client_id: '',
        title: '',
        type: 'music',
        progress: 0,
        preview_url: '',
        final_url: '',
        is_paid: false
      })
    } catch (error) {
      alert('Error al crear proyecto')
    }
  }

  const handleUpdateProject = async (id: string, updates: Partial<Project>) => {
    try {
      await projectService.updateProject(id, updates)
      loadData()
    } catch (error) {
      alert('Error al actualizar proyecto')
    }
  }

  const handleDeleteProject = async (id: string) => {
    if (confirm('¿Eliminar este proyecto?')) {
      try {
        await projectService.deleteProject(id)
        loadData()
      } catch (error) {
        alert('Error al eliminar proyecto')
      }
    }
  }

  if (loading) return <div className="dashboard-loading">Cargando Proyectos...</div>

  return (
    <div className="admin-dashboard reveal">
      <div className="dashboard-header">
        <div>
          <h1>Gestión de Proyectos</h1>
          <p className="muted">Monitorea el progreso y entregas de tus clientes</p>
        </div>
        <button className="btn primary" onClick={() => setShowProjectModal(true)}>
          <Plus size={18} /> Nuevo Proyecto
        </button>
      </div>

      <div className="projects-section">
        <div className="projects-grid">
          {projects.map(p => (
            <div key={p.id} className="project-admin-card">
              <div className="project-card-header">
                <div className="project-type-icon">
                  {p.type === 'music' ? <Music size={20} /> : <Film size={20} />}
                </div>
                <div className="project-title-info">
                  <h4>{p.title}</h4>
                  <span className="client-tag">{p.client_name}</span>
                </div>
                <button className="delete-btn" onClick={() => handleDeleteProject(p.id!)}>
                  <Trash2 size={16} />
                </button>
              </div>
              
              <div className="project-progress-control">
                <div className="progress-label">
                  <span>Progreso: {p.progress}%</span>
                  <span>{p.progress === 100 ? 'Completado' : 'En proceso'}</span>
                </div>
                <input 
                  type="range" 
                  min="0" max="100" 
                  value={p.progress} 
                  onChange={(e) => handleUpdateProject(p.id!, { progress: Number(e.target.value) })}
                />
              </div>

              <div className="project-status-toggles">
                <button 
                  className={`status-toggle ${p.is_paid ? 'paid' : 'pending'}`}
                  onClick={() => handleUpdateProject(p.id!, { is_paid: !p.is_paid })}
                >
                  {p.is_paid ? <CheckCircle size={14} /> : <Clock size={14} />}
                  {p.is_paid ? 'Pagado 100%' : 'Pendiente de Pago'}
                </button>
              </div>
            </div>
          ))}
          {projects.length === 0 && (
            <div className="empty-state">No hay proyectos activos.</div>
          )}
        </div>
      </div>

      {showProjectModal && (
        <div className="auth-overlay" onClick={() => setShowProjectModal(false)}>
          <div className="auth-modal" onClick={(e) => e.stopPropagation()}>
            <button className="close-modal" onClick={() => setShowProjectModal(false)}><X size={24} /></button>
            <div className="auth-form-container">
              <h3>Nuevo Proyecto</h3>
              <form onSubmit={handleAddProject}>
                <div className="form-field">
                  <label>Cliente</label>
                  <select 
                    className="form-input"
                    value={newProject.client_id}
                    onChange={(e) => setNewProject({...newProject, client_id: e.target.value})}
                    required
                  >
                    <option value="">Selecciona un cliente</option>
                    {clients.map(c => (
                      <option key={c.id} value={c.id}>{c.full_name}</option>
                    ))}
                  </select>
                </div>
                <div className="form-field">
                  <label>Título del Proyecto</label>
                  <input 
                    type="text" 
                    className="form-input"
                    value={newProject.title}
                    onChange={(e) => setNewProject({...newProject, title: e.target.value})}
                    required 
                  />
                </div>
                <div className="form-field">
                  <label>Tipo</label>
                  <select 
                    className="form-input"
                    value={newProject.type}
                    onChange={(e) => setNewProject({...newProject, type: e.target.value as 'music' | 'video'})}
                  >
                    <option value="music">Música / Audio</option>
                    <option value="video">Video / Visuals</option>
                  </select>
                </div>
                <div className="form-field">
                  <label>URL Vista Previa (Soundcloud, YouTube, etc)</label>
                  <input 
                    type="url" 
                    className="form-input"
                    value={newProject.preview_url}
                    onChange={(e) => setNewProject({...newProject, preview_url: e.target.value})}
                  />
                </div>
                <div className="form-field">
                  <label>URL Archivo Final (Dropbox, Drive, etc)</label>
                  <input 
                    type="url" 
                    className="form-input"
                    value={newProject.final_url}
                    onChange={(e) => setNewProject({...newProject, final_url: e.target.value})}
                  />
                </div>
                <button type="submit" className="btn primary">Crear Proyecto</button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ProjectDashboard
