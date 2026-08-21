import { cache } from "react";
import {
    anexarFilas,
    escribirFilas,
    leerVariosRangos,
    primeraFilaDeRango,
    reemplazarDatos,
} from "./sheets";
import {
    buscarPorCodigoBarras,
    ofertaDe,
    precioMasAltoDisponible,
    EXISTENCIAS_POR_DEFECTO,
} from "./catalogo";
import {
    construirDirectorio,
    idDeProveedor,
    nombreDeProveedor,
    COLUMNAS_PROVEEDORES,
    RANGO_PROVEEDORES,
    type DirectorioProveedores,
} from "./proveedores";
import { normalizarEmail, type Rol } from "./credenciales";
import {
    acotarCantidad,
    type LineaCarrito,
    type PartidaGuardada,
} from "./tiposCarrito";

/**
 * Persistencia del carrito en Google Sheets.
 *
 * Modelo: cada cuenta tiene como máximo un carrito abierto en la pestaña
 * `Carrito`, identificado por `folio`. Las partidas de ese folio viven en
 * `Carrito_Producto`. La cuenta se referencia por correo, en `email_admin` o en
 * `email_sucursal` según el rol, que es como está montado el esquema de la hoja.
 *
 * Sobre la cuota: la API de Sheets permite 60 lecturas por minuto y por usuario.
 * Tanto leer como guardar traen todo lo que necesitan en un único `batchGet`,
 * porque una llamada por pestaña agota la cuota con muy poco uso.
 */

// Carrito: A folio | B fecha | C hora | D precio_total | E email_sucursal | F email_admin
const CARRITO = {
    pestana: "Carrito",
    rango: "Carrito!A2:F",
    ultimaColumna: "F",
    columnas: 6,
    col: {
        folio: 0,
        fecha: 1,
        hora: 2,
        precioTotal: 3,
        emailSucursal: 4,
        emailAdmin: 5,
    },
} as const;

// Carrito_Producto: A folio | B codigo_barras | C id_proveedor | D cantidad_productos
const PARTIDAS = {
    pestana: "Carrito_Producto",
    rango: "Carrito_Producto!A2:D",
    ultimaColumna: "D",
    columnas: 4,
    col: { folio: 0, codigoBarras: 1, idProveedor: 2, cantidad: 3 },
} as const;

/**
 * Serializa las escrituras dentro del proceso.
 *
 * Guardar es un read-modify-write de toda la pestaña `Carrito_Producto`. Dos
 * guardados solapados (el usuario ajustando cantidades rápido) leerían el mismo
 * estado y el segundo pisaría al primero. Encadenar las operaciones lo evita
 * para este servidor.
 *
 * Aviso: no protege frente a varias instancias del servidor escribiendo a la
 * vez. Con una base de datos real esto sería una transacción.
 */
let cola: Promise<unknown> = Promise.resolve();

function enCola<T>(tarea: () => Promise<T>): Promise<T> {
    const resultado = cola.then(tarea, tarea);
    // La cola no debe romperse si una tarea falla.
    cola = resultado.catch(() => undefined);
    return resultado;
}

/** Fecha y hora locales de la farmacia, en formato ordenable en la hoja. */
function marcaDeTiempo(): { fecha: string; hora: string } {
    const ahora = new Date();
    const opciones = { timeZone: "America/Mexico_City" } as const;

    // en-CA da YYYY-MM-DD, que ordena bien como texto en una hoja de cálculo.
    return {
        fecha: ahora.toLocaleDateString("en-CA", opciones),
        hora: ahora.toLocaleTimeString("en-GB", { ...opciones, hour12: false }),
    };
}

/** Todo lo que hace falta de la hoja para operar sobre un carrito. */
type EstadoHoja = {
    filasCarrito: string[][];
    filasPartidas: string[][];
    directorio: DirectorioProveedores;
};

/** Una sola petición para las tres pestañas implicadas. */
async function leerEstadoHoja(): Promise<EstadoHoja> {
    const [filasCarrito, filasPartidas, filasProveedores] =
        await leerVariosRangos(
            [CARRITO.rango, PARTIDAS.rango, RANGO_PROVEEDORES],
            [CARRITO.columnas, PARTIDAS.columnas, COLUMNAS_PROVEEDORES],
        );

    return {
        filasCarrito,
        filasPartidas,
        directorio: construirDirectorio(filasProveedores),
    };
}

/**
 * Localiza la fila del carrito de una cuenta dentro de filas ya leídas.
 *
 * Devuelve también el número de fila real en la hoja, necesario para poder
 * actualizar la cabecera en su sitio.
 */
function localizarCarrito(
    filasCarrito: string[][],
    email: string,
): { folio: string; fila: number } | null {
    const buscado = normalizarEmail(email);

    const indice = filasCarrito.findIndex(
        (f) =>
            normalizarEmail(f[CARRITO.col.emailAdmin]) === buscado ||
            normalizarEmail(f[CARRITO.col.emailSucursal]) === buscado,
    );
    if (indice === -1) return null;

    return {
        folio: filasCarrito[indice][CARRITO.col.folio].trim(),
        // +2: la fila 1 son encabezados y las hojas cuentan desde 1.
        fila: indice + 2,
    };
}

/**
 * Siguiente folio disponible: el máximo numérico más uno.
 *
 * Se mantiene numérico para que la columna siga siendo legible dentro de la
 * hoja. Con dos servidores escribiendo a la vez podrían colisionar; a esta
 * escala es aceptable, y un UUID haría la columna ilegible a ojo.
 */
function siguienteFolio(filasCarrito: string[][]): string {
    const maximo = filasCarrito.reduce((mayor, f) => {
        const n = Number.parseInt(f[CARRITO.col.folio], 10);
        return Number.isFinite(n) && n > mayor ? n : mayor;
    }, 0);

    return String(maximo + 1);
}

/**
 * Reconstruye una línea completa a partir de lo guardado en la hoja.
 *
 * Devuelve `null` si el código de barras o el proveedor ya no existen en el
 * catálogo: una partida huérfana se descarta en lugar de romper la página.
 */
function reconstruirLinea(
    codigoBarras: string,
    proveedor: string,
    cantidad: number,
): LineaCarrito | null {
    const medicamento = buscarPorCodigoBarras(codigoBarras);
    if (!medicamento) return null;

    const oferta = ofertaDe(medicamento, proveedor);
    if (!oferta) return null;

    const existencias = oferta.existencias ?? EXISTENCIAS_POR_DEFECTO;

    return {
        id: medicamento.id,
        nombre: medicamento.nombre,
        presentacion: medicamento.presentacion,
        codigoBarras: medicamento.codigoBarras,
        proveedor: oferta.proveedor,
        precioUnitario: oferta.precio,
        precioMasAlto: precioMasAltoDisponible(medicamento),
        cantidad: acotarCantidad(cantidad, existencias),
        existencias,
    };
}

/** Convierte las partidas de un folio en líneas completas para la interfaz. */
function lineasDelFolio(estado: EstadoHoja, folio: string): LineaCarrito[] {
    const lineas: LineaCarrito[] = [];

    for (const fila of estado.filasPartidas) {
        if (fila[PARTIDAS.col.folio].trim() !== folio) continue;

        const proveedor = nombreDeProveedor(
            estado.directorio,
            fila[PARTIDAS.col.idProveedor],
        );
        if (!proveedor) continue;

        const cantidad = Number.parseInt(fila[PARTIDAS.col.cantidad], 10);
        if (!Number.isFinite(cantidad) || cantidad < 1) continue;

        const linea = reconstruirLinea(
            fila[PARTIDAS.col.codigoBarras],
            proveedor,
            cantidad,
        );
        if (linea) lineas.push(linea);
    }

    return lineas;
}

/** Carrito guardado de una cuenta. Lista vacía si no tiene ninguno. */
export async function leerCarrito(email: string): Promise<LineaCarrito[]> {
    const estado = await leerEstadoHoja();
    const carrito = localizarCarrito(estado.filasCarrito, email);
    if (!carrito) return [];

    return lineasDelFolio(estado, carrito.folio);
}

/**
 * Versión deduplicada por petición, para las rutas que renderizan.
 *
 * El layout del segmento necesita el conteo de piezas y la página del carrito
 * las líneas: sin `cache` de React serían dos lecturas idénticas a Sheets en el
 * mismo render. Con ella, la segunda reutiliza el resultado de la primera.
 *
 * Las mutaciones no la usan, porque ahí sí hace falta el estado más reciente.
 */
export const leerCarritoDeRender = cache(leerCarrito);

/** Piezas totales en el carrito de una cuenta, para la insignia de la barra. */
export async function contarPiezas(email: string): Promise<number> {
    const lineas = await leerCarritoDeRender(email);
    return lineas.reduce((suma, l) => suma + l.cantidad, 0);
}

/**
 * Guarda el carrito completo de una cuenta.
 *
 * Sustituye todas las partidas del folio: la interfaz manda el estado final del
 * carrito, no un diff, así que no hay que reconciliar altas y bajas.
 */
export async function guardarCarrito(
    email: string,
    rol: Rol,
    partidas: PartidaGuardada[],
): Promise<LineaCarrito[]> {
    return enCola(async () => {
        const estado = await leerEstadoHoja();
        return aplicarGuardado(estado, email, rol, partidas);
    });
}

/**
 * Suma una pieza de un producto al carrito de la cuenta.
 *
 * Si el producto ya está con el mismo proveedor se incrementa la cantidad en
 * lugar de duplicar la partida.
 *
 * Lee y escribe dentro de la misma tarea encolada: si no fuera indivisible, dos
 * clics rápidos en "Agregar al carrito" leerían el mismo estado y una de las dos
 * altas se perdería.
 */
export async function agregarAlCarrito(
    email: string,
    rol: Rol,
    codigoBarras: string,
    proveedor: string,
): Promise<LineaCarrito[]> {
    return enCola(async () => {
        const estado = await leerEstadoHoja();
        const carrito = localizarCarrito(estado.filasCarrito, email);

        const partidas: PartidaGuardada[] = carrito
            ? lineasDelFolio(estado, carrito.folio).map((l) => ({
                codigoBarras: l.codigoBarras,
                proveedor: l.proveedor,
                cantidad: l.cantidad,
            }))
            : [];

        const codigo = codigoBarras.trim();
        const prov = proveedor.trim();

        const existente = partidas.find(
            (p) =>
                p.codigoBarras === codigo &&
                p.proveedor.toLowerCase() === prov.toLowerCase(),
        );

        if (existente) existente.cantidad += 1;
        else partidas.push({ codigoBarras: codigo, proveedor: prov, cantidad: 1 });

        return aplicarGuardado(estado, email, rol, partidas);
    });
}

/**
 * Escribe el estado final del carrito.
 *
 * Recibe `estado` ya leído para no volver a gastar cuota: quien la llama viene
 * de `leerEstadoHoja`.
 */
async function aplicarGuardado(
    estado: EstadoHoja,
    email: string,
    rol: Rol,
    partidas: PartidaGuardada[],
): Promise<LineaCarrito[]> {
    // Se validan contra el catálogo antes de escribir, así la hoja nunca recibe
    // un código de barras o un proveedor inventado por el cliente.
    const lineas: LineaCarrito[] = [];
    const filasNuevas: string[][] = [];
    let total = 0;

    for (const partida of partidas) {
        const linea = reconstruirLinea(
            partida.codigoBarras,
            partida.proveedor,
            partida.cantidad,
        );
        if (!linea) continue;

        const idProveedor = idDeProveedor(estado.directorio, linea.proveedor);
        if (!idProveedor) continue;

        lineas.push(linea);
        total += linea.precioUnitario * linea.cantidad;

        const fila = Array.from({ length: PARTIDAS.columnas }, () => "");
        fila[PARTIDAS.col.codigoBarras] = linea.codigoBarras;
        fila[PARTIDAS.col.idProveedor] = idProveedor;
        fila[PARTIDAS.col.cantidad] = String(linea.cantidad);
        filasNuevas.push(fila);
    }

    const { fecha, hora } = marcaDeTiempo();
    const existente = localizarCarrito(estado.filasCarrito, email);

    let folio: string;

    if (existente) {
        folio = existente.folio;
        // Cabecera: total y sello de la última modificación.
        await escribirFilas(
            `${CARRITO.pestana}!B${existente.fila}:D${existente.fila}`,
            [[fecha, hora, total.toFixed(2)]],
        );
    } else {
        folio = siguienteFolio(estado.filasCarrito);

        const fila = Array.from({ length: CARRITO.columnas }, () => "");
        fila[CARRITO.col.folio] = folio;
        fila[CARRITO.col.fecha] = fecha;
        fila[CARRITO.col.hora] = hora;
        fila[CARRITO.col.precioTotal] = total.toFixed(2);
        // El esquema separa las dos procedencias en columnas distintas.
        if (rol === "sucursal")
            fila[CARRITO.col.emailSucursal] = normalizarEmail(email);
        else fila[CARRITO.col.emailAdmin] = normalizarEmail(email);

        const rangoEscrito = await anexarFilas(CARRITO.rango, [fila]);
        if (primeraFilaDeRango(rangoEscrito) === null) {
            throw new Error(
                "Sheets no informó en qué fila quedó el carrito recién creado",
            );
        }
    }

    // El folio solo se conoce tras localizar o crear el carrito.
    for (const fila of filasNuevas) fila[PARTIDAS.col.folio] = folio;

    // Se conservan las partidas de los demás folios y se reescriben las de
    // este. Reemplazar la pestaña completa evita borrar filas sueltas, que en
    // Sheets exige un batchUpdate por índice de fila.
    const ajenas = estado.filasPartidas.filter(
        (f) =>
            f[PARTIDAS.col.folio].trim() !== folio &&
            f.some((celda) => celda.trim() !== ""),
    );

    await reemplazarDatos(
        PARTIDAS.pestana,
        PARTIDAS.ultimaColumna,
        [...ajenas, ...filasNuevas],
        estado.filasPartidas.length,
    );

    return lineas;
}
