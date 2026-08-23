import { leerVariosRangos } from "./sheets";
import {
    construirDirectorio,
    nombreDeProveedor,
    COLUMNAS_PROVEEDORES,
    RANGO_PROVEEDORES,
    type DirectorioProveedores,
    type FondosSeleccion,
    type PaletasProveedor,
} from "./proveedores";

/**
 * Catálogo de productos, leído de Google Sheets.
 *
 * Vive aquí, y no dentro de la página, porque el carrito también lo necesita:
 * `Carrito_Producto` solo guarda `codigo_barras`, `id_proveedor` y
 * `cantidad_productos`, así que el nombre y el precio hay que resolverlos desde
 * el catálogo al reconstruir una partida guardada.
 *
 * Son dos pestañas: `Producto` tiene la ficha (código de barras y nombre) y
 * `Producto_Lista_Proveedores` la oferta de cada proveedor para ese producto
 * (precio y existencia). La comparativa de las tarjetas sale de agrupar la
 * segunda por código de barras.
 */

// Producto: A codigo_barras | B nombre | C imagen
const PRODUCTO = {
    rango: "Producto!A2:C",
    columnas: 3,
    col: { codigoBarras: 0, nombre: 1, imagen: 2 },
} as const;

// Producto_Lista_Proveedores:
// A codigo_barras | B id_proveedor | C precio_unitario_producto | D existencia_producto
const OFERTAS = {
    rango: "Producto_Lista_Proveedores!A2:D",
    columnas: 4,
    col: { codigoBarras: 0, idProveedor: 1, precio: 2, existencia: 3 },
} as const;

/**
 * Cuánto se reutiliza el catálogo antes de volver a leer la hoja.
 *
 * Las dos pestañas suman unas 21 000 filas (~850 KB por lectura) y la página es
 * dinámica, así que sin caché cada visita traería el catálogo completo y se
 * comería la cuota de 60 lecturas por minuto entre pocos usuarios.
 *
 * Cinco minutos es el compromiso: un cambio de precio en la hoja tarda como
 * mucho ese rato en verse, y a cambio una ráfaga de navegación no cuesta ni una
 * lectura. Si hace falta verlo al instante, reinicia el servidor o baja el TTL.
 */
const TTL_CATALOGO_MS = 5 * 60 * 1000;

/** Tope del selector de cantidad cuando no se conoce la existencia real. */
export const EXISTENCIAS_POR_DEFECTO = 99;

/** Oferta de un proveedor para un producto: una fila de `Producto_Lista_Proveedores`. */
export type PrecioProveedor = {
    proveedor: string;
    precio: number;
    disponible: boolean;
    /**
     * Piezas en existencia, solo cuando `existencia_producto` trae un número.
     * Si no, se desconoce y el selector de cantidad usa
     * `EXISTENCIAS_POR_DEFECTO`.
     */
    existencias?: number;
    /**
     * Unidad de venta declarada por el proveedor (PZ, PAQ, CAJA...).
     *
     * Sale de la misma columna `existencia_producto`: en unas 2 600 filas la
     * celda no lleva una cantidad sino la unidad en la que se surte. Son dos
     * datos distintos en una sola columna, así que aquí se separan.
     */
    unidad?: string;
};

export type Medicamento = {
    /** `codigo_barras`: la clave del producto en toda la hoja. */
    codigoBarras: string;
    nombre: string;
    /** Columna `imagen` de `Producto`, hoy vacía en todas las filas. */
    imagen?: string;
    /** Una entrada por proveedor que lo ofrece, sin ordenar. */
    precios: PrecioProveedor[];
    /**
     * Nombre y código en minúsculas y sin acentos, para el buscador.
     *
     * Se precalcula al armar el catálogo porque normalizar 9 700 nombres en
     * cada búsqueda sería trabajo repetido en cada petición.
     */
    textoBusqueda: string;
};

export type Catalogo = {
    /** Todos los productos, ordenados por nombre. */
    medicamentos: Medicamento[];
    porCodigo: Map<string, Medicamento>;
    /**
     * Directorio de proveedores y paletas de color, de la misma lectura.
     *
     * `Lista_Proveedores` entra en el mismo `batchGet` porque el catálogo ya
     * necesita traducir `id_proveedor` a nombre; exponerlos aquí evita que el
     * carrito y las páginas la lean por segunda vez.
     */
    directorio: DirectorioProveedores;
    paletas: PaletasProveedor;
    /** Paradas de `selector_color`, para marcar al proveedor elegido. */
    fondosSeleccion: FondosSeleccion;
};

/** Quita acentos y pasa a minúsculas, para comparar texto escrito a mano. */
export function normalizarTexto(texto: string): string {
    return texto
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .trim();
}

/** Precio de la hoja a número. `null` si la celda no trae un importe usable. */
function leerPrecio(celda: string): number | null {
    const limpio = celda.replace(/[$,\s]/g, "");
    if (!limpio) return null;

    const precio = Number(limpio);
    if (!Number.isFinite(precio) || precio <= 0) return null;

    return precio;
}

/**
 * Interpreta `existencia_producto`, que mezcla dos cosas.
 *
 * Unas filas traen una cantidad ("15") y otras la unidad de venta ("PZ",
 * "PAQ", "CAJA"). Se distingue por si la celda es numérica, y cada caso va a su
 * campo: así el selector de cantidad solo se topa con números.
 */
function leerExistencia(celda: string): {
    existencias?: number;
    unidad?: string;
} {
    const valor = celda.trim();
    if (!valor) return {};

    const cantidad = Number(valor.replace(/[,\s]/g, ""));
    if (Number.isFinite(cantidad)) {
        return { existencias: Math.max(Math.trunc(cantidad), 0) };
    }

    return { unidad: valor.toUpperCase() };
}

/** Agrupa las ofertas por código de barras, ya traducidas a nombre de proveedor. */
function agruparOfertas(
    filas: string[][],
    directorio: DirectorioProveedores,
): Map<string, PrecioProveedor[]> {
    const porCodigo = new Map<string, PrecioProveedor[]>();

    for (const fila of filas) {
        const codigo = fila[OFERTAS.col.codigoBarras].trim();
        if (!codigo) continue;

        // El nombre se resuelve por el directorio para que coincida con el que
        // usa la interfaz al pintar los colores del proveedor.
        const proveedor = nombreDeProveedor(
            directorio,
            fila[OFERTAS.col.idProveedor],
        );
        if (!proveedor) continue;

        const precio = leerPrecio(fila[OFERTAS.col.precio]);
        // Sin precio no hay nada que comparar: la oferta se descarta en lugar de
        // pintar un cero, que se leería como gratis.
        if (precio === null) continue;

        const { existencias, unidad } = leerExistencia(
            fila[OFERTAS.col.existencia],
        );

        const oferta: PrecioProveedor = {
            proveedor,
            precio,
            // Solo se marca agotado cuando la hoja da una cantidad y es cero.
            // Con la unidad de venta en la celda no hay dato de existencia, y
            // suponer agotado escondería la oferta.
            disponible: existencias === undefined || existencias > 0,
        };
        if (existencias !== undefined) oferta.existencias = existencias;
        if (unidad !== undefined) oferta.unidad = unidad;

        const existentes = porCodigo.get(codigo);
        if (existentes) existentes.push(oferta);
        else porCodigo.set(codigo, [oferta]);
    }

    return porCodigo;
}

/** Lee las tres pestañas y arma el catálogo. Una sola petición a Sheets. */
async function leerCatalogo(): Promise<Catalogo> {
    const [filasProducto, filasOfertas, filasProveedores] =
        await leerVariosRangos(
            [PRODUCTO.rango, OFERTAS.rango, RANGO_PROVEEDORES],
            [PRODUCTO.columnas, OFERTAS.columnas, COLUMNAS_PROVEEDORES],
        );

    const directorio = construirDirectorio(filasProveedores);
    const ofertasPorCodigo = agruparOfertas(filasOfertas, directorio);

    const medicamentos: Medicamento[] = [];
    const porCodigo = new Map<string, Medicamento>();

    for (const fila of filasProducto) {
        const codigoBarras = fila[PRODUCTO.col.codigoBarras].trim();
        const nombre = fila[PRODUCTO.col.nombre].trim();
        if (!codigoBarras || !nombre) continue;
        // La hoja no tiene duplicados hoy, pero si aparecieran gana la primera
        // fila en lugar de crear dos productos con la misma clave.
        if (porCodigo.has(codigoBarras)) continue;

        const imagen = fila[PRODUCTO.col.imagen].trim();

        const medicamento: Medicamento = {
            codigoBarras,
            nombre,
            precios: ofertasPorCodigo.get(codigoBarras) ?? [],
            textoBusqueda: `${normalizarTexto(nombre)} ${codigoBarras.toLowerCase()}`,
        };
        if (imagen) medicamento.imagen = imagen;

        medicamentos.push(medicamento);
        porCodigo.set(codigoBarras, medicamento);
    }

    medicamentos.sort((a, b) => a.nombre.localeCompare(b.nombre, "es"));

    return {
        medicamentos,
        porCodigo,
        directorio,
        paletas: directorio.paletas,
        fondosSeleccion: directorio.fondosSeleccion,
    };
}

/**
 * Caché en memoria del catálogo.
 *
 * Se guarda la promesa, no el resultado: si llegan varias peticiones mientras la
 * primera lectura está en vuelo, todas esperan la misma en lugar de lanzar una
 * cada una.
 *
 * Es caché por proceso. Con varias instancias del servidor cada una tiene la
 * suya, así que pueden verse desfasadas hasta `TTL_CATALOGO_MS`.
 */
let enCache: { promesa: Promise<Catalogo>; expira: number } | null = null;

/** Catálogo completo, reutilizado durante `TTL_CATALOGO_MS`. */
export function obtenerCatalogo(): Promise<Catalogo> {
    const ahora = Date.now();
    if (enCache && enCache.expira > ahora) return enCache.promesa;

    const promesa = leerCatalogo().catch((error) => {
        // Un fallo no se cachea: la siguiente petición vuelve a intentarlo en
        // lugar de arrastrar el error cinco minutos.
        enCache = null;
        throw error;
    });

    enCache = { promesa, expira: ahora + TTL_CATALOGO_MS };
    return promesa;
}

export function buscarPorCodigoBarras(
    catalogo: Catalogo,
    codigo: string,
): Medicamento | null {
    return catalogo.porCodigo.get(codigo.trim()) ?? null;
}

/**
 * Si un proveedor ofrece el medicamento.
 *
 * Es el predicado del filtro por proveedor del catálogo. Equivale a preguntar si
 * `Producto_Lista_Proveedores` tiene una fila con ese `codigo_barras` y ese
 * `id_proveedor`: las ofertas de `medicamento.precios` salen justo de ahí, ya
 * traducidas de id a nombre por `agruparOfertas`.
 *
 * La diferencia con mirar la pestaña en crudo es que aquí no cuentan las filas
 * cuyo precio la hoja no trae o no es usable, porque `agruparOfertas` las
 * descarta. Es lo que se quiere: un producto que el proveedor tiene listado sin
 * precio no aparece en la comparación, así que tampoco debería aparecer al
 * filtrar por él.
 */
export function ofreceProveedor(
    medicamento: Medicamento,
    proveedor: string,
): boolean {
    return medicamento.precios.some(
        (p) => p.proveedor.toLowerCase() === proveedor.toLowerCase(),
    );
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

/**
 * Ofertas de más barata a más cara, con las agotadas al final.
 *
 * Es el orden con el que la tarjeta pinta la comparativa, y de su primer
 * elemento disponible sale el proveedor ganador.
 */
export function ofertasOrdenadas(
    medicamento: Medicamento,
): PrecioProveedor[] {
    return [...medicamento.precios].sort((a, b) => {
        if (a.disponible !== b.disponible) return a.disponible ? -1 : 1;
        return a.precio - b.precio;
    });
}
