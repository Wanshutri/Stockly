import { TextField, Button } from "@mui/material";
import { useEffect, useState } from "react";
import Toastify from 'toastify-js';

export default function ProductoForm({ item, onSuccess }: { item?: Marca, onSuccess?: () => void }) {
    const [marcaNombre, setMarcaNombre] = useState<string>(item?.nombre_marca || "");
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");

    const resetFormFields = () => {
        setMarcaNombre("");
        setErrorMsg("");
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMsg("");
        setLoading(true);

        // Validación simple
        if (!marcaNombre.trim()) {
            setErrorMsg("El nombre de la marca es obligatorio");
            setLoading(false);
            return;
        }

        if (marcaNombre.trim().length <= 3) {
            setErrorMsg("El nombre de la marca debe tener al menos 4 caracteres");
            setLoading(false);
            return;
        }

        try {
            const payload = {
                nombre_marca: marcaNombre.trim()
            };

            const method = item ? "PUT" : "POST";
            const url = item ? `/api/marcas/${item.id_marca}` : `/api/marcas`;

            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });

            if (!res.ok) {
                const errorData = await res.json();
                setErrorMsg("Error al guardar la marca: " + (errorData.error || JSON.stringify(errorData.error)));
                return;
            }

            Toastify({
                text: item ? "Marca Actualizada Correctamente" : "Marca Creada Correctamente",
                gravity: "bottom",
                position: "right",
                duration: 3000
            }).showToast();

            // Reseteo si es creación
            if (!item) {
                resetFormFields();
            }

            if (onSuccess) onSuccess();

        } catch {
            setErrorMsg("No se pudo conectar con el servidor");
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="h-120 max py-5">
            <div className="grid gap-y-5">
                <div>
                    <TextField
                        fullWidth
                        label="Nombre de la marca"
                        value={marcaNombre}
                        onChange={(e) => setMarcaNombre(e.target.value)}
                        variant="outlined"
                    />
                </div>

                {errorMsg && (
                    <p className="text-red-600 text-sm">{errorMsg}</p>
                )}

                <Button
                    type="submit"
                    variant="contained"
                    fullWidth
                    disabled={loading}
                >
                    {loading ? "Guardando..." : "Guardar Marca"}
                </Button>
            </div>
        </form>
    );
}
