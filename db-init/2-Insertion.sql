-- Tipos de usuario
INSERT INTO tipo_usuario (nombre_tipo) VALUES ('Administrador');
INSERT INTO tipo_usuario (nombre_tipo) VALUES ('Vendedor');
INSERT INTO tipo_usuario (nombre_tipo) VALUES ('Bodeguero');

-- Categorías
INSERT INTO tipo_categoria (nombre_categoria) VALUES
    ('Bebidas'),
    ('Gaseosas'),
    ('Jugos'),
    ('Snacks'),
    ('Galletas'),
    ('Dulces'),
    ('Confites'),
    ('Cigarros'),
    ('Lácteos'),
    ('Panadería'),
    ('Helados'),
    ('Aguas'),
    ('Energéticas'),
    ('Café y Té'),
    ('Artículos de Aseo'),
    ('Artículos Escolares'),
    ('Comida Rápida'),
    ('Conservas'),
    ('Productos Congelados');


-- Marcas
INSERT INTO marca (nombre_marca) VALUES
    ('Coca-Cola'),
    ('Pepsi'),
    ('Nestlé'),
    ('Frito Lay'),
    ('Super 8'),
    ('Costa'),
    ('Moro'),
    ('Bianchi'),
    ('Líder'),
    ('Evercrisp'),
    ('Soprole'),
    ('Colún'),
    ('Watts'),
    ('Cecinas San Jorge'),
    ('Red Bull'),
    ('Monster'),
    ('Bilz y Pap'),
    ('Kem'),
    ('Mentholatum'),
    ('Barrilito');


-- Insertar productos en el kiosco
INSERT INTO producto (sku, gtin, nombre, id_categoria, id_marca, precio_venta, precio_compra, stock) VALUES
('SKU001', '7501031312345', 'Coca-Cola 500ml', 2, 1, 1200, 800, 50),
('SKU002', '7501031312352', 'Pepsi 500ml', 2, 2, 1100, 750, 40),
('SKU003', '7613035345612', 'Agua Nestlé 500ml', 12, 3, 900, 500, 60),
('SKU004', '7501058801234', 'Papas Frito Lay 120g', 4, 4, 1500, 1000, 30),
('SKU005', '7501058805678', 'Chocolatina Super 8', 6, 5, 800, 500, 100),
('SKU006', '7501011002345', 'Galletas Costa 90g', 5, 6, 700, 450, 80),
('SKU007', '7501031312369', 'Fanta Naranja 500ml', 2, 1, 1200, 800, 35),
('SKU008', '7501058807890', 'Cheetos Frito Lay 120g', 4, 4, 1500, 1000, 25),
('SKU009', '7501031312376', 'Red Bull 250ml', 13, 15, 2000, 1400, 20),
('SKU010', '7501031312383', 'Monster 500ml', 13, 16, 2200, 1500, 15),
('SKU011', '7501011003456', 'Leche Soprole 1L', 9, 11, 1100, 800, 50),
('SKU012', '7501011004567', 'Yogurt Colún 200g', 9, 12, 600, 400, 70),
('SKU013', '7501031312390', 'Bilz y Pap 350ml', 2, 17, 1000, 600, 40),
('SKU014', '7501031312406', 'Kem 200ml', 6, 18, 800, 500, 60),
('SKU015', '7501031312413', 'Mentholatum Bálsamo Labial', 15, 19, 1500, 900, 30),
('SKU016', '7501031312420', 'Barrilito Gaseosa 350ml', 2, 20, 1000, 600, 45),
('SKU017', '7501011005678', 'Pan Bianchi 500g', 10, 7, 1200, 800, 50),
('SKU018', '7501058808906', 'Helado Super 8 120ml', 11, 5, 900, 550, 40),
('SKU019', '7501031312437', 'Café Costa 250g', 14, 6, 2500, 1700, 25),
('SKU020', '7501058810012', 'Sopa instantánea Líder', 17, 8, 1200, 700, 35);


-- Insertar ventas en la tabla compra
INSERT INTO compra (total, monto_tarjeta, monto_efectivo) VALUES
(5200, 3000, 2200),
(3500, 3500, 0),
(4600, 2000, 2600),
(2800, 0, 2800);

-- Insertar detalles de las compras
INSERT INTO detalle_compra (id_compra, sku_producto, cantidad, subtotal, nombre_producto, gtin_producto, precio_unitario, marca_producto, categoria_producto) VALUES
-- Compra 1
(1, 'SKU001', 2, 2400, 'Coca-Cola 500ml', '7501031312345', 1200, 'Coca-Cola', 'Gaseosas'),
(1, 'SKU004', 2, 2800, 'Papas Frito Lay 120g', '7501058801234', 1400, 'Frito Lay', 'Snacks'),

-- Compra 2
(2, 'SKU002', 1, 1100, 'Pepsi 500ml', '7501031312352', 1100, 'Pepsi', 'Gaseosas'),
(2, 'SKU005', 3, 2400, 'Chocolatina Super 8', '7501058805678', 800, 'Super 8', 'Dulces'),

-- Compra 3
(3, 'SKU003', 4, 3600, 'Agua Nestlé 500ml', '7613035345612', 900, 'Nestlé', 'Aguas'),
(3, 'SKU006', 1, 1000, 'Galletas Costa 90g', '7501011002345', 1000, 'Costa', 'Galletas'),

-- Compra 4
(4, 'SKU007', 2, 2400, 'Fanta Naranja 500ml', '7501031312369', 1200, 'Coca-Cola', 'Gaseosas'),
(4, 'SKU014', 2, 400, 'Kem 200ml', '7501031312406', 200, 'Kem', 'Dulces');


-- Usuario admin inicial
INSERT INTO usuario (nombre, email, password, id_tipo, activo)
VALUES (
    'Admin',
    'admin@admin.cl',
    '$2b$10$Rc4eQgKPBgtAhyHGTMZHt.hIMH4XB6OPOJQsdWlbewZZ3fCsVZ3K6',
    1,
    true
);