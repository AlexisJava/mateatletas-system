'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Save,
  Loader2,
  Calendar,
  DollarSign,
  Users,
  Package,
  Trash2,
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { getProductById, updateProduct, deleteProduct } from '@/lib/api/admin.api';
import { formatCurrency } from '@/lib/constants/admin-mock-data';
import { ComisionesSection } from '@/components/admin/views/productos/components/ComisionesSection';
import type { Producto } from '@/types/catalogo.types';

/**
 * Pagina de detalle/edicion de producto
 * /admin/productos/[id]
 */
export default function ProductoDetailPage() {
  const params = useParams();
  const router = useRouter();
  const productoId = params.id as string;

  const [producto, setProducto] = useState<Producto | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    precio: 0,
    tipo: 'Evento' as string,
    activo: true,
    fecha_inicio: '',
    fecha_fin: '',
    cupo_maximo: undefined as number | undefined,
  });

  // Ref para controlar el request actual y evitar race conditions
  const currentRequestRef = useRef<string | null>(null);

  // Cargar producto cuando cambia el productoId
  useEffect(() => {
    if (!productoId) return;

    // Generar ID único para este request
    const requestId = `producto-${productoId}-${Date.now()}`;
    currentRequestRef.current = requestId;

    setLoading(true);

    getProductById(productoId)
      .then((data) => {
        // Verificar que este request siga siendo el actual (evita race condition)
        if (currentRequestRef.current !== requestId) return;

        setProducto(data);
        setFormData({
          nombre: data.nombre,
          descripcion: data.descripcion || '',
          precio: Number(data.precio),
          tipo: data.tipo,
          activo: data.activo,
          fecha_inicio: data.fecha_inicio?.split('T')[0] || '',
          fecha_fin: data.fecha_fin?.split('T')[0] || '',
          cupo_maximo: data.cupo_maximo ?? undefined,
        });
        setError(null);
      })
      .catch((err) => {
        // Solo actualizar estado si el request sigue siendo actual
        if (currentRequestRef.current !== requestId) return;

        console.error('Error al cargar producto:', err);
        setError('Error al cargar el producto');
      })
      .finally(() => {
        // Solo actualizar loading si el request sigue siendo actual
        if (currentRequestRef.current === requestId) {
          setLoading(false);
        }
      });

    // Cleanup: invalidar el request anterior
    return () => {
      currentRequestRef.current = null;
    };
  }, [productoId]);

  // Función para recargar el producto (usada después de guardar)
  const fetchProducto = async () => {
    if (!productoId) return;

    const requestId = `producto-${productoId}-${Date.now()}`;
    currentRequestRef.current = requestId;

    setLoading(true);

    try {
      const data = await getProductById(productoId);
      if (currentRequestRef.current !== requestId) return;

      setProducto(data);
      setFormData({
        nombre: data.nombre,
        descripcion: data.descripcion || '',
        precio: Number(data.precio),
        tipo: data.tipo,
        activo: data.activo,
        fecha_inicio: data.fecha_inicio?.split('T')[0] || '',
        fecha_fin: data.fecha_fin?.split('T')[0] || '',
        cupo_maximo: data.cupo_maximo ?? undefined,
      });
      setError(null);
    } catch (err) {
      if (currentRequestRef.current !== requestId) return;
      console.error('Error al cargar producto:', err);
      setError('Error al cargar el producto');
    } finally {
      if (currentRequestRef.current === requestId) {
        setLoading(false);
      }
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await updateProduct(productoId, {
        nombre: formData.nombre,
        descripcion: formData.descripcion,
        precio: formData.precio,
        activo: formData.activo,
        fecha_inicio: formData.fecha_inicio || undefined,
        fecha_fin: formData.fecha_fin || undefined,
        cupo_maximo: formData.cupo_maximo,
      });
      toast.success('Producto actualizado');
      fetchProducto();
    } catch (err) {
      console.error('Error al guardar:', err);
      toast.error('Error al guardar cambios');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('¿Desactivar este producto?')) return;
    try {
      await deleteProduct(productoId);
      toast.success('Producto desactivado');
      router.push('/admin/productos');
    } catch (err) {
      console.error('Error al eliminar:', err);
      toast.error('Error al eliminar producto');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-[var(--admin-accent)]" />
      </div>
    );
  }

  if (error || !producto) {
    return (
      <div className="p-8">
        <button
          onClick={() => router.push('/admin/productos')}
          className="flex items-center gap-2 text-[var(--admin-text-muted)] hover:text-[var(--admin-text)] mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver a productos
        </button>
        <div className="p-6 bg-[var(--status-error-muted)] rounded-xl text-[var(--status-error)]">
          {error || 'Producto no encontrado'}
        </div>
      </div>
    );
  }

  const showComisiones = producto.tipo === 'Curso' || producto.tipo === 'Evento';

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push('/admin/productos')}
            className="p-2 rounded-lg hover:bg-[var(--admin-surface-2)] transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-[var(--admin-text-muted)]" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-[var(--admin-text)]">{producto.nombre}</h1>
            <p className="text-sm text-[var(--admin-text-muted)]">
              {producto.tipo} - {producto.activo ? 'Activo' : 'Inactivo'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleDelete}
            className="flex items-center gap-2 px-4 py-2 text-[var(--status-error)] hover:bg-[var(--status-error-muted)] rounded-lg transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            Eliminar
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2 bg-[var(--admin-accent)] text-black rounded-lg font-medium hover:opacity-90 disabled:opacity-50"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Guardar
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-4 gap-4">
        <div className="p-4 bg-[var(--admin-surface-1)] border border-[var(--admin-border)] rounded-xl">
          <div className="flex items-center gap-2 text-[var(--admin-text-muted)] mb-2">
            <DollarSign className="w-4 h-4" />
            <span className="text-xs">Precio</span>
          </div>
          <p className="text-xl font-bold text-[var(--status-success)]">
            {formatCurrency(Number(producto.precio))}
          </p>
        </div>
        <div className="p-4 bg-[var(--admin-surface-1)] border border-[var(--admin-border)] rounded-xl">
          <div className="flex items-center gap-2 text-[var(--admin-text-muted)] mb-2">
            <Package className="w-4 h-4" />
            <span className="text-xs">Tipo</span>
          </div>
          <p className="text-xl font-bold text-[var(--admin-text)]">{producto.tipo}</p>
        </div>
        <div className="p-4 bg-[var(--admin-surface-1)] border border-[var(--admin-border)] rounded-xl">
          <div className="flex items-center gap-2 text-[var(--admin-text-muted)] mb-2">
            <Users className="w-4 h-4" />
            <span className="text-xs">Cupo</span>
          </div>
          <p className="text-xl font-bold text-[var(--admin-text)]">
            {producto.cupo_maximo ?? 'Sin limite'}
          </p>
        </div>
        <div className="p-4 bg-[var(--admin-surface-1)] border border-[var(--admin-border)] rounded-xl">
          <div className="flex items-center gap-2 text-[var(--admin-text-muted)] mb-2">
            <Calendar className="w-4 h-4" />
            <span className="text-xs">Periodo</span>
          </div>
          <p className="text-sm font-medium text-[var(--admin-text)]">
            {producto.fecha_inicio
              ? new Date(producto.fecha_inicio).toLocaleDateString('es-AR')
              : 'Sin fecha'}
          </p>
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-3 gap-6">
        {/* Left: Product Form */}
        <div className="col-span-1 space-y-4">
          <div className="p-5 bg-[var(--admin-surface-1)] border border-[var(--admin-border)] rounded-xl">
            <h2 className="text-lg font-semibold text-[var(--admin-text)] mb-4">
              Datos del Producto
            </h2>

            <div className="space-y-4">
              {/* Nombre */}
              <div>
                <label className="block text-sm font-medium text-[var(--admin-text)] mb-1.5">
                  Nombre
                </label>
                <input
                  type="text"
                  value={formData.nombre}
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                  className="w-full px-3 py-2.5 bg-[var(--admin-surface-2)] border border-[var(--admin-border)] rounded-lg text-[var(--admin-text)] focus:outline-none focus:ring-2 focus:ring-[var(--admin-accent)]"
                />
              </div>

              {/* Descripcion */}
              <div>
                <label className="block text-sm font-medium text-[var(--admin-text)] mb-1.5">
                  Descripcion
                </label>
                <textarea
                  value={formData.descripcion}
                  onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2.5 bg-[var(--admin-surface-2)] border border-[var(--admin-border)] rounded-lg text-[var(--admin-text)] focus:outline-none focus:ring-2 focus:ring-[var(--admin-accent)] resize-none"
                />
              </div>

              {/* Precio */}
              <div>
                <label className="block text-sm font-medium text-[var(--admin-text)] mb-1.5">
                  Precio (ARS)
                </label>
                <input
                  type="number"
                  value={formData.precio}
                  onChange={(e) => setFormData({ ...formData, precio: Number(e.target.value) })}
                  className="w-full px-3 py-2.5 bg-[var(--admin-surface-2)] border border-[var(--admin-border)] rounded-lg text-[var(--admin-text)] focus:outline-none focus:ring-2 focus:ring-[var(--admin-accent)]"
                />
              </div>

              {/* Cupo */}
              <div>
                <label className="block text-sm font-medium text-[var(--admin-text)] mb-1.5">
                  Cupo maximo
                </label>
                <input
                  type="number"
                  value={formData.cupo_maximo ?? ''}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      cupo_maximo: e.target.value ? Number(e.target.value) : undefined,
                    })
                  }
                  placeholder="Sin limite"
                  className="w-full px-3 py-2.5 bg-[var(--admin-surface-2)] border border-[var(--admin-border)] rounded-lg text-[var(--admin-text)] placeholder:text-[var(--admin-text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--admin-accent)]"
                />
              </div>

              {/* Fechas */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-[var(--admin-text)] mb-1.5">
                    Inicio
                  </label>
                  <input
                    type="date"
                    value={formData.fecha_inicio}
                    onChange={(e) => setFormData({ ...formData, fecha_inicio: e.target.value })}
                    className="w-full px-3 py-2.5 bg-[var(--admin-surface-2)] border border-[var(--admin-border)] rounded-lg text-[var(--admin-text)] focus:outline-none focus:ring-2 focus:ring-[var(--admin-accent)]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--admin-text)] mb-1.5">
                    Fin
                  </label>
                  <input
                    type="date"
                    value={formData.fecha_fin}
                    onChange={(e) => setFormData({ ...formData, fecha_fin: e.target.value })}
                    className="w-full px-3 py-2.5 bg-[var(--admin-surface-2)] border border-[var(--admin-border)] rounded-lg text-[var(--admin-text)] focus:outline-none focus:ring-2 focus:ring-[var(--admin-accent)]"
                  />
                </div>
              </div>

              {/* Activo */}
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.activo}
                  onChange={(e) => setFormData({ ...formData, activo: e.target.checked })}
                  className="w-4 h-4 rounded border-[var(--admin-border)] bg-[var(--admin-surface-2)] text-[var(--admin-accent)]"
                />
                <span className="text-sm text-[var(--admin-text)]">Producto activo</span>
              </label>
            </div>
          </div>
        </div>

        {/* Right: Comisiones */}
        <div className="col-span-2">
          {showComisiones ? (
            <div className="p-5 bg-[var(--admin-surface-1)] border border-[var(--admin-border)] rounded-xl">
              <ComisionesSection productoId={productoId} productoNombre={producto.nombre} />
            </div>
          ) : (
            <div className="p-8 bg-[var(--admin-surface-1)] border border-[var(--admin-border)] rounded-xl text-center">
              <Package className="w-12 h-12 text-[var(--admin-text-muted)] mx-auto mb-3" />
              <p className="text-[var(--admin-text-muted)]">
                Las comisiones solo estan disponibles para productos de tipo Curso o Evento
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
