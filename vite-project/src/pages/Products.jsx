// Products.jsx muestra la lista de productos y permite crear, editar y eliminar productos.
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router'
import Nav from '../components/nav'
import UserForm from '../components/productForm'
import ConfirmModal from '../components/confirmModal'

const Products = () => {
  // Estados que controla la lista de productos y su carga.
  const [user, setUser] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [id, setiD] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 5
  const navigate = useNavigate()
  const token = localStorage.getItem('fakestore_token') || sessionStorage.getItem('fakestore_token')

  // Filtra productos según el texto de búsqueda en título, descripción o categoría.
  const filteredUsers = user.filter((user) => {
    const query = searchTerm.trim().toLowerCase()
    if (!query) return true
    return [user.userid, user.id, user.body]
      .join(' ')
      .toLowerCase()
      .includes(query)
  })

  // Cálculos de paginación.
  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / itemsPerPage))
  const startIndex = (currentPage - 1) * itemsPerPage
  const currentUser = filteredUsers.slice(startIndex, startIndex + itemsPerPage)

  useEffect(() => {
    // Si no hay token válido, redirige al login.
    if (!token) {
      navigate('/')
      return
    }

    const fetchUsers = async () => {
      try {
        const response = await fetch('https://jsonplaceholder.typicode.com/posts')
        if (!response.ok) {
          throw new Error('Error al cargar los usuarios')
        }

        const data = await response.json()
        // Agrega la propiedad source para distinguir productos de la API de los locales.
        setUser(data.map((userid) => ({ ...userid, source: 'api' })))
      } catch (err) {
        setError(err.message || 'No se pudieron cargar los Usuarios')
      } finally {
        setLoading(false)
      }
    }

    const fetchId = async () => {
      try {
        const response = await fetch('https://jsonplaceholder.typicode.com/posts')
        if (!response.ok) {
          throw new Error('Error al cargar el id')
        }

        const data = await response.json()
        setiD(data)
      } catch (err) {
        console.warn(err)
      }
    }

    fetchUsers()
    fetchId()
  }, [navigate, token])

  const handlePageChange = (page) => {
    setCurrentPage(page)
  }

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value)
    setCurrentPage(1)
  }

  const handleEditUser = async (userId) => {
    setUserError('')
    setLoadingUserDetail(true)

    const localUser = user.find((user) => user.id === userId)
    // Si el producto ya está en el estado local, no vuelve a pedirlo a la API.
    if (localUser) {
      setEditingUser(localUser)
      setShowUserForm(true)
      setLoadingUserDetail(false)
      return
    }

    try {
      const response = await fetch(`https://jsonplaceholder.typicode.com/posts/${userId}`)
      if (!response.ok) {
        throw new Error('Error al cargar el Usuario')
      }

      const data = await response.json()
      setEditingUser({ ...data, source: 'api' })
      setShowUserForm(true)
    } catch (err) {
      setUserError(err.message || 'No se pudo cargar el Usuario')
    } finally {
      setLoadingUserDetail(false)
    }
  }

  const handleUpdateUser = async (formData) => {
    setUserError('')
    setUserSuccess('')
    setUserSubmitting(true)

    const isLocalUser = editingUser?.source !== 'api'

    try {
      if (isLocalUser) {
        // Actualiza directamente el producto local sin llamar a la API.
        setUser((prev) =>
          prev.map((p) =>
            p.id === editingUser.id ? { ...p, ...formData, source: p.source || 'local' } : p
          )
        )
        setUserSuccess('Usuario actualizado correctamente.')
        setShowUserForm(false)
        setEditingUser(null)
        return
      }

      const response = await fetch(`https://jsonplaceholder.typicode.com/posts/${editingUser.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (!response.ok) {
        const text = await response.text()
        throw new Error(text || 'Error actualizando Usuario')
      }

      const data = await response.json()
      setUser((prev) =>
        prev.map((p) => (p.id === editingUser.id ? { ...data, source: 'api' } : p))
      )
      setUserSuccess('Usuario actualizado correctamente.')
      setShowUserForm(false)
      setEditingUser(null)
      console.log('fakestore updated User:', data)
    } catch (err) {
      setUserError(err.message || 'No se pudo actualizar el usuario')
    } finally {
      setUserSubmitting(false)
    }
  }

  const handleDeleteUser = async (userId) => {
    setUserToDelete(userId)
    setShowDeleteConfirm(true)
  }

  const confirmDeleteUser = async () => {
    if (!userToDelete) return

    setUserError('')
    setUserSuccess('')
    setShowDeleteConfirm(false)

    try {
      const users = users.find((p) => p.id === userToDelete)
      if (user?.source !== 'api') {
        // Si el producto es local, simplemente lo eliminamos del estado.
        setUser((prev) => prev.filter((p) => p.id !== userToDelete))
        setUserSuccess('Usuario eliminado correctamente.')
        setUserToDelete(null)
        return
      }

      const response = await fetch(`https://jsonplaceholder.typicode.com/posts/${userToDelete}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        const text = await response.text()
        throw new Error(text || 'Error eliminando Usuario')
      }

      setUser((prev) => prev.filter((p) => p.id !== userToDelete))
      setUserSuccess('Usuario eliminado correctamente.')
      setUserToDelete(null)
    } catch (err) {
      setUserError(err.message || 'No se pudo eliminar el usuario')
      setUserToDelete(null)
    }
  }

  const cancelDeleteUser = () => {
    setShowDeleteConfirm(false)
    setUserToDelete(null)
  }

  const [showUserForm, setShowUserForm] = useState(false)
  const [UserSubmitting, setUserSubmitting] = useState(false)
  const [userError, setUserError] = useState('')
  const [userSuccess, setUserSuccess] = useState('')
  const [editingUser, setEditingUser] = useState(null)
  const [loadingUserDetail, setLoadingUserDetail] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [userToDelete, setUserToDelete] = useState(null)

  const handleCreateUser = async (formData) => {
    setUserError('')
    setUserSuccess('')
    setUserSubmitting(true)

    try {
      const response = await fetch('https://jsonplaceholder.typicode.com/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (!response.ok) {
        const text = await response.text()
        throw new Error(text || 'Error creando usuario')
      }

      const data = await response.json()
      const newUser = { ...data, source: 'local' }
      setUser((prev) => [newUser, ...(prev || [])])
      setUserSuccess('Usuario creado correctamente. ID: ' + (newUser.id || '—'))
      setShowUserForm(false)
      setEditingUser(null)
      setCurrentPage(1)
    } catch (err) {
      setUserError(err.message || 'No se pudo crear el Usuario')
    } finally {
      setUserSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {token && <Nav />}

      <main className="container mx-auto px-4 py-8">
        <div className="mb-6 space-y-4">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-semibold text-slate-900">Usuarios</h1>
            </div>
            <div className="flex items-center gap-4">
              <div className="rounded-2xl bg-white px-4 py-3 shadow-sm ring-1 ring-slate-200">
                <p className="text-sm text-slate-500">Total Usuarios</p>
                <p className="mt-1 text-xl font-semibold text-slate-900">{filteredUsers.length}</p>
              </div>

              <div>
                <button
                  type="button"
                  onClick={() => {
                    setEditingUser(null)
                    setShowUserForm((s) => !s)
                  }}
                  className="rounded-2xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-500"
                >
                  Nuevo Usuario
                </button>
              </div>
            </div>
          </div>

          <div className="max-w-xl">
            <label htmlFor="user-search" className="sr-only">Buscar usuarios</label>
            <input
              id="user-search"
              type="text"
              value={searchTerm}
              onChange={handleSearchChange}
              placeholder="Buscar por título, descripción o categoría"
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
            />
          </div>
        </div>
        {userError && <div className="mb-4 rounded-2xl bg-rose-50 px-4 py-3 text-rose-700">{userError}</div>}
        {userSuccess && <div className="mb-4 rounded-2xl bg-emerald-50 px-4 py-3 text-emerald-700">{userSuccess}</div>}

        {showUserForm && (
          <UserForm
            initialData={editingUser || {}}
            id={id}
            onSubmit={editingUser ? handleUpdateUser : handleCreateUser}
            submitting={UserSubmitting || loadingUserDetail}
            onClose={() => {
              setShowUserForm(false)
              setEditingUser(null)
            }}
          />
        )}

        <ConfirmModal
          title="Confirmar eliminación"
          message="¿Estás seguro de que deseas eliminar este Usuario? Esta acción no se puede deshacer."
          isOpen={showDeleteConfirm}
          isDangerous={true}
          onConfirm={confirmDeleteUser}
          onCancel={cancelDeleteUser}
        />

        <div className="overflow-hidden rounded-3xl bg-white shadow-lg ring-1 ring-slate-200">
          <div className="border-b border-slate-200 px-6 py-4 bg-slate-100">
            <h2 className="text-lg font-medium text-slate-900">Catálogo</h2>
          </div>

          <div className="p-4">
            {loading ? (
              <div className="flex items-center justify-center py-20 text-slate-500">Cargando Usuarios...</div>
            ) : error ? (
              <div className="rounded-2xl bg-rose-50 px-4 py-6 text-rose-700">{error}</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200 text-left">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-6 py-3 text-sm font-semibold uppercase tracking-wide text-slate-500">title</th>
                      <th className="px-6 py-3 text-sm font-semibold uppercase tracking-wide text-slate-500">body</th>
                      <th className="px-6 py-3 text-sm font-semibold uppercase tracking-wide text-slate-500">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 bg-white">
                    {currentUser.map((user) => (
                      <tr key={user.id} className="hover:bg-slate-50">
                        <td className="px-6 py-4 align-top text-sm font-semibold text-slate-900">${user.title}</td>
                        <td className="px-6 py-4 align-top text-sm text-slate-600 max-w-2xl wrap-break-word">{user.body}</td>
                        <td className="px-6 py-4 align-top text-sm text-slate-700">
                          <div className="flex flex-wrap gap-2">
                            <button
                              type="button"
                              onClick={() => handleEditUser(user.id)}
                              disabled={loadingUserDetail}
                              className="rounded-full w-full bg-blue-600 px-3 py-1 text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-400"
                            >
                              Editar usuario
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteUser(user.id)}
                              className="rounded-full w-full bg-red-600 px-3 py-1 text-white transition hover:bg-red-700"
                            >
                              Eliminar Usuario
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                <div className="mt-6 flex flex-col gap-3 rounded-3xl bg-slate-50 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="text-sm text-slate-600">
                    Página {currentPage} de {totalPages}
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                      className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400"
                    >
                      Anterior
                    </button>

                    {[...Array(totalPages)].map((_, index) => {
                      const page = index + 1
                      return (
                        <button
                          key={page}
                          type="button"
                          onClick={() => handlePageChange(page)}
                          className={`rounded-2xl px-4 py-2 text-sm font-medium transition ${
                            currentPage === page
                              ? 'bg-indigo-600 text-white shadow-sm'
                              : 'bg-white text-slate-700 hover:bg-slate-100'
                          }`}
                        >
                          {page}
                        </button>
                      )
                    })}

                    <button
                      type="button"
                      onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                      disabled={currentPage === totalPages}
                      className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400"
                    >
                      Siguiente
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}

export default Products
