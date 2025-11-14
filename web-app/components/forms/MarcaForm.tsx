"use client";

import { Button, TextField } from "@mui/material";
import { useState } from "react";
import { useForm, Controller, SubmitHandler } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

// ---------- Esquema de validación ----------
const marcaSchema = z.object({
    nombre: z.string().trim().min(1, "El nombre de la marca es obligatorio"),
});

type MarcaFormType = z.infer<typeof marcaSchema>;

// ---------- Formulario ----------
export default function MarcaForm({ item }: { item?: { nombre_marca: string, id_marca : number } }) {
    const [serverError, setServerError] = useState<string | null>(null);

    const { control, handleSubmit, formState: { errors }, reset } = useForm<MarcaFormType>({
        resolver: zodResolver(marcaSchema),
        defaultValues: {
            nombre: item?.nombre_marca || "",
        },
    });

    const onSubmit: SubmitHandler<MarcaFormType> = async (data) => {
        setServerError(null);

        try {
            console.log(data)
            const res = await fetch(`/api/marcas${item ? "/" + item?.id_marca : ""}`, {
                method: item ? "PUT" : "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    nombre_marca: data.nombre
                }),
            });

            if (!res.ok) {
                const err = await res.json().catch(() => ({}));
                setServerError(err.error || "Error al guardar la marca. Intenta nuevamente.");
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
                {item ? "Editar Marca" : "Nueva Marca"}
            </h3>

            <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4">
                <Controller
                    name="nombre"
                    control={control}
                    render={({ field }) => (
                        <TextField
                            {...field}
                            label="Nombre de la Marca"
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
