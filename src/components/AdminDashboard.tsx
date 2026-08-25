import React, { useState, useEffect } from 'react'
import { financeService, type Transaction } from '../services/financeService'
import { Plus, TrendingUp, TrendingDown, Wallet, Trash2, X, AlertCircle } from 'lucide-react'

const AdminDashboard: React.FC = () => {
  const INITIAL_DEBT = 12000
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [newTransaction, setNewTransaction] = useState<Transaction>({
    type: 'income',
    amount: 0,
    category: 'Producción',
    description: '',
    date: new Date().toISOString().split('T')[0]
  })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      const transData = await financeService.getTransactions()
      setTransactions(transData)
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const transactionToSave = { ...newTransaction }
      if ((newTransaction as any).type === 'payment') {
        transactionToSave.type = 'expense'
        transactionToSave.category = 'Deuda'
      }
      
      await financeService.addTransaction(transactionToSave)
      setShowAddModal(false)
      loadData()
      setNewTransaction({
        type: 'income',
        amount: 0,
        category: 'Producción',
        description: '',
        date: new Date().toISOString().split('T')[0]
      })
    } catch (error) {
      alert('Error al añadir transacción')
    }
  }

  const handleDelete = async (id: string) => {
    if (confirm('¿Eliminar esta transacción?')) {
      try {
        await financeService.deleteTransaction(id)
        loadData()
      } catch (error) {
        alert('Error al eliminar')
      }
    }
  }

  const stats = transactions.reduce(
    (acc, t) => {
      if (t.type === 'income') acc.income += Number(t.amount)
      else acc.expense += Number(t.amount)
      acc.balance = acc.income - acc.expense
      return acc
    },
    { income: 0, expense: 0, balance: 0 }
  )

  const debtPayments = transactions.reduce((acc, t) => {
    if (t.type === 'expense' && t.category.toLowerCase().includes('deuda')) {
      return acc + Number(t.amount)
    }
    return acc
  }, 0)

  const remainingDebt = Math.max(0, INITIAL_DEBT - debtPayments)

  if (loading) return <div className="dashboard-loading">Cargando Dashboard...</div>

  return (
    <div className="admin-dashboard reveal">
      <div className="dashboard-header">
        <div>
          <h1>Panel de Finanzas</h1>
          <p className="muted">Gestiona los ingresos, egresos y deudas de AISY Music Studio</p>
        </div>
        <button className="btn primary" onClick={() => setShowAddModal(true)}>
          <Plus size={18} /> Nuevo Movimiento
        </button>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon income"><TrendingUp size={24} /></div>
          <div className="stat-info">
            <span className="label">Ingresos Totales</span>
            <span className="value">Bs {stats.income.toFixed(2)}</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon expense"><TrendingDown size={24} /></div>
          <div className="stat-info">
            <span className="label">Egresos Totales</span>
            <span className="value">Bs {stats.expense.toFixed(2)}</span>
          </div>
        </div>
        <div className="stat-card highlight">
          <div className="stat-icon balance"><Wallet size={24} /></div>
          <div className="stat-info">
            <span className="label">Balance Neto</span>
            <span className="value">Bs {stats.balance.toFixed(2)}</span>
          </div>
        </div>
        <div className="stat-card debt">
          <div className="stat-icon debt"><AlertCircle size={24} /></div>
          <div className="stat-info">
            <span className="label">Deuda Pendiente</span>
            <span className="value">Bs {remainingDebt.toFixed(2)}</span>
          </div>
        </div>
      </div>

      <div className="transactions-section">
        <h3>Historial de Movimientos</h3>
        <div className="table-container">
          <table className="transactions-table">
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Descripción</th>
                <th>Categoría</th>
                <th>Tipo</th>
                <th>Monto</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((t) => (
                <tr key={t.id}>
                  <td>{t.date}</td>
                  <td>{t.description}</td>
                  <td><span className="tag">{t.category}</span></td>
                  <td>
                    <span className={`type-indicator ${t.type}`}>
                      {t.type === 'income' ? 'Ingreso' : 'Egreso'}
                    </span>
                  </td>
                  <td className={`amount ${t.type}`}>
                    {t.type === 'income' ? '+' : '-'} Bs {Number(t.amount).toFixed(2)}
                  </td>
                  <td>
                    <button className="delete-btn" onClick={() => handleDelete(t.id!)}>
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
              {transactions.length === 0 && (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '40px', color: 'var(--muted)' }}>
                    No hay transacciones registradas.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showAddModal && (
        <div className="auth-overlay" onClick={() => setShowAddModal(false)}>
          <div className="auth-modal" onClick={(e) => e.stopPropagation()}>
            <button className="close-modal" onClick={() => setShowAddModal(false)}><X size={24} /></button>
            <div className="auth-form-container">
              <h3>Nuevo Movimiento</h3>
              <form onSubmit={handleAdd}>
                <div className="form-field">
                  <label>Tipo</label>
                  <select 
                    className="form-input"
                    value={newTransaction.type}
                    onChange={(e) => setNewTransaction({...newTransaction, type: e.target.value as any})}
                  >
                    <option value="income">Ingreso</option>
                    <option value="expense">Egreso</option>
                    <option value="payment">Pago de Deuda</option>
                  </select>
                </div>
                <div className="form-field">
                  <label>Monto (Bs)</label>
                  <input 
                    type="number" 
                    className="form-input"
                    value={newTransaction.amount}
                    onChange={(e) => setNewTransaction({...newTransaction, amount: Number(e.target.value)})}
                    required 
                  />
                </div>
                {(newTransaction as any).type !== 'payment' && (
                  <div className="form-field">
                    <label>Categoría</label>
                    <input 
                      type="text" 
                      className="form-input"
                      placeholder="Ej: Video, Beats, Alquiler..."
                      value={newTransaction.category}
                      onChange={(e) => setNewTransaction({...newTransaction, category: e.target.value})}
                      required 
                    />
                  </div>
                )}
                <div className="form-field">
                  <label>Descripción</label>
                  <textarea 
                    className="form-input"
                    placeholder="Detalles del movimiento..."
                    value={newTransaction.description}
                    onChange={(e) => setNewTransaction({...newTransaction, description: e.target.value})}
                  />
                </div>
                <div className="form-field">
                  <label>Fecha</label>
                  <input 
                    type="date" 
                    className="form-input"
                    value={newTransaction.date}
                    onChange={(e) => setNewTransaction({...newTransaction, date: e.target.value})}
                    required 
                  />
                </div>
                <button type="submit" className="btn primary">Registrar</button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminDashboard
