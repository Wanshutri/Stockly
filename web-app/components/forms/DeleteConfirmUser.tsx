import Swal from 'sweetalert2'
import Toastify from 'toastify-js'
import 'toastify-js/src/toastify.css'

type DeleteResult = {
    success: boolean
    error: Error | null
}

async function deleteRows<T extends Record<string, any>>(
    url: string,
    rows: T[],
    deletionKey: keyof T
): Promise<DeleteResult> {
    try {
        for (const row of rows) {
            const idValue = row[deletionKey]
            if (idValue === undefined)
                throw new Error(`La fila no tiene la propiedad ${String(deletionKey)}`)

            const response = await fetch(`${url}/${idValue}`, {
                method: 'DELETE',
            })

            if (response.status === 409)
                throw new Error(`No se puede eliminar porque está asociado a algún item`)

            if (!response.ok)
                throw new Error(`Error al eliminar ${('sku' in row ? row.sku : idValue)}`)
        }
        return { success: true, error: null }
    } catch (error: any) {
        return { success: false, error }
    }
}

export default function OpenPopUp<T extends Record<string, any>>(
    rows: T[],
    url: string,
    name: string,
    deletionKey: keyof T,
    onSuccess?: () => void
) {
    const n = rows.length

    Swal.fire({
        title: '¿Estás seguro?',
        text: `Se eliminará${n > 1 ? 'n' : ''} ${n} ${name}${n > 1 ? 's' : ''}. Esta acción no se puede deshacer.`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Eliminar',
        cancelButtonText: 'Cancelar',
    }).then(async (result) => {
        if (result.isConfirmed) {
            const resultDelete = await deleteRows(url, rows, deletionKey)

            if (resultDelete.success) {
                onSuccess?.()

                Toastify({
                    text: `${n} ${name}${n > 1 ? 's' : ''} eliminado${n > 1 ? 's' : ''} correctamente.`,
                    duration: 4000,
                    gravity: 'bottom',
                    position: 'right',
                    style: {
                        background: 'linear-gradient(135deg, #00b09b, #96c93d)',
                        borderRadius: '10px',
                        fontSize: '14px',
                        padding: '12px 20px',
                        textAlign: 'center',
                        color: '#fff',
                        boxShadow: '0 4px 10px rgba(0, 0, 0, 0.15)',
                    },
                }).showToast()
            } else {
                Swal.fire({
                    title: 'Error',
                    text: resultDelete.error?.message,
                    icon: 'error',
                })
            }
        }
    })
}
