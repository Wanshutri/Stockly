import { Autocomplete, TextField, Button } from "@mui/material";
import { useEffect, useState } from "react";
import NumberField from "./NumberField";
import Toastify from 'toastify-js'
import { any } from "zod";

export default function ProductoForm({ item, onSuccess }: { item?: Producto, onSuccess?: () => void }) {
    const [categorias, setCategorias] = useState<Categoria[]>([]);
    const [marcas, setMarcas] = useState<Marca[]>([]);

    // estados controlados
    const [precioVenta, setPrecioVenta] = useState<number | "">(
        () => (item ? item.precio_venta : "")
    );
    const [precioCompra, setPrecioCompra] = useState<number | "">(
        () => (item ? item.precio_compra : "")
    );
    const [stock, setStock] = useState<number | "">(() => (item ? item.stock : ""));

    const [gtin, setGtin] = useState<string>("");

    const [nombre, setNombre] = useState<string>("");

    const [skuOriginal, setSkuOriginal] = useState<string>("");
    const [skuFinal, setSkuFinal] = useState<string>("");

    const [selectedCategoria, setSelectedCategoria] = useState<Categoria | null>(null);
    const [selectedMarca, setSelectedMarca] = useState<Marca | null>(null);

    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");

    // Función helper para parsear número seguro
    const parseNumber = (value: string): number | "" => {
        const n = Number(value);
        return isNaN(n) ? "" : n;
    };

    useEffect(() => {
        const loadData = async () => {
            try {
                const resCat = await fetch("/api/categorias");
                const resMar = await fetch("/api/marcas");

                const dataCat: Categoria[] = await resCat.json();
                const dataMar: Marca[] = await resMar.json();

                setCategorias(dataCat);
                setMarcas(dataMar);

                if (item) {
                    const cat: Categoria | null =
                        dataCat.find((c: Categoria) => c.nombre_categoria === (item as any).tipo_categoria) ?? null;
                    const mar: Marca | null =
                        dataMar.find((m: any) => m.nombre_marca === item?.marca) ?? null;

                    setSelectedCategoria(cat || null);
                    setSelectedMarca(mar || null);
                }
            } catch (err) {
                console.error("Error cargando datos", err);
            }
        };

        loadData();
    }, []);

    // sincronizar cuando cambie item
    useEffect(() => {
        setPrecioVenta(item ? item.precio_venta : "");
        setPrecioCompra(item ? item.precio_compra : "");
        setStock(item ? item.stock : "");
        setGtin(item ? item.gtin || "" : "");
        setSkuOriginal(item ? item.sku || "" : "");
        setSkuFinal(item ? item.sku || "" : "");
        setNombre(item ? item.nombre || "" : "");
        // si item es undefined, esto resetea (útil cuando el componente queda montado)
    }, [item]);

    const resetFormFields = () => {
        setPrecioVenta("");
        setPrecioCompra("");
        setStock("");
        setGtin("");
        setSkuOriginal("");
        setSkuFinal("");
        setNombre("");
        setSelectedCategoria(null);
        setSelectedMarca(null);
        setErrorMsg("");
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMsg("");
        setLoading(true);

        // Validaciones
        if (!skuFinal.trim()) {
            setErrorMsg("El SKU es obligatorio");
            setLoading(false);
            return;
        }
        if (!nombre.trim()) {
            setErrorMsg("El nombre es obligatorio");
            setLoading(false);
            return;
        }

        if (skuFinal.trim().length <= 2) {
            setErrorMsg("El SKU debe tener un largo mínimo de 3");
            setLoading(false);
            return;
        }

        if (nombre.trim().length <= 2) {
            setErrorMsg("El nombre debe tener un largo mínimo de 3");
            setLoading(false);
            return;
        }

        if (precioVenta === "" || Number(precioVenta) <= 0) {
            setErrorMsg("El precio de venta debe ser mayor a 0");
            setLoading(false);
            return;
        }
        if (precioCompra === "" || Number(precioCompra) <= 0) {
            setErrorMsg("El precio de compra debe ser mayor a 0");
            setLoading(false);
            return;
        }
        if (stock === "" || Number(stock) < 0) {
            setErrorMsg("El stock debe ser 0 o mayor");
            setLoading(false);
            return;
        }
        if (!selectedCategoria) {
            setErrorMsg("Debes seleccionar una categoría");
            setLoading(false);
            return;
        }
        if (!selectedMarca) {
            setErrorMsg("Debes seleccionar una marca");
            setLoading(false);
            return;
        }

        try {
            const payload = {
                sku: skuFinal.trim(),
                gtin: gtin.trim() || null,
                nombre: nombre.trim(),
                precio_venta: Number(precioVenta),
                precio_compra: Number(precioCompra),
                stock: Number(stock),
                id_categoria: Number(selectedCategoria.id_categoria),
                id_marca: Number(selectedMarca.id_marca)
            };

            const method = item ? "PUT" : "POST";
            const url = item ? `/api/productos/${skuOriginal}` : `/api/productos`;

            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });

            if (!res.ok) {
                const errorData = await res.json();
                console.log(errorData)
                setErrorMsg("Error al guardar el producto: " + (errorData.error || JSON.stringify(errorData.error)));
                return;
            }

            Toastify({
                text: item ? "Producto Actualizado Correctamente" : "Producto Creado Correctamente",
                gravity: "bottom",
                position: "right",
                duration: 3000

            }).showToast();

            // Si es creación (no viene item), reseteo los campos para el siguiente uso
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
        <form onSubmit={handleSubmit} className="h-min py-5">
            <div className="grid gap-y-5">
                <div>
                    <TextField
                        fullWidth
                        label="SKU"
                        value={skuFinal}
                        onChange={(e) => setSkuFinal(e.target.value)}
                        variant="outlined"
                    />
                </div>

                <div>
                    <TextField
                        fullWidth
                        label="Nombre de Producto"
                        value={nombre}
                        onChange={(e) => setNombre(e.target.value)}
                        variant="outlined"
                    />
                </div>

                <div className="grid md:grid-cols-2 md:gap-x-5 gap-y-5">
                    <div className="w-full">
                        <NumberField
                            label="Precio Venta"
                            min={0}
                            value={Number(precioVenta)}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                setPrecioVenta(parseNumber(e.target.value));
                            }}
                            error=""
                        />
                    </div>

                    <div className="w-full">
                        <NumberField
                            label="Precio Compra"
                            min={0}
                            value={Number(precioCompra)}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                setPrecioCompra(parseNumber(e.target.value));
                            }}
                            error=""
                        />
                    </div>
                </div>

                <div className="grid md:grid-cols-2 md:gap-x-5 gap-y-5">
                    <div>
                        <Autocomplete
                            disablePortal
                            options={categorias}
                            value={selectedCategoria}
                            onChange={(_, v) => setSelectedCategoria(v)}
                            getOptionLabel={(option) => option.nombre_categoria || ""}
                            renderInput={(params) => (
                                <TextField {...params} label="Categorías" />
                            )}
                        />
                    </div>

                    <div>
                        <Autocomplete
                            disablePortal
                            options={marcas}
                            value={selectedMarca}
                            onChange={(_, v) => setSelectedMarca(v)}
                            getOptionLabel={(option) => option.nombre_marca || ""}
                            renderInput={(params) => (
                                <TextField {...params} label="Marcas" />
                            )}
                        />
                    </div>

                    <div className="md:col-span-2 w-full">
                        <NumberField
                            label="Stock"
                            min={0}
                            value={Number(stock)}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                setStock(parseNumber(e.target.value));
                            }}
                            error=""
                        />
                    </div>
                    <div className="md:col-span-2 w-full">
                        <TextField
                            fullWidth
                            label="GTIN (opcional)"
                            value={gtin}
                            onChange={(e) => setGtin(e.target.value)}
                            variant="outlined"
                        />
                    </div>
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
                    {loading ? "Guardando..." : "Guardar Producto"}
                </Button>
            </div>
        </form>
    );
}
