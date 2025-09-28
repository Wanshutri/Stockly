-- =====================================
-- Creación de la base de datos
-- =====================================
CREATE DATABASE stockly;
\c stockly;

-- =====================================
-- Tablas base
-- =====================================
CREATE TABLE Marca (
    idMarca SERIAL PRIMARY KEY,
    nombreMarca VARCHAR(100) NOT NULL
);

CREATE TABLE TipoCategoria (
    idCategoria SERIAL PRIMARY KEY,
    nombreCategoria VARCHAR(100) NOT NULL
);

CREATE TABLE TipoUsuario (
    idTipo SERIAL PRIMARY KEY,
    nombreTipo VARCHAR(50) NOT NULL
);

CREATE TABLE TipoDocumentoTributario (
    idTipo SERIAL PRIMARY KEY,
    nombreTipo VARCHAR(50) NOT NULL
);

-- =====================================
-- Tablas principales
-- =====================================
CREATE TABLE Producto (
    sku VARCHAR(50) PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    idCategoria INT NOT NULL,
    idMarca INT NOT NULL,
    precioVenta NUMERIC(10,2) NOT NULL,
    precioCompra NUMERIC(10,2) NOT NULL,
    stock INT NOT NULL,
    FOREIGN KEY (idCategoria) REFERENCES TipoCategoria(idCategoria),
    FOREIGN KEY (idMarca) REFERENCES Marca(idMarca)
);

CREATE TABLE Cliente (
    idCliente SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    telefono VARCHAR(20)
);

CREATE TABLE Usuario (
    idUsuario SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    activo BOOLEAN DEFAULT TRUE,
    idTipo INT NOT NULL,
    FOREIGN KEY (idTipo) REFERENCES TipoUsuario(idTipo)
);

CREATE TABLE Pago (
    idPago SERIAL PRIMARY KEY,
    montoEfectivo NUMERIC(10,2) DEFAULT 0,
    montoTarjeta NUMERIC(10,2) DEFAULT 0
);

CREATE TABLE Compra (
    idCompra SERIAL PRIMARY KEY,
    fecha DATE NOT NULL,
    total NUMERIC(10,2) NOT NULL,
    idCliente INT NOT NULL,
    idPago INT NOT NULL,
    FOREIGN KEY (idCliente) REFERENCES Cliente(idCliente),
    FOREIGN KEY (idPago) REFERENCES Pago(idPago)
);

CREATE TABLE DetalleCompra (
    sku VARCHAR(50) NOT NULL,
    idCompra INT NOT NULL,
    cantidad INT NOT NULL,
    subtotal NUMERIC(10,2) NOT NULL,
    PRIMARY KEY (sku, idCompra),
    FOREIGN KEY (sku) REFERENCES Producto(sku),
    FOREIGN KEY (idCompra) REFERENCES Compra(idCompra)
);

CREATE TABLE DocumentoTributario (
    idDocumento SERIAL PRIMARY KEY,
    idCompra INT NOT NULL,
    idTipo INT NOT NULL,
    FOREIGN KEY (idCompra) REFERENCES Compra(idCompra),
    FOREIGN KEY (idTipo) REFERENCES TipoDocumentoTributario(idTipo)
);
