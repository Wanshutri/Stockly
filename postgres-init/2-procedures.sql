CREATE OR REPLACE FUNCTION eliminar_marca(p_id_marca INT) -- Nombre del parámetro más explícito
RETURNS TABLE(
    id_marca INT,
    nombre_marca VARCHAR
)
LANGUAGE plpgsql AS $$
DECLARE
    v_id_marca INT;      -- Variables renombradas con prefijo 'v_' para consistencia
    v_nombre_marca VARCHAR; -- Variables renombradas con prefijo 'v_' para consistencia
BEGIN
    -- Validar existencia y guardar en variables internas
    SELECT id_marca, nombre_marca
    INTO v_id_marca, v_nombre_marca -- Uso de las nuevas variables
    FROM marca
    WHERE id_marca = p_id_marca; -- Uso del parámetro renombrado

    IF NOT FOUND THEN
        RAISE EXCEPTION 'No se puede eliminar: la marca con id % no existe', p_id_marca
            USING ERRCODE = 'NO_DATA_FOUND';
    END IF;

    -- Validar que no existan productos asociados
    IF EXISTS (SELECT 1 FROM producto WHERE id_marca = p_id_marca) THEN
        RAISE EXCEPTION 'No se puede eliminar marca %: existen productos asociados', p_id_marca
            USING ERRCODE = '23503'; -- Usar el código SQLSTATE oficial '23503' para foreign_key_violation
    END IF;

    -- Eliminar la marca
    DELETE FROM marca
    WHERE id_marca = p_id_marca;

    -- Retornar la marca eliminada
    RETURN QUERY
    SELECT v_id_marca, v_nombre_marca;
END;
$$;