import { TextField, Button } from "@mui/material";
import { useState } from "react";
import Toastify from 'toastify-js';

export default function CategoriaForm({ item, onSuccess }: { item?: Categoria, onSuccess?: () => void }) {
    const [categoriaNombre, setCategoriaNombre] = useState<string>(item?.nombre_categoria || "");
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");

    const resetFormFields = () => {
        setCategoriaNombre("");
        setErrorMsg("");
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMsg("");
        setLoading(true);

        // Validación de longitud
        if (categoriaNombre.trim().length <= 3) {
            setErrorMsg("El nombre de la categoría debe tener al menos 4 caracteres");
            setLoading(false);
            return;
        }

        try {
            const payload = {
                nombre_categoria: categoriaNombre.trim()
            };

            const method = item ? "PUT" : "POST";
            const url = item ? `/api/categorias/${item.id_categoria}` : `/api/categorias`;

            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });

            if (!res.ok) {
                const errorData = await res.json();
                setErrorMsg("Error al guardar la categoría: " + (errorData.error || JSON.stringify(errorData.error)));
                return;
            }

            Toastify({
                text: item ? "Categoría Actualizada Correctamente" : "Categoría Creada Correctamente",
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
                        label="Nombre de la categoría"
                        value={categoriaNombre}
                        onChange={(e) => setCategoriaNombre(e.target.value)}
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
                    {loading ? "Guardando..." : "Guardar Categoría"}
                </Button>
            </div>
        </form>
    );
}
