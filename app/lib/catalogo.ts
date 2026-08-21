/**
 * Catálogo de medicamentos.
 *
 * Vive aquí, y no dentro de la página, porque el carrito también lo necesita:
 * las pestañas `Carrito_Producto` solo guardan `codigo_barras`, `id_proveedor` y
 * `cantidad_productos`, así que el nombre, la presentación y el precio hay que
 * resolverlos desde el catálogo al reconstruir una línea guardada.
 *
 * Sigue siendo un catálogo de ejemplo: las pestañas `Producto` y
 * `Producto_Lista_Proveedores` de la hoja están vacías, solo tienen
 * encabezados. Cuando se llenen, este módulo es el único punto que hay que
 * cambiar para leerlas en su lugar.
 */

export type PrecioProveedor = {
    proveedor: string;
    precio: number;
    disponible: boolean;
    /**
     * Piezas en existencia. Su origen real es la columna
     * `existencia_producto` de `Producto_Lista_Proveedores`, hoy vacía, así que
     * mientras no haya dato se usa `EXISTENCIAS_POR_DEFECTO`.
     */
    existencias?: number;
};

export type Medicamento = {
    id: number;
    nombre: string;
    presentacion: string;
    codigoBarras: string;
    precios: PrecioProveedor[];
};

/** Tope del selector de cantidad cuando no se conoce la existencia real. */
export const EXISTENCIAS_POR_DEFECTO = 99;

export const MEDICAMENTOS: Medicamento[] = [
    {
        id: 1,
        nombre: "Paracetamol 500 mg",
        presentacion: "Caja con 20 tabletas",
        codigoBarras: "7501234567890",
        precios: [
            { proveedor: "City", precio: 45, disponible: true, existencias: 40 },
            { proveedor: "Farmater", precio: 52, disponible: true },
            { proveedor: "Ofasa", precio: 48.5, disponible: true },
            { proveedor: "Tenorio", precio: 60, disponible: true },
        ],
    },
    {
        id: 2,
        nombre: "Loratadina 10 mg",
        presentacion: "Caja con 20 tabletas",
        codigoBarras: "7509876543210",
        precios: [
            { proveedor: "City", precio: 62, disponible: true },
            { proveedor: "Farmater", precio: 58, disponible: true },
            { proveedor: "Ofasa", precio: 65, disponible: true },
            { proveedor: "Tenorio", precio: 55, disponible: true },
        ],
    },
    {
        id: 3,
        nombre: "Amoxicilina 500 mg",
        presentacion: "Caja con 12 cápsulas",
        codigoBarras: "7501122334455",
        precios: [
            { proveedor: "City", precio: 152, disponible: true },
            { proveedor: "Farmater", precio: 145, disponible: true, existencias: 3 },
            { proveedor: "Ofasa", precio: 160, disponible: false },
            { proveedor: "Tenorio", precio: 148, disponible: true },
        ],
    },
    {
        id: 4,
        nombre: "Ibuprofeno 400 mg",
        presentacion: "Caja con 30 tabletas",
        codigoBarras: "7505566778899",
        precios: [
            { proveedor: "City", precio: 88.5, disponible: true },
            { proveedor: "Farmater", precio: 92, disponible: true },
            { proveedor: "Ofasa", precio: 85, disponible: true, existencias: 18 },
            { proveedor: "Tenorio", precio: 100, disponible: true },
        ],
    },
    {
        id: 5,
        nombre: "Omeprazol 20 mg",
        presentacion: "Caja con 14 cápsulas",
        codigoBarras: "7502233445566",
        precios: [
            { proveedor: "City", precio: 89, disponible: true },
            { proveedor: "Farmater", precio: 95, disponible: true },
            { proveedor: "Ofasa", precio: 82, disponible: true },
            { proveedor: "Tenorio", precio: 110, disponible: false },
        ],
    },
    {
        id: 6,
        nombre: "Vitamina C 1 g",
        presentacion: "30 tabletas efervescentes",
        codigoBarras: "7503344556677",
        precios: [
            { proveedor: "City", precio: 135, disponible: true },
            { proveedor: "Farmater", precio: 128, disponible: true },
            { proveedor: "Ofasa", precio: 140, disponible: true },
            { proveedor: "Tenorio", precio: 125, disponible: true, existencias: 12 },
        ],
    },
    {
        id: 7,
        nombre: "Jarabe expectorante",
        presentacion: "Frasco de 120 ml",
        codigoBarras: "7504455667788",
        precios: [
            { proveedor: "City", precio: 98, disponible: true },
            { proveedor: "Farmater", precio: 105, disponible: false },
            { proveedor: "Ofasa", precio: 92, disponible: true },
            { proveedor: "Tenorio", precio: 99, disponible: true },
        ],
    },
    {
        id: 8,
        nombre: "Gel antibacterial 70%",
        presentacion: "Botella de 500 ml",
        codigoBarras: "7505566778800",
        precios: [
            { proveedor: "City", precio: 55, disponible: true },
            { proveedor: "Farmater", precio: 60, disponible: true },
            { proveedor: "Ofasa", precio: 52, disponible: true },
            { proveedor: "Tenorio", precio: 58, disponible: true },
        ],
    },
    {
        id: 9,
        nombre: "Crema hidratante corporal",
        presentacion: "Tubo de 100 g",
        codigoBarras: "7506677889900",
        precios: [
            { proveedor: "City", precio: 124, disponible: true },
            { proveedor: "Farmater", precio: 118, disponible: true },
            { proveedor: "Ofasa", precio: 130, disponible: true },
            { proveedor: "Tenorio", precio: 115, disponible: true },
        ],
    },
    {
        id: 10,
        nombre: "Suero oral electrolitos",
        presentacion: "Botella de 625 ml",
        codigoBarras: "7507788990011",
        precios: [
            { proveedor: "City", precio: 32, disponible: true },
            { proveedor: "Farmater", precio: 35, disponible: true },
            { proveedor: "Ofasa", precio: 30, disponible: true, existencias: 24 },
            { proveedor: "Tenorio", precio: 38, disponible: false },
        ],
    },
    {
        id: 11,
        nombre: "Termómetro digital",
        presentacion: "1 pieza con estuche",
        codigoBarras: "7508899001122",
        precios: [
            { proveedor: "City", precio: 249, disponible: true },
            { proveedor: "Farmater", precio: 235, disponible: true },
            { proveedor: "Ofasa", precio: 260, disponible: true },
            { proveedor: "Tenorio", precio: 240, disponible: true },
        ],
    },
    {
        id: 12,
        nombre: "Cubrebocas KN95",
        presentacion: "Caja con 10 piezas",
        codigoBarras: "7509900112233",
        precios: [
            { proveedor: "City", precio: 89, disponible: true },
            { proveedor: "Farmater", precio: 82, disponible: true, existencias: 30 },
            { proveedor: "Ofasa", precio: 95, disponible: false },
            { proveedor: "Tenorio", precio: 85, disponible: true },
        ],
    },
];

/** Índice por código de barras, que es la clave con la que guarda la hoja. */
const POR_CODIGO = new Map(MEDICAMENTOS.map((m) => [m.codigoBarras, m]));

export function buscarPorCodigoBarras(codigo: string): Medicamento | null {
    return POR_CODIGO.get(codigo.trim()) ?? null;
}

/** Oferta de un proveedor concreto para un medicamento. */
export function ofertaDe(
    medicamento: Medicamento,
    proveedor: string,
): PrecioProveedor | null {
    return (
        medicamento.precios.find(
            (p) => p.proveedor.toLowerCase() === proveedor.toLowerCase(),
        ) ?? null
    );
}

/**
 * Precio disponible más alto del medicamento. De la diferencia con el precio
 * elegido sale el ahorro que muestra el carrito.
 */
export function precioMasAltoDisponible(
    medicamento: Medicamento,
): number | undefined {
    const precios = medicamento.precios
        .filter((p) => p.disponible)
        .map((p) => p.precio);

    return precios.length ? Math.max(...precios) : undefined;
}

/** Proveedor disponible más barato: el que se agrega por defecto al carrito. */
export function mejorOferta(medicamento: Medicamento): PrecioProveedor | null {
    const disponibles = medicamento.precios.filter((p) => p.disponible);
    if (disponibles.length === 0) return null;

    return disponibles.reduce((a, b) => (b.precio < a.precio ? b : a));
}
