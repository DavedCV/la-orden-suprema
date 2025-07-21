import React from "react";
import { AlertTriangle, Trash2 } from "lucide-react";
import { Button } from "../../../shared/components/Button";
import { LoadingSpinner } from "../../../shared/components/LoadingSpinner";

interface DeleteConfirmationModalProps {
  assassinName: string;
  onConfirm: () => void;
  onCancel: () => void;
  isDeleting?: boolean;
}

export const DeleteConfirmationModal: React.FC<
  DeleteConfirmationModalProps
> = ({ assassinName, onConfirm, onCancel, isDeleting = false }) => {
  return (
    <div className="fixed inset-0 bg-black/75 flex items-center justify-center z-60 p-4">
      <div className="bg-orden-800 rounded-lg w-full max-w-md border border-red-500/20">
        <div className="p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-red-500/20 rounded-full flex items-center justify-center">
              <AlertTriangle className="h-5 w-5 text-red-400" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-orden-100">
                Eliminar Asesino
              </h3>
              <p className="text-orden-400 text-sm">
                Esta acción no se puede deshacer
              </p>
            </div>
          </div>

          <p className="text-orden-300 mb-6">
            ¿Estás seguro de que quieres eliminar a{" "}
            <strong>{assassinName}</strong> del sistema? Toda su información y
            historial se perderá permanentemente.
          </p>

          <div className="flex justify-end space-x-3">
            <Button variant="ghost" onClick={onCancel} disabled={isDeleting}>
              Cancelar
            </Button>
            <Button
              onClick={onConfirm}
              disabled={isDeleting}
              className="bg-red-500 hover:bg-red-600 text-white"
            >
              {isDeleting ? (
                <>
                  <LoadingSpinner size="sm" className="mr-2" />
                  Eliminando...
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Eliminar
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
