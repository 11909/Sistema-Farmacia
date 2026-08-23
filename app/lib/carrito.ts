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
    obtenerCatalogo,
    ofertaDe,
    precioMasAltoDisponible,
    EXISTENCIAS_POR_DEFECTO,
    type Catalogo,
} from "./catalogo";
import { idDeProveedor, nombreDeProveedor } from "./proveedores";
import { normalizarEmail, type Rol } from "./credenciales";
import {
    acotarCantidad,
    type LineaCarrito,
    type PartidaGuardada,
} from "./tiposCarrito";

/**
 * Persistencia del carrito en Google Sheets.
 *
 * Modelo: la pestaña `Carrito` guarda un pedido por fila, identificado por
 * `folio`, y la columna `estado` dice en qué punto está. Cada cuenta tiene como
 * máximo un folio `abierto` a la vez —el carrito que está armando— y tantos
 * `confirmado` como pedidos haya hecho, que son el histórico y ya no se tocan.
 * Las partidas de cada folio viven en `Carrito_Producto`. La cuenta se
 * referencia por correo, en `email_admin` o en `email_sucursal` según el rol,
 * que es como está montado el esquema de la hoja.
 *
 * Confirmar un pedido no borra nada: sella la fila como `confirmado` y con eso
 * deja de ser el carrito abierto de la cuenta, así que la siguiente alta crea un
 * folio nuevo. Sus partidas se quedan en `Carrito_Producto` como registro de lo
 * que se pidió.
 *
 * Sobre la cuota: la API de Sheets permite 60 lecturas por minuto y por usuario.
 * Tanto leer como guardar traen todo lo que necesitan en un único `batchGet`,
 * porque una llamada por pestaña agota la cuota con muy poco uso.
 */

// Carrito: A folio | B fecha | C hora | D precio_total | E email_sucursal
//        | F email_admin | G estado
const CARRITO = {
    pestana: "Carrito",
    rango: "Carrito!A2:G",
    ultimaColumna: "G",
    columnas: 7,
    col: {
        folio: 0,
        fecha: 1,
        hora: 2,
        precioTotal: 3,
        emailSucursal: 4,
        emailAdmin: 5,
        estado: 6,
    },
} as const;

/**
 * Valores de la columna `estado`.
 *
 * Una celda vacía cuenta como `abierto`: las filas que ya existían antes de que
 * la columna se añadiera son los carritos que las cuentas tenían a medias, y
 * tratarlas como confirmadas las habría dado por pedidas.
 */
const ESTADO = { abierto: "abierto", confirmado: "confirmado" } as const;

function estaConfirmada(filaCarrito: string[]): boolean {
    return (
        filaCarrito[CARRITO.col.estado].trim().toLowerCase() ===
        ESTADO.confirmado
    );
}

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
    /**
     * Catálogo con el que se validan las partidas. Trae dentro el directorio de
     * proveedores, así que `Lista_Proveedores` no se lee aparte.
     */
    catalogo: Catalogo;
};

/**
 * Estado de la hoja para operar sobre un carrito.
 *
 * Las dos pestañas del carrito van en un `batchGet` (una lectura) y el catálogo
 * viene de su propia caché, así que lo normal es que esto cueste una sola
 * lectura de la cuota.
 */
async function leerEstadoHoja(): Promise<EstadoHoja> {
    const [rangosCarrito, catalogo] = await Promise.all([
        leerVariosRangos(
            [CARRITO.rango, PARTIDAS.rango],
            [CARRITO.columnas, PARTIDAS.columnas],
        ),
        obtenerCatalogo(),
    ]);

    const [filasCarrito, filasPartidas] = rangosCarrito;

    return { filasCarrito, filasPartidas, catalogo };
}

/**
 * Localiza la fila del carrito **abierto** de una cuenta dentro de filas ya
 * leídas.
 *
 * Los folios confirmados se saltan a propósito: son pedidos ya hechos, y si
 * volvieran a contar como el carrito de la cuenta, el usuario acabaría editando
 * el histórico en lugar de empezar un pedido nuevo.
 *
 * Devuelve también el número de fila real en la hoja y sus valores, necesarios
 * para actualizar la cabecera en su sitio sin pisar las columnas que no tocan.
 */
function localizarCarrito(
    filasCarrito: string[][],
    email: string,
): { folio: string; fila: number; valores: string[] } | null {
    const buscado = normalizarEmail(email);

    const indice = filasCarrito.findIndex(
        (f) =>
            !estaConfirmada(f) &&
            (normalizarEmail(f[CARRITO.col.emailAdmin]) === buscado ||
                normalizarEmail(f[CARRITO.col.emailSucursal]) === buscado),
    );
    if (indice === -1) return null;

    return {
        folio: filasCarrito[indice][CARRITO.col.folio].trim(),
        // +2: la fila 1 son encabezados y las hojas cuentan desde 1.
        fila: indice + 2,
        valores: filasCarrito[indice],
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
    catalogo: Catalogo,
    codigoBarras: string,
    proveedor: string,
    cantidad: number,
): LineaCarrito | null {
    const medicamento = buscarPorCodigoBarras(catalogo, codigoBarras);
    if (!medicamento) return null;

    const oferta = ofertaDe(medicamento, proveedor);
    if (!oferta) return null;

    const existencias = oferta.existencias ?? EXISTENCIAS_POR_DEFECTO;

    const linea: LineaCarrito = {
        // Producto y proveedor: la misma clave con la que la hoja identifica la
        // partida. El código de barras solo no basta, porque el mismo producto
        // puede estar en el carrito comprado a dos proveedores distintos.
        id: `${medicamento.codigoBarras}|${oferta.proveedor}`,
        nombre: medicamento.nombre,
        codigoBarras: medicamento.codigoBarras,
        proveedor: oferta.proveedor,
        precioUnitario: oferta.precio,
        precioMasAlto: precioMasAltoDisponible(medicamento),
        cantidad: acotarCantidad(cantidad, existencias),
        existencias,
    };
    if (oferta.unidad !== undefined) linea.unidad = oferta.unidad;

    return linea;
}

/** Convierte las partidas de un folio en líneas completas para la interfaz. */
function lineasDelFolio(estado: EstadoHoja, folio: string): LineaCarrito[] {
    const lineas: LineaCarrito[] = [];

    for (const fila of estado.filasPartidas) {
        if (fila[PARTIDAS.col.folio].trim() !== folio) continue;

        const proveedor = nombreDeProveedor(
            estado.catalogo.directorio,
            fila[PARTIDAS.col.idProveedor],
        );
        if (!proveedor) continue;

        const cantidad = Number.parseInt(fila[PARTIDAS.col.cantidad], 10);
        if (!Number.isFinite(cantidad) || cantidad < 1) continue;

        const linea = reconstruirLinea(
            estado.catalogo,
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
 * Suma piezas de un producto al carrito de la cuenta.
 *
 * Si el producto ya está con el mismo proveedor se incrementa la cantidad en
 * lugar de duplicar la partida. El total se acota luego a las existencias del
 * proveedor, en `reconstruirLinea`.
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
    /** Piezas a sumar. Ya saneada por quien llama. */
    cantidad: number,
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

        if (existente) existente.cantidad += cantidad;
        else partidas.push({ codigoBarras: codigo, proveedor: prov, cantidad });

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
            estado.catalogo,
            partida.codigoBarras,
            partida.proveedor,
            partida.cantidad,
        );
        if (!linea) continue;

        const idProveedor = idDeProveedor(
            estado.catalogo.directorio,
            linea.proveedor,
        );
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

    // Sin partidas y sin carrito abierto no hay nada que guardar. Se sale antes
    // de crear la fila: si no, cada visita a un carrito vacío dejaría un folio
    // en la hoja sin una sola partida detrás.
    if (!existente && filasNuevas.length === 0) return [];

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
        fila[CARRITO.col.estado] = ESTADO.abierto;

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

/** Pedido tal como quedó registrado al confirmarlo. */
export type PedidoConfirmado = {
    folio: string;
    /** Fecha y hora locales en las que se confirmó, ya escritas en la hoja. */
    fecha: string;
    hora: string;
    lineas: LineaCarrito[];
    /** Importe del pedido con los precios del catálogo en ese momento. */
    total: number;
};

/**
 * Cierra el carrito abierto de una cuenta y lo deja como pedido en la hoja.
 *
 * Sella la fila con `estado = confirmado` y con el sello de tiempo y el importe
 * del momento. A partir de ahí `localizarCarrito` deja de verla, así que la
 * cuenta se queda sin carrito abierto y el siguiente producto que agregue crea
 * un folio nuevo: es lo que permite tener varios pedidos por cuenta.
 *
 * Las partidas no se mueven ni se borran. Se quedan colgadas del folio en
 * `Carrito_Producto` y son el registro de qué se pidió.
 *
 * Devuelve `null` si la cuenta no tiene carrito abierto o si el que tiene se ha
 * quedado sin partidas válidas: un pedido vacío no se confirma.
 *
 * Va en la misma cola que los guardados. Si no fuera indivisible, un guardado
 * con el temporizador de la interfaz a medio vencer podría escribir partidas
 * sobre un folio que se acaba de confirmar.
 */
export async function confirmarPedido(
    email: string,
): Promise<PedidoConfirmado | null> {
    return enCola(async () => {
        const estado = await leerEstadoHoja();

        const carrito = localizarCarrito(estado.filasCarrito, email);
        if (!carrito) return null;

        const lineas = lineasDelFolio(estado, carrito.folio);
        if (lineas.length === 0) return null;

        const total = lineas.reduce(
            (suma, l) => suma + l.precioUnitario * l.cantidad,
            0,
        );
        const { fecha, hora } = marcaDeTiempo();

        // Se reescribe la fila completa a partir de la que ya estaba, para que
        // las columnas de correo conserven su valor: son las que dicen de quién
        // es el pedido y aquí no se recalculan.
        const fila = [...carrito.valores];
        fila[CARRITO.col.fecha] = fecha;
        fila[CARRITO.col.hora] = hora;
        fila[CARRITO.col.precioTotal] = total.toFixed(2);
        fila[CARRITO.col.estado] = ESTADO.confirmado;

        await escribirFilas(
            `${CARRITO.pestana}!A${carrito.fila}:${CARRITO.ultimaColumna}${carrito.fila}`,
            [fila],
        );

        return { folio: carrito.folio, fecha, hora, lineas, total };
    });
}
