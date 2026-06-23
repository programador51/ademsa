import Swal from "sweetalert2";

export async function confirmDelete(
  itemLabel = "este registro"
): Promise<boolean> {
  const result = await Swal.fire({
    title: "¿Eliminar registro?",
    text: `¿Estás seguro de eliminar ${itemLabel}? Esta acción no se puede deshacer.`,
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Sí, eliminar",
    cancelButtonText: "Cancelar",
    confirmButtonColor: "#d32f2f",
    reverseButtons: true,
  });
  return result.isConfirmed;
}

export function showCreateSuccess(entityLabel = "El registro"): void {
  void Swal.fire({
    title: "¡Éxito!",
    text: `${entityLabel} fue agregado correctamente al sistema.`,
    icon: "success",
    timer: 2500,
    showConfirmButton: false,
  });
}
