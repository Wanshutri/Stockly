-- ============================================
-- TABLA: tipo_usuario
-- ============================================
CREATE TABLE tipo_usuario (
    id_tipo SERIAL PRIMARY KEY,
    nombre_tipo VARCHAR(50) NOT NULL UNIQUE
);

-- ============================================
-- TABLA: usuario
-- ============================================
CREATE TABLE usuario (
    id_usuario SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    activo BOOLEAN DEFAULT TRUE,
    id_tipo INT NOT NULL,
    CONSTRAINT fk_tipo_usuario
        FOREIGN KEY(id_tipo) REFERENCES tipo_usuario(id_tipo)
);

-- ============================================
-- TABLA: marca
-- ============================================
CREATE TABLE marca (
    id_marca SERIAL PRIMARY KEY,
    nombre_marca VARCHAR(100) NOT NULL UNIQUE
);

-- ============================================
-- TABLA: tipo_categoria
-- ============================================
CREATE TABLE tipo_categoria (
    id_categoria SERIAL PRIMARY KEY,
    nombre_categoria VARCHAR(100) NOT NULL UNIQUE
);

-- ============================================
-- TABLA: producto
-- ============================================
CREATE TABLE producto (
    sku VARCHAR(50) PRIMARY KEY,
    gtin VARCHAR(50),
    nombre VARCHAR(255) NOT NULL,
    id_categoria INT NOT NULL,
    id_marca INT NOT NULL,
    precio_venta DECIMAL(10, 2) NOT NULL CHECK (precio_venta >= 0),
    precio_compra DECIMAL(10, 2) NOT NULL CHECK (precio_compra >= 0),
    stock INT NOT NULL DEFAULT 0 CHECK (stock >= 0),
    CONSTRAINT fk_categoria FOREIGN KEY(id_categoria) REFERENCES tipo_categoria(id_categoria),
    CONSTRAINT fk_marca FOREIGN KEY(id_marca) REFERENCES marca(id_marca)
);

-- ============================================
-- TABLA: compra
-- ============================================
CREATE TABLE compra (
    id_compra SERIAL PRIMARY KEY,
    fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    total DECIMAL(10, 2) NOT NULL CHECK (total >= 0),
    monto_tarjeta DECIMAL(10, 2) CHECK (monto_tarjeta >= 0),
    monto_efectivo DECIMAL(10, 2) CHECK (monto_efectivo >= 0)
);

-- ============================================
-- TABLA: detalle_compra
-- Conserva snapshot del producto para mantener historia precisa
-- ============================================
CREATE TABLE detalle_compra (
    id_compra INT NOT NULL,
    sku_producto VARCHAR(50) NOT NULL,
    cantidad INT NOT NULL CHECK (cantidad > 0),
    subtotal DECIMAL(10, 2) NOT NULL CHECK (subtotal >= 0),

    nombre_producto VARCHAR(255) NOT NULL,
    gtin_producto VARCHAR(50),
    precio_unitario DECIMAL(10, 2) NOT NULL CHECK (precio_unitario >= 0),
    marca_producto VARCHAR(100) NOT NULL,
    categoria_producto VARCHAR(100) NOT NULL,

    PRIMARY KEY (id_compra, sku_producto),

    CONSTRAINT fk_compra FOREIGN KEY(id_compra)
        REFERENCES compra(id_compra) ON DELETE CASCADE
);