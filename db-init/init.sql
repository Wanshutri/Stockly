-- Creación del esquema (opcional, pero recomendado para organizar)
CREATE SCHEMA IF NOT EXISTS ecommerce;
SET search_path TO ecommerce;

--
-- Tabla: TipoUsuario
-- Descripción: Almacena los tipos de usuarios (ej. Administrador, Cliente).
--
CREATE TABLE TipoUsuario (
    idTipo SERIAL PRIMARY KEY,
    nombreTipo VARCHAR(50) NOT NULL UNIQUE
);

--
-- Tabla: Usuario
-- Descripción: Almacena la información de los usuarios del sistema.
--
CREATE TABLE Usuario (
    idUsuario SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL, -- Se debe almacenar hasheada
    activo BOOLEAN DEFAULT TRUE,
    idTipo INT NOT NULL,
    CONSTRAINT fk_tipousuario
        FOREIGN KEY(idTipo) 
        REFERENCES TipoUsuario(idTipo)
);

--
-- Tabla: Marca
-- Descripción: Almacena las marcas de los productos.
--
CREATE TABLE Marca (
    idMarca SERIAL PRIMARY KEY,
    nombreMarca VARCHAR(100) NOT NULL UNIQUE
);

--
-- Tabla: TipoCategoria
-- Descripción: Almacena las categorías de los productos.
--
CREATE TABLE TipoCategoria (
    idCategoria SERIAL PRIMARY KEY,
    nombreCategoria VARCHAR(100) NOT NULL UNIQUE
);

--
-- Tabla: Producto
-- Descripción: Almacena la información de los productos en venta.
--
CREATE TABLE Producto (
    sku VARCHAR(50) PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    idCategoria INT NOT NULL,
    idMarca INT NOT NULL,
    precioVenta DECIMAL(10, 2) NOT NULL CHECK (precioVenta >= 0),
    precioCompra DECIMAL(10, 2) NOT NULL CHECK (precioCompra >= 0),
    stock INT NOT NULL DEFAULT 0 CHECK (stock >= 0),
    
    CONSTRAINT fk_categoria
        FOREIGN KEY(idCategoria) 
        REFERENCES TipoCategoria(idCategoria),
    CONSTRAINT fk_marca
        FOREIGN KEY(idMarca) 
        REFERENCES Marca(idMarca)
);

--
-- Tabla: Compra
-- Descripción: Almacena la cabecera de una transacción de compra.
--
CREATE TABLE Compra (
    idCompra SERIAL PRIMARY KEY,
    fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    total DECIMAL(10, 2) NOT NULL CHECK (total >= 0),
    idCliente INT NOT NULL,
    montoTarjeta DECIMAL(10, 2) CHECK (montoTarjeta >= 0),
    montoEfectivo DECIMAL(10, 2) CHECK (montoEfectivo >= 0),
    idPago VARCHAR(100), -- Asumiendo que idPago puede ser un ID de transacción externo
    
    CONSTRAINT fk_cliente
        FOREIGN KEY(idCliente) 
        REFERENCES Usuario(idUsuario)
);

--
-- Tabla: DetalleCompra
-- Descripción: Tabla de unión que almacena los productos de cada compra.
--
CREATE TABLE DetalleCompra (
    idCompra INT NOT NULL,
    skuProducto VARCHAR(50) NOT NULL,
    cantidad INT NOT NULL CHECK (cantidad > 0),
    subtotal DECIMAL(10, 2) NOT NULL CHECK (subtotal >= 0),
    
    -- Llave primaria compuesta
    PRIMARY KEY (idCompra, skuProducto),
    
    CONSTRAINT fk_compra
        FOREIGN KEY(idCompra) 
        REFERENCES Compra(idCompra)
        ON DELETE CASCADE, -- Si se borra la compra, se borra el detalle
    CONSTRAINT fk_producto
        FOREIGN KEY(skuProducto) 
        REFERENCES Producto(sku)
);

-- --- Inserción de datos de ejemplo ---

-- Tipos de Usuario
INSERT INTO TipoUsuario (nombreTipo) VALUES ('Administrador'), ('Cliente');

-- Marcas
INSERT INTO Marca (nombreMarca) VALUES ('Marca Ejemplo A'), ('Marca Ejemplo B');

-- Categorías
INSERT INTO TipoCategoria (nombreCategoria) VALUES ('Electrónica'), ('Ropa');

-- Usuarios
INSERT INTO Usuario (nombre, email, password, idTipo) VALUES 
('Admin User', 'admin@example.com', 'hash_pass_123', 1),
('Cliente User', 'cliente@example.com', 'hash_pass_456', 2);

-- Productos
INSERT INTO Producto (sku, nombre, idCategoria, idMarca, precioVenta, precioCompra, stock) VALUES
('ELEC-001', 'Smartphone XYZ', 1, 1, 500.00, 350.00, 50),
('ROPA-001', 'Camiseta Básica', 2, 2, 25.50, 10.00, 200);

-- Compra (ejemplo)
INSERT INTO Compra (total, idCliente, montoEfectivo) VALUES
(525.50, 2, 525.50);

-- Detalle de la Compra (asumiendo que la idCompra es 1)
INSERT INTO DetalleCompra (idCompra, skuProducto, cantidad, subtotal) VALUES
(1, 'ELEC-001', 1, 500.00),
(1, 'ROPA-001', 1, 25.50);