// ProductForm.jsx renderiza el formulario para crear o editar un producto.
import { useState, useEffect, useRef } from 'react' // useRef para detectar clicks fuera del modal, useEffect para escuchar Escape.

const ProductForm = ({ initialData = {}, onSubmit, submitting = false, onClose, categories = [] }) => {
  // Si initialData viene con valores, se rellena el formulario con ellos.
  const [form, setForm] = useState(() => ({
    title: '',
    body: '',
    ...initialData
  }))
  const isEditing = !!initialData?.id // Detecta si estamos editando un producto existente.

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const payload = { ...form, title: (form.title) }
    onSubmit && onSubmit(payload) // Llama al manejador pasado desde Products.jsx.
  }

  const overlayRef = useRef(null)

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onClose && onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  const handleOverlayClick = (e) => {
    if (e.target === overlayRef.current) {
      onClose && onClose()
    }
  }

  return (
    <div
      ref={overlayRef}
      onMouseDown={handleOverlayClick}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 py-6"
      aria-modal="true"
      role="dialog"
    >
      <div className="w-full max-w-2xl rounded-3xl bg-white p-6 shadow-lg ring-1 ring-slate-200">
        <div className="flex items-start justify-between">
          <h3 className="text-lg font-medium text-slate-900">
            {isEditing ? 'Editar Usuario' : 'Nuevo Usuario'}
          </h3>
          <button
            type="button"
            onClick={() => onClose && onClose()}
            className="-mr-2 inline-flex items-center justify-center rounded-full p-2 text-slate-500 hover:bg-slate-100"
            aria-label="Cerrar"
          >
            ✕
          </button>
        </div>

        <form className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2" onSubmit={handleSubmit}>
  
          {/* Campo de precio. */}
          <div>
            <label className="block text-sm font-medium text-slate-700">Titulo</label>
            <input
              name="title"
              value={form.title}
              onChange={handleChange}
              placeholder="0.00"
              className="mt-1 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none focus:border-indigo-500 focus:bg-white"
              required
            />
          </div>

          {/* Campo de descripción. */}
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-slate-700">body</label>
            <textarea
              name="body"
              value={form.body}
              onChange={handleChange}
              placeholder="Descripción corta del usuario"
              className="mt-1 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none focus:border-indigo-500 focus:bg-white"
              rows={3}
            />
          </div>

         

          <div className="sm:col-span-2">
            <div className="mt-2 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => onClose && onClose()}
                className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Cancelar
              </button>

              <button
                type="submit"
                disabled={submitting}
                className="rounded-2xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:bg-slate-400"
              >
                {submitting ? 'Guardando...' : isEditing ? 'Actualizar producto' : 'Guardar producto'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}

export default ProductForm
