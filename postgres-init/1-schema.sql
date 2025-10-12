-- =====================================
-- Creación de la base de datos
-- =====================================
\c stockly;

-- =====================================
-- Tablas base
-- =====================================
CREATE TABLE marca (
    id_marca SERIAL PRIMARY KEY,
    nombre_marca VARCHAR(100) NOT NULL
);

CREATE TABLE tipo_categoria (
    id_categoria SERIAL PRIMARY KEY,
    nombre_categoria VARCHAR(100) NOT NULL
);

CREATE TABLE tipo_usuario (
    id_tipo SERIAL PRIMARY KEY,
    nombre_tipo VARCHAR(50) NOT NULL
);

CREATE TABLE tipo_documento_tributario (
    id_tipo SERIAL PRIMARY KEY,
    nombre_tipo VARCHAR(50) NOT NULL
);

-- =====================================
-- Tablas principales
-- =====================================
CREATE TABLE producto (
    sku VARCHAR(50) PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    id_categoria INT NOT NULL,
    id_marca INT NOT NULL,
    precio_venta NUMERIC(10,2) NOT NULL,
    precio_compra NUMERIC(10,2) NOT NULL,
    stock INT NOT NULL,
    FOREIGN KEY (id_categoria) REFERENCES tipo_categoria(id_categoria),
    FOREIGN KEY (id_marca) REFERENCES marca(id_marca)
);

CREATE TABLE cliente (
    id_cliente SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    telefono VARCHAR(20)
);

CREATE TABLE usuario (
    id_usuario SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    activo BOOLEAN DEFAULT TRUE,
    id_tipo INT NOT NULL,
    FOREIGN KEY (id_tipo) REFERENCES tipo_usuario(id_tipo)
);

CREATE TABLE pago (
    id_pago SERIAL PRIMARY KEY,
    monto_efectivo NUMERIC(10,2) DEFAULT 0,
    monto_tarjeta NUMERIC(10,2) DEFAULT 0
);

CREATE TABLE compra (
    id_compra SERIAL PRIMARY KEY,
    fecha DATE NOT NULL,
    total NUMERIC(10,2) NOT NULL,
    id_cliente INT NOT NULL,
    id_pago INT NOT NULL,
    FOREIGN KEY (id_cliente) REFERENCES cliente(id_cliente),
    FOREIGN KEY (id_pago) REFERENCES pago(id_pago)
);

CREATE TABLE detalle_compra (
    sku VARCHAR(50) NOT NULL,
    id_compra INT NOT NULL,
    cantidad INT NOT NULL,
    subtotal NUMERIC(10,2) NOT NULL,
    PRIMARY KEY (sku, id_compra),
    FOREIGN KEY (sku) REFERENCES producto(sku),
    FOREIGN KEY (id_compra) REFERENCES compra(id_compra)
);

CREATE TABLE documento_tributario (
    id_documento SERIAL PRIMARY KEY,
    id_compra INT NOT NULL,
    id_tipo INT NOT NULL,
    FOREIGN KEY (id_compra) REFERENCES compra(id_compra),
    FOREIGN KEY (id_tipo) REFERENCES tipo_documento_tributario(id_tipo)
);