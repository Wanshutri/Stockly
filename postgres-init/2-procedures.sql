CREATE OR REPLACE FUNCTION eliminar_marca(p_id INT)
RETURNS TABLE(
    id_marca INT,
    nombre_marca VARCHAR
)
LANGUAGE plpgsql AS $$
DECLARE
    _id_marca INT;
    _nombre_marca VARCHAR;
BEGIN
    -- Validar existencia y guardar en variables internas
    SELECT id_marca, nombre_marca
    INTO _id_marca, _nombre_marca
    FROM marca
    WHERE id_marca = p_id;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'No se puede eliminar: la marca con id % no existe', p_id
            USING ERRCODE = 'NO_DATA_FOUND';
    END IF;

    -- Validar que no existan productos asociados
    IF EXISTS (SELECT 1 FROM producto WHERE id_marca = p_id) THEN
        RAISE EXCEPTION 'No se puede eliminar marca %: existen productos asociados', p_id
            USING ERRCODE = 'foreign_key_violation';
    END IF;

    -- Eliminar la marca
    DELETE FROM marca
    WHERE id_marca = p_id;

    -- Retornar la marca eliminada
    RETURN QUERY
    SELECT _id_marca, _nombre_marca;
END;
$$;
