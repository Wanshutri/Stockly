"use client";

import { Autocomplete, Button, TextField, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import { useForm, Controller, SubmitHandler } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { ProductoType } from "@/types/db";

// ---------- Conversión segura a número ----------
const toNumber = (val: unknown) => {
    if (val === "" || val === null || val === undefined) return undefined;
    const num = Number(val);
    return Number.isFinite(num) ? num : NaN;
};

// ---------- Campo numérico con validación ----------
const numericField = (label: string, positive = false) =>
    z.preprocess(toNumber, z.number().optional())
        .refine((val) => val !== undefined, { message: `${label} es obligatorio` })
        .refine((val) => !isNaN(Number(val)), { message: `${label} debe ser un número válido` })
        .refine((val) => (positive ? val! > 0 : val! >= 0), {
            message: positive
                ? `${label} debe ser mayor que 0`
                : `${label} no puede ser negativo`,
        });

// ---------- Esquema de validación ----------
const itemSchema = z.object({
    sku: z.string().trim().min(1, "El SKU es obligatorio"),
    nombre: z.string().trim().min(1, "El nombre es obligatorio"),
    descripcion: z.string().trim().min(1, "La descripción es obligatoria"),
    precioVenta: numericField("Precio de venta", true),
    precioCompra: numericField("Precio de compra", true),
    stock: numericField("Stock"),
    categoria: z.object({ id: z.number(), label: z.string() })
        .nullable()
        .refine((v) => v !== null, { message: "La categoría es obligatoria" }),
    marca: z.object({ id: z.number(), label: z.string() })
        .nullable()
        .refine((v) => v !== null, { message: "La marca es obligatoria" }),
});

type ItemForm = z.infer<typeof itemSchema>;

export default function ProductoForm({ item }: { item?: ProductoType }) {
    const [categorias, setCategorias] = useState<any[]>([]);
    const [marcas, setMarcas] = useState<any[]>([]);
    const [serverError, setServerError] = useState<string | null>(null);

    const { control, handleSubmit, formState: { errors }, reset } = useForm<ItemForm>({
        resolver: zodResolver(itemSchema),
        defaultValues: {
            sku: item?.producto?.sku || "",
            nombre: item?.producto?.nombre || "",
            descripcion: item?.producto?.descripcion || "",
            precioVenta: item?.producto?.precio_venta || "",
            precioCompra: item?.producto?.precio_compra || "",
            stock: item?.producto?.stock || "",
            categoria: item?.producto?.tipo_categoria
                ? {
                    id: item.producto.tipo_categoria.id_categoria,
                    label: item.producto.tipo_categoria.nombre_categoria,
                }
                : null,
            marca: item?.producto?.marca
                ? { id: item.producto.marca.id_marca, label: item.producto.marca.nombre_marca }
                : null,
        },

    });

    // ---------- Envío del formulario ----------
    const onSubmit: SubmitHandler<ItemForm> = async (data) => {
        setServerError(null); // limpiar errores anteriores
        try {
            const res = await fetch(`/api/productos${item ? "/" + item.sku : ""}`, {
                method: item ? "PUT" : "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    sku: data.sku,
                    nombre: data.nombre,
                    descripcion: data.descripcion,
                    precio_venta: data.precioVenta,
                    precio_compra: data.precioCompra,
                    stock: data.stock,
                    id_categoria: data.categoria?.id,
                    id_marca: data.marca?.id,
                }),
            });

            if (!res.ok) {
                const err = await res.json().catch(() => ({}));
                setServerError(err.error || "Error al crear el producto. Intenta nuevamente.");
                return;
            }
            window.location.reload();
            reset();
        } catch (error) {
            console.error("Error en la solicitud:", error);
            setServerError("Error de conexión con el servidor. Verifica tu red.");
        }
    };



    useEffect(() => {
        const fetchData = async () => {
            try {
                // Traer categorías y marcas
                const [catRes, marRes] = await Promise.all([
                    fetch("/api/categorias").then(r => r.json()),
                    fetch("/api/marcas").then(r => r.json()),
                ]);
                setCategorias(catRes.categorias || []);
                setMarcas(marRes.marcas || []);

                // Si item existe, traer sus datos actualizados
                if (item) {
                    const res = await fetch(`/api/productos/${item.sku}`);
                    if (!res.ok) throw new Error("Error al obtener el producto");
                    const data: ProductoType = await res.json();

                    // Setear los valores del formulario con reset
                    reset({
                        sku: data.producto.sku,
                        nombre: data.producto.nombre,
                        descripcion: data.producto.descripcion,
                        precioVenta: data.producto.precio_venta,
                        precioCompra: data.producto.precio_compra,
                        stock: data.producto.stock,
                        categoria: data.producto.tipo_categoria
                            ? {
                                id: data.producto.tipo_categoria.id_categoria,
                                label: data.producto.tipo_categoria.nombre_categoria,
                            }
                            : null,
                        marca: data.producto.marca
                            ? { id: data.producto.marca.id_marca, label: data.producto.marca.nombre_marca }
                            : null,
                    });

                }
            } catch (error) {
                console.error(error);
                setCategorias([]);
                setMarcas([]);
            }
        };

        fetchData();
    }, [item, reset]);


    // ---------- Render ----------
    return (
        <div>
            <h3 className="text-2xl font-semibold mb-4">Producto</h3>

            <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4">
                {/* SKU */}
                <Controller
                    name="sku"
                    control={control}
                    render={({ field }) => (
                        <TextField
                            {...field}
                            label="SKU"
                            variant="outlined"
                            error={!!errors.sku}
                            helperText={errors.sku?.message}
                            fullWidth
                            disabled={item ? true : false}
                        />
                    )}
                />

                {/* Nombre */}
                <Controller
                    name="nombre"
                    control={control}
                    render={({ field }) => (
                        <TextField
                            {...field}
                            label="Nombre"
                            variant="outlined"
                            error={!!errors.nombre}
                            helperText={errors.nombre?.message}
                            fullWidth
                        />
                    )}
                />

                {/* Precio Venta / Compra */}
                <div className="grid md:grid-cols-2 gap-4">
                    <Controller
                        name="precioVenta"
                        control={control}
                        render={({ field }) => (
                            <TextField
                                {...field}
                                type="number"
                                label="Precio de Venta"
                                variant="outlined"
                                error={!!errors.precioVenta}
                                helperText={errors.precioVenta?.message}
                                fullWidth
                                value={field.value ?? ""}
                                onChange={(e) => field.onChange(e.target.value)}
                            />
                        )}
                    />

                    <Controller
                        name="precioCompra"
                        control={control}
                        render={({ field }) => (
                            <TextField
                                {...field}
                                type="number"
                                label="Precio de Compra"
                                variant="outlined"
                                error={!!errors.precioCompra}
                                helperText={errors.precioCompra?.message}
                                fullWidth
                                value={field.value ?? ""}
                                onChange={(e) => field.onChange(e.target.value)}
                            />
                        )}
                    />
                </div>

                {/* Stock */}
                <Controller
                    name="stock"
                    control={control}
                    render={({ field }) => (
                        <TextField
                            {...field}
                            type="number"
                            label="Stock"
                            variant="outlined"
                            error={!!errors.stock}
                            helperText={errors.stock?.message}
                            fullWidth
                            value={field.value ?? ""}
                            onChange={(e) => field.onChange(e.target.value)}
                        />
                    )}
                />

                {/* Categoría / Marca */}
                <div className="grid md:grid-cols-2 gap-4">
                    <Controller
                        name="categoria"
                        control={control}
                        render={({ field }) => (
                            <Autocomplete
                                disablePortal
                                options={categorias.map((c) => ({
                                    label: c.nombre_categoria,
                                    id: c.id_categoria,
                                }))}
                                value={field.value}
                                onChange={(_, val) => field.onChange(val)}
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        label="Categoría"
                                        error={!!errors.categoria}
                                        helperText={errors.categoria?.message}
                                    />
                                )}
                            />
                        )}
                    />

                    <Controller
                        name="marca"
                        control={control}
                        render={({ field }) => (
                            <Autocomplete
                                disablePortal
                                options={marcas.map((m) => ({
                                    label: m.nombre_marca,
                                    id: m.id_marca,
                                }))}
                                value={field.value}
                                onChange={(_, val) => field.onChange(val)}
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        label="Marca"
                                        error={!!errors.marca}
                                        helperText={errors.marca?.message}
                                    />
                                )}
                            />
                        )}
                    />
                </div>

                {/* Descripción */}
                <Controller
                    name="descripcion"
                    control={control}
                    render={({ field }) => (
                        <TextField
                            {...field}
                            label="Descripción"
                            variant="outlined"
                            multiline
                            rows={3}
                            error={!!errors.descripcion}
                            helperText={errors.descripcion?.message}
                            fullWidth
                        />
                    )}
                />

                {/* Botón */}
                <div className="flex flex-col items-center pt-3">
                    <Button type="submit" variant="contained">
                        {item ? "Actualizar Producto" : "Crear Producto"}
                    </Button>

                    {/* Error externo */}
                    <p className="text-red-500 mt-1">
                        {serverError || "ㅤ"}
                    </p>
                </div>
            </form>
        </div>
    );
}
