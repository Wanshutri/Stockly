import Swal from 'sweetalert2'
import Toastify from 'toastify-js'
import 'toastify-js/src/toastify.css'

async function deleteRows(url: string, rows: any[], deletionKey: string) {
    try {
        for (const row of rows) {
            const idValue = row[deletionKey]
            if (idValue === undefined) throw new Error(`La fila no tiene la propiedad ${deletionKey}`)

            const response = await fetch(`${url}/${idValue}`, {
                method: 'DELETE',
            })

            if (!response.ok) throw new Error(`Error al eliminar ${row.sku ?? idValue}`)
        }
        return true
    } catch (error) {
        console.error(error)
        return false
    }
}

export default function OpenPopUp(
    rows: any[],
    url: string,
    name: string,
    deletionKey: string,
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
            const success = await deleteRows(url, rows, deletionKey)

            if (success) {
                if (onSuccess) onSuccess()

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
                    text: 'Ocurrió un problema al eliminar los registros.',
                    icon: 'error',
                })
            }
        }
    })
}
