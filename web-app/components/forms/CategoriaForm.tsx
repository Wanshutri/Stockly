"use client";

import { Button, TextField } from "@mui/material";
import { useState } from "react";
import { useForm, Controller, SubmitHandler } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

// ---------- Esquema de validación ----------
const categoriaSchema = z.object({
    nombre: z.string().trim().min(1, "El nombre de la categoría es obligatorio"),
});

type CategoriaFormType = z.infer<typeof categoriaSchema>;

// ---------- Formulario ----------
export default function CategoriaForm({ item }: { item?: { nombre_categoria: string; id_categoria?: number } }) {
    const [serverError, setServerError] = useState<string | null>(null);

    const { control, handleSubmit, formState: { errors }, reset } = useForm<CategoriaFormType>({
        resolver: zodResolver(categoriaSchema),
        defaultValues: {
            nombre: item?.nombre_categoria || "",
        },
    });

    const onSubmit: SubmitHandler<CategoriaFormType> = async (data) => {
        setServerError(null);

        try {
            const res = await fetch(`/api/categorias${item ? "/" + item?.id_categoria : ""}`, {
                method: item ? "PUT" : "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    nombre_categoria: data.nombre
                }),
            });

            if (!res.ok) {
                const err = await res.json().catch(() => ({}));
                setServerError(err.error || "Error al guardar la categoría. Intenta nuevamente.");
                return;
            }

            reset();
            window.location.reload();
        } catch (error) {
            console.error("Error en la solicitud:", error);
            setServerError("Error de conexión con el servidor.");
        }
    };

    return (
        <div>
            <h3 className="text-2xl font-semibold mb-4">
                {item ? "Editar Categoría" : "Nueva Categoría"}
            </h3>

            <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4">
                <Controller
                    name="nombre"
                    control={control}
                    render={({ field }) => (
                        <TextField
                            {...field}
                            label="Nombre de la Categoría"
                            variant="outlined"
                            error={!!errors.nombre}
                            helperText={errors.nombre?.message}
                            fullWidth
                        />
                    )}
                />

                <div className="flex flex-col items-center pt-3">
                    <Button type="submit" variant="contained">
                        {item ? "Actualizar" : "Crear"}
                    </Button>

                    <p className="text-red-500 mt-1">
                        {serverError || "ㅤ"}
                    </p>
                </div>
            </form>
        </div>
    );
}
