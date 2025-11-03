-- CreateTable
CREATE TABLE "Marca" (
    "id_marca" SERIAL NOT NULL,
    "nombre_marca" VARCHAR(100) NOT NULL,

    CONSTRAINT "Marca_pkey" PRIMARY KEY ("id_marca")
);

-- CreateTable
CREATE TABLE "TipoCategoria" (
    "id_categoria" SERIAL NOT NULL,
    "nombre_categoria" VARCHAR(100) NOT NULL,

    CONSTRAINT "TipoCategoria_pkey" PRIMARY KEY ("id_categoria")
);

-- CreateTable
CREATE TABLE "TipoUsuario" (
    "id_tipo" SERIAL NOT NULL,
    "nombre_tipo" VARCHAR(50) NOT NULL,

    CONSTRAINT "TipoUsuario_pkey" PRIMARY KEY ("id_tipo")
);

-- CreateTable
CREATE TABLE "TipoDocumentoTributario" (
    "codigo_sii" VARCHAR(3) NOT NULL,
    "nombre_tipo" VARCHAR(100) NOT NULL,

    CONSTRAINT "TipoDocumentoTributario_pkey" PRIMARY KEY ("codigo_sii")
);

-- CreateTable
CREATE TABLE "Producto" (
    "sku" VARCHAR(50) NOT NULL,
    "nombre" VARCHAR(100) NOT NULL,
    "id_categoria" INTEGER NOT NULL,
    "id_marca" INTEGER NOT NULL,
    "precio_venta" DECIMAL(10,2) NOT NULL,
    "precio_compra" DECIMAL(10,2) NOT NULL,
    "descripcion" VARCHAR(200) NOT NULL,
    "stock" INTEGER NOT NULL,

    CONSTRAINT "Producto_pkey" PRIMARY KEY ("sku")
);

-- CreateTable
CREATE TABLE "Cliente" (
    "id_cliente" SERIAL NOT NULL,
    "rut" VARCHAR(12),
    "nombre_completo" VARCHAR(150),
    "telefono" VARCHAR(20),
    "correo" VARCHAR(100),
    "es_anonimo" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Cliente_pkey" PRIMARY KEY ("id_cliente")
);

-- CreateTable
CREATE TABLE "Usuario" (
    "id_usuario" SERIAL NOT NULL,
    "nombre" VARCHAR(100) NOT NULL,
    "email" VARCHAR(100) NOT NULL,
    "password" VARCHAR(255) NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "id_tipo" INTEGER NOT NULL,

    CONSTRAINT "Usuario_pkey" PRIMARY KEY ("id_usuario")
);

-- CreateTable
CREATE TABLE "Pago" (
    "id_pago" SERIAL NOT NULL,
    "monto_efectivo" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "monto_tarjeta" DECIMAL(10,2) NOT NULL DEFAULT 0,

    CONSTRAINT "Pago_pkey" PRIMARY KEY ("id_pago")
);

-- CreateTable
CREATE TABLE "Compra" (
    "id_compra" SERIAL NOT NULL,
    "fecha" DATE NOT NULL,
    "total" DECIMAL(10,2) NOT NULL,
    "id_cliente" INTEGER NOT NULL,
    "id_pago" INTEGER NOT NULL,

    CONSTRAINT "Compra_pkey" PRIMARY KEY ("id_compra")
);

-- CreateTable
CREATE TABLE "DetalleCompra" (
    "sku" VARCHAR(50) NOT NULL,
    "id_compra" INTEGER NOT NULL,
    "cantidad" INTEGER NOT NULL,
    "subtotal" DECIMAL(10,2) NOT NULL,

    CONSTRAINT "DetalleCompra_pkey" PRIMARY KEY ("sku","id_compra")
);

-- CreateTable
CREATE TABLE "DocumentoTributario" (
    "id_documento" SERIAL NOT NULL,
    "id_compra" INTEGER NOT NULL,
    "id_tipo" VARCHAR(3) NOT NULL,

    CONSTRAINT "DocumentoTributario_pkey" PRIMARY KEY ("id_documento")
);

-- CreateIndex
CREATE UNIQUE INDEX "Marca_nombre_marca_key" ON "Marca"("nombre_marca");

-- CreateIndex
CREATE UNIQUE INDEX "TipoCategoria_nombre_categoria_key" ON "TipoCategoria"("nombre_categoria");

-- CreateIndex
CREATE UNIQUE INDEX "Cliente_rut_key" ON "Cliente"("rut");

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_email_key" ON "Usuario"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Compra_id_pago_key" ON "Compra"("id_pago");

-- CreateIndex
CREATE UNIQUE INDEX "DocumentoTributario_id_compra_key" ON "DocumentoTributario"("id_compra");

-- AddForeignKey
ALTER TABLE "Producto" ADD CONSTRAINT "Producto_id_categoria_fkey" FOREIGN KEY ("id_categoria") REFERENCES "TipoCategoria"("id_categoria") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Producto" ADD CONSTRAINT "Producto_id_marca_fkey" FOREIGN KEY ("id_marca") REFERENCES "Marca"("id_marca") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Usuario" ADD CONSTRAINT "Usuario_id_tipo_fkey" FOREIGN KEY ("id_tipo") REFERENCES "TipoUsuario"("id_tipo") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Compra" ADD CONSTRAINT "Compra_id_cliente_fkey" FOREIGN KEY ("id_cliente") REFERENCES "Cliente"("id_cliente") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Compra" ADD CONSTRAINT "Compra_id_pago_fkey" FOREIGN KEY ("id_pago") REFERENCES "Pago"("id_pago") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DetalleCompra" ADD CONSTRAINT "DetalleCompra_sku_fkey" FOREIGN KEY ("sku") REFERENCES "Producto"("sku") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DetalleCompra" ADD CONSTRAINT "DetalleCompra_id_compra_fkey" FOREIGN KEY ("id_compra") REFERENCES "Compra"("id_compra") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DocumentoTributario" ADD CONSTRAINT "DocumentoTributario_id_compra_fkey" FOREIGN KEY ("id_compra") REFERENCES "Compra"("id_compra") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DocumentoTributario" ADD CONSTRAINT "DocumentoTributario_id_tipo_fkey" FOREIGN KEY ("id_tipo") REFERENCES "TipoDocumentoTributario"("codigo_sii") ON DELETE RESTRICT ON UPDATE CASCADE;
