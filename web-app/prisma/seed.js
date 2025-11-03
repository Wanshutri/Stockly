import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

// Inicializa el cliente de Prisma
const prisma = new PrismaClient();

/**
 * Función principal para la siembra de datos (seeding).
 * Contiene todas las operaciones de inserción inicial.
 */
async function main() {
    console.log('Iniciando la siembra de datos...');

    // 1. TipoUsuario (Administrador, Vendedor, Bodeguero)
    const tiposUsuario = await prisma.tipoUsuario.createMany({
        data: [
            { nombre_tipo: 'Administrador' },
            { nombre_tipo: 'Vendedor' },
            { nombre_tipo: 'Bodeguero' },
        ],
        skipDuplicates: true, // Evita errores si ya existen
    });
    console.log(`Creados ${tiposUsuario.count} Tipos de Usuario.`);

    // 2. TipoDocumentoTributario (Lista larga)
    const documentosData = [
        { codigo_sii: '30', nombre_tipo: 'Factura' },
        { codigo_sii: '32', nombre_tipo: 'Factura de ventas y servicios no afectos o exentos de IVA' },
        { codigo_sii: '35', nombre_tipo: 'Boleta' },
        { codigo_sii: '38', nombre_tipo: 'Boleta exenta' },
        { codigo_sii: '40', nombre_tipo: 'Liquidación Factura' },
        { codigo_sii: '45', nombre_tipo: 'Factura de Compra' },
        { codigo_sii: '50', nombre_tipo: 'Guía de Despacho' },
        { codigo_sii: '55', nombre_tipo: 'Nota de Débito' },
        { codigo_sii: '60', nombre_tipo: 'Nota de Crédito' },
        { codigo_sii: '101', nombre_tipo: 'Factura de Exportación' },
        { codigo_sii: '102', nombre_tipo: 'Factura de Venta Exenta a Zona Franca Primaria' },
        { codigo_sii: '104', nombre_tipo: 'Nota de Débito de Exportación' },
        { codigo_sii: '106', nombre_tipo: 'Nota de Crédito de Exportación' },
        { codigo_sii: '33', nombre_tipo: 'Factura Electrónica' },
        { codigo_sii: '34', nombre_tipo: 'Factura No Afecta o Exenta Electrónica' },
        { codigo_sii: '39', nombre_tipo: 'Boleta Electrónica' },
        { codigo_sii: '41', nombre_tipo: 'Boleta Exenta Electrónica' },
        { codigo_sii: '43', nombre_tipo: 'Liquidación Factura Electrónica' },
        { codigo_sii: '46', nombre_tipo: 'Factura de Compra Electrónica' },
        { codigo_sii: '52', nombre_tipo: 'Guía de Despacho Electrónica' },
        { codigo_sii: '56', nombre_tipo: 'Nota de Débito Electrónica' },
        { codigo_sii: '61', nombre_tipo: 'Nota de Crédito Electrónica' },
        { codigo_sii: '110', nombre_tipo: 'Factura de Exportación Electrónica' },
        { codigo_sii: '111', nombre_tipo: 'Nota de Débito de Exportación Electrónica' },
        { codigo_sii: '112', nombre_tipo: 'Nota de Crédito de Exportación Electrónica' },
        { codigo_sii: '801', nombre_tipo: 'Factura de Venta Electrónica Zona Franca' },
        { codigo_sii: '802', nombre_tipo: 'Factura de Compra Electrónica Zona Franca' },
        { codigo_sii: '803', nombre_tipo: 'Guía de Despacho Zona Franca Electrónica' },
        { codigo_sii: '804', nombre_tipo: 'Liquidación Factura Zona Franca Electrónica' },
        { codigo_sii: '805', nombre_tipo: 'Nota de Crédito Zona Franca Electrónica' },
        { codigo_sii: '806', nombre_tipo: 'Nota de Débito Zona Franca Electrónica' },
        { codigo_sii: '500', nombre_tipo: 'Factura de Ajuste Tipo de Cambio' },
        { codigo_sii: '501', nombre_tipo: 'Factura de Ajuste Tipo de Cambio Electrónica' },
        { codigo_sii: '48', nombre_tipo: 'Boleta de Honorarios' },
        { codigo_sii: '70', nombre_tipo: 'Boleta de Honorarios Electrónica' },
        { codigo_sii: '341', nombre_tipo: 'Factura de Servicios Periódicos Electrónica' },
        { codigo_sii: '342', nombre_tipo: 'Boleta de Prestación de Servicios Electrónica' },
        { codigo_sii: '343', nombre_tipo: 'Boleta de Prestación de Servicios Exenta Electrónica' },
        { codigo_sii: '344', nombre_tipo: 'Liquidación Factura de Exportación Electrónica' },
        { codigo_sii: '345', nombre_tipo: 'Factura de Compra de Exportación Electrónica' },
        { codigo_sii: '346', nombre_tipo: 'Guía de Despacho de Exportación Electrónica' },
        { codigo_sii: '347', nombre_tipo: 'Recibo de Pago Electrónico' },
        { codigo_sii: '348', nombre_tipo: 'Documento de Ajuste Global Electrónico' },
        { codigo_sii: '349', nombre_tipo: 'Factura de Compra a Sujeto No Domiciliado Electrónica' },
        { codigo_sii: '350', nombre_tipo: 'Factura de Venta a Zona Franca Secundaria Electrónica' },
        { codigo_sii: '351', nombre_tipo: 'Nota de Débito a Zona Franca Secundaria Electrónica' },
        { codigo_sii: '352', nombre_tipo: 'Nota de Crédito a Zona Franca Secundaria Electrónica' },
        { codigo_sii: '353', nombre_tipo: 'Liquidación Factura Zona Franca Secundaria Electrónica' },
        { codigo_sii: '354', nombre_tipo: 'Factura Exenta de Servicios Digitales' },
        { codigo_sii: '355', nombre_tipo: 'Factura Electrónica de Servicios Digitales' },
        { codigo_sii: '356', nombre_tipo: 'Boleta Electrónica de Servicios Digitales' },
        { codigo_sii: '357', nombre_tipo: 'Nota de Crédito Electrónica de Servicios Digitales' },
        { codigo_sii: '358', nombre_tipo: 'Nota de Débito Electrónica de Servicios Digitales' },
    ];

    const tiposDocumento = await prisma.tipoDocumentoTributario.createMany({
        data: documentosData,
        skipDuplicates: true,
    });
    console.log(`Creados ${tiposDocumento.count} Tipos de Documento Tributario.`);


    // 3. TipoCategoria
    const categorias = await prisma.tipoCategoria.createMany({
        data: [
            { nombre_categoria: 'Electrónica' },
            { nombre_categoria: 'Ropa' },
            { nombre_categoria: 'Hogar' },
            { nombre_categoria: 'Deportes' },
            { nombre_categoria: 'Juguetes' },
        ],
        skipDuplicates: true,
    });
    console.log(`Creados ${categorias.count} Tipos de Categoría.`);


    // 4. Marca
    const marcas = await prisma.marca.createMany({
        data: [
            { nombre_marca: 'Carozzi' },
            { nombre_marca: 'Traverso' },
            { nombre_marca: 'Coca-Cola' },
            { nombre_marca: 'Lucchetti' },
            { nombre_marca: 'Lays' },
            { nombre_marca: 'Nestle' },
        ],
        skipDuplicates: true,
    });
    console.log(`Creados ${marcas.count} Marcas.`);

    // 5. Cliente Anónimo
    // Usamos upsert para garantizar que solo exista una vez y mantener la consistencia del ID
    const clienteAnonimo = await prisma.cliente.upsert({
        where: { rut: '99999999-9' },
        update: {}, // No actualiza nada si existe
        create: {
            rut: '99999999-9',
            nombre_completo: 'Cliente Anónimo',
            es_anonimo: true,
        },
    });
    console.log(`Cliente anónimo verificado/creado con ID: ${clienteAnonimo.id_cliente}`);

    // 6. Usuario Administrador

    const password = 'admin123'; // Contraseña por defecto

    // Hashear con bcrypt
    
    const hashedPassword = await bcrypt.hash(password, 10);

    const adminUser = await prisma.usuario.upsert({
        where: { email: 'admin@admin.cl' },
        update: {}, // No actualiza nada si existe
        create: {
            nombre: 'Administrador',
            email: 'admin@admin.cl',
            password: hashedPassword, // En un entorno real, asegúrate de hashear la contraseña
            activo: true,
            id_tipo: 1, // Asumiendo que 1 es el ID para Administrador
        },
    });
    console.log(`Usuario administrador creado`);


}

// Ejecutar la función de siembra y manejar errores
main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
