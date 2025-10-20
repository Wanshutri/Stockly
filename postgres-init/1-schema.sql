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
    codigo_sii NUMERIC(3) PRIMARY KEY,
    nombre_tipo VARCHAR(100) NOT NULL
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
    FOREIGN KEY (id_tipo) REFERENCES tipo_documento_tributario(codigo_sii)
);


-- =====================================
-- Datos iniciales
-- =====================================
INSERT INTO tipo_usuario (nombre_tipo) VALUES
('Administrador'),
('Vendedor'),
('Bodeguero');

INSERT INTO tipo_documento_tributario (codigo_sii, nombre_tipo) VALUES
(30, 'Factura'),
(32, 'Factura de ventas y servicios no afectos o exentos de IVA'),
(35, 'Boleta'),
(38, 'Boleta exenta'),
(40, 'Liquidación Factura'),
(45, 'Factura de Compra'),
(50, 'Guía de Despacho'),
(55, 'Nota de Débito'),
(60, 'Nota de Crédito'),
(101, 'Factura de Exportación'),
(102, 'Factura de Venta Exenta a Zona Franca Primaria'),
(104, 'Nota de Débito de Exportación'),
(106, 'Nota de Crédito de Exportación'),
(33, 'Factura Electrónica'),
(34, 'Factura No Afecta o Exenta Electrónica'),
(39, 'Boleta Electrónica'),
(41, 'Boleta Exenta Electrónica'),
(43, 'Liquidación Factura Electrónica'),
(46, 'Factura de Compra Electrónica'),
(52, 'Guía de Despacho Electrónica'),
(56, 'Nota de Débito Electrónica'),
(61, 'Nota de Crédito Electrónica'),
(110, 'Factura de Exportación Electrónica'),
(111, 'Nota de Débito de Exportación Electrónica'),
(112, 'Nota de Crédito de Exportación Electrónica'),
(801, 'Factura de Venta Electrónica Zona Franca'),
(802, 'Factura de Compra Electrónica Zona Franca'),
(803, 'Guía de Despacho Zona Franca Electrónica'),
(804, 'Liquidación Factura Zona Franca Electrónica'),
(805, 'Nota de Crédito Zona Franca Electrónica'),
(806, 'Nota de Débito Zona Franca Electrónica'),
(500, 'Factura de Ajuste Tipo de Cambio'),
(501, 'Factura de Ajuste Tipo de Cambio Electrónica'),
(48, 'Boleta de Honorarios'),
(70, 'Boleta de Honorarios Electrónica'),
(341, 'Factura de Servicios Periódicos Electrónica'),
(342, 'Boleta de Prestación de Servicios Electrónica'),
(343, 'Boleta de Prestación de Servicios Exenta Electrónica'),
(344, 'Liquidación Factura de Exportación Electrónica'),
(345, 'Factura de Compra de Exportación Electrónica'),
(346, 'Guía de Despacho de Exportación Electrónica'),
(347, 'Recibo de Pago Electrónico'),
(348, 'Documento de Ajuste Global Electrónico'),
(349, 'Factura de Compra a Sujeto No Domiciliado Electrónica'),
(350, 'Factura de Venta a Zona Franca Secundaria Electrónica'),
(351, 'Nota de Débito a Zona Franca Secundaria Electrónica'),
(352, 'Nota de Crédito a Zona Franca Secundaria Electrónica'),
(353, 'Liquidación Factura Zona Franca Secundaria Electrónica'),
(354, 'Factura Exenta de Servicios Digitales'),
(355, 'Factura Electrónica de Servicios Digitales'),
(356, 'Boleta Electrónica de Servicios Digitales'),
(357, 'Nota de Crédito Electrónica de Servicios Digitales'),
(358, 'Nota de Débito Electrónica de Servicios Digitales');