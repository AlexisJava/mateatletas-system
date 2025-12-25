/**
 * Admin Loading - Skeleton para rutas admin
 */
export default function AdminLoading() {
  return (
    <div className="flex items-center justify-center h-[60vh]">
      <div className="text-center">
        <div className="w-10 h-10 border-2 border-[var(--admin-accent)] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-sm text-[var(--admin-text-muted)]">Cargando...</p>
      </div>
    </div>
  );
}
