import { Button } from '@/components/ui';
import { Producto } from '@/lib/api/catalogo.api';

interface DeleteConfirmDialogProps {
  product: Producto | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (hardDelete: boolean) => void;
}

export const DeleteConfirmDialog: React.FC<DeleteConfirmDialogProps> = ({
  product,
  isOpen,
  onClose,
  onConfirm,
}) => {
  if (!isOpen || !product) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-6 max-w-md w-full shadow-xl">
        <h3 className="text-xl font-bold text-[#2a1a5e] mb-4">¿Eliminar producto?</h3>
        <p className="text-gray-600 mb-2">
          Estás por eliminar el producto <strong>{product.nombre}</strong>
        </p>
        <p className="text-sm text-gray-500 mb-6">
          Podés desactivarlo (soft delete) o eliminarlo permanentemente de la base de datos.
        </p>
        <div className="flex flex-col gap-3">
          <Button
            variant="outline"
            onClick={() => onConfirm(false)}
            className="w-full"
          >
            Desactivar (Soft Delete)
          </Button>
          <Button
            variant="primary"
            onClick={() => onConfirm(true)}
            className="w-full bg-red-500 hover:bg-red-600"
          >
            Eliminar Permanentemente
          </Button>
          <Button variant="outline" onClick={onClose} className="w-full">
            Cancelar
          </Button>
        </div>
      </div>
    </div>
  );
};
