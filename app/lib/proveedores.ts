import { cache } from "react";
import { leerFilas } from "./sheets";
import { claveProveedor, nombreEnCodigo } from "./nombresProveedor";
// Solo el tipo: `import type` se borra al compilar, así que este módulo no
// arrastra el componente (ni su SCSS) al servidor.
import type { PaletaBurbujas } from "../ui/grid_productos/BurbujasPrecio";

/**
 * Pestaña `Lista_Proveedores`:
 * A id_proveedor | B nombre_proveedor | C bubble_color | D bubble_background.
 *
 * Es el catálogo de proveedores de la hoja, y la única fuente de `id_proveedor`,
 * que es la clave con la que `Carrito_Producto` referencia al proveedor de cada
 * partida. `bubble_color` y `bubble_background` son la identidad visual del
 * proveedor: las cuatro manchas del efecto de burbujas y las dos paradas de su
 * degradado de fondo.
 */
export const RANGO_PROVEEDORES = "Lista_Proveedores!A2:D";
export const COLUMNAS_PROVEEDORES = 4;

const COL = { id: 0, nombre: 1, bubbleColor: 2, bubbleBackground: 3 } as const;

/** Cuántos valores espera cada celda de color. */
const TOTAL_COLORES = 4;
const TOTAL_FONDOS = 2;

/**
 * Caracteres admitidos en un valor de color de la hoja.
 *
 * Estos valores acaban en un `style` inline como custom properties de CSS, así
 * que se filtran antes de usarlos: la hoja es editable por varias personas y no
 * conviene que una celda pueda colar un `url(...)` que dispare una petición
 * desde el navegador. Cubre lo que hace falta de verdad: `rgb(...)`, `#hex`,
 * `hsl(...)`, tripletes `r, g, b` y nombres de color.
 */
const COLOR_VALIDO = /^[a-zA-Z0-9\s,.%#()/-]+$/;

export type Proveedor = { id: string; nombre: string };

/**
 * Paletas de burbujas leídas de la hoja, indexadas por `claveProveedor`.
 *
 * Es un objeto plano y no un `Map` porque viaja como prop a componentes de
 * cliente (`CarritoCliente`), y un `Map` no es serializable en el paso de
 * servidor a cliente.
 */
export type PaletasProveedor = Record<string, PaletaBurbujas>;

/**
 * Lee una celda con una lista JSON de colores.
 *
 * Devuelve `null` ante cualquier problema (celda vacía, JSON roto, valor con
 * caracteres raros) en lugar de lanzar: si un proveedor tiene la paleta mal
 * puesta, la interfaz debe caer a la paleta de respaldo, no romper la página.
 */
function leerListaDeColores(celda: string, total: number): string[] | null {
    const texto = celda.trim();
    if (!texto) return null;

    let valor: unknown;
    try {
        valor = JSON.parse(texto);
    } catch {
        return null;
    }

    if (!Array.isArray(valor) || valor.length < total) return null;

    const colores = valor
        .slice(0, total)
        .map((v) => String(v).trim())
        .filter((v) => v !== "" && COLOR_VALIDO.test(v));

    return colores.length === total ? colores : null;
}

/**
 * Convierte las columnas C y D de una fila en las custom properties que consume
 * `BurbujasPrecio`. `null` si la fila no trae una paleta completa.
 */
function construirPaleta(fila: string[]): PaletaBurbujas | null {
    const colores = leerListaDeColores(fila[COL.bubbleColor], TOTAL_COLORES);
    const fondos = leerListaDeColores(fila[COL.bubbleBackground], TOTAL_FONDOS);
    if (!colores || !fondos) return null;

    // El orden de las celdas es el de las variables: color1..color4 y
    // fondo1..fondo2. Ver `BurbujasPrecio.module.scss`.
    return {
        "--bp-fondo1": fondos[0],
        "--bp-fondo2": fondos[1],
        "--bp-color1": colores[0],
        "--bp-color2": colores[1],
        "--bp-color3": colores[2],
        "--bp-color4": colores[3],
    };
}

/**
 * Directorio de proveedores en ambos sentidos.
 *
 * Se lee de la hoja en cada llamada; son cinco filas y evita que un cambio en
 * `Lista_Proveedores` exija reiniciar el servidor.
 */
export type DirectorioProveedores = {
    /** `id_proveedor` -> nombre tal como está escrito en la hoja. */
    nombrePorId: Map<string, string>;
    /** Nombre normalizado (con alias aplicado) -> `id_proveedor`. */
    idPorNombre: Map<string, string>;
    /**
     * Nombre normalizado -> paleta de burbujas de la hoja.
     *
     * Solo lleva a los proveedores con las dos celdas de color bien puestas; el
     * resto no aparece y la interfaz usa su paleta de respaldo.
     */
    paletas: PaletasProveedor;
};

/**
 * Construye el directorio a partir de filas ya leídas.
 *
 * Se separa de la lectura para que quien ya haya traído `Lista_Proveedores` en
 * un `batchGet` junto a otras pestañas no tenga que gastar otra petición.
 */
export function construirDirectorio(
    filas: string[][],
): DirectorioProveedores {
    const nombrePorId = new Map<string, string>();
    const idPorNombre = new Map<string, string>();
    const paletas: PaletasProveedor = {};

    for (const fila of filas) {
        const id = fila[COL.id].trim();
        const nombre = fila[COL.nombre].trim();
        if (!id || !nombre) continue;

        const claveNombre = claveProveedor(nombre);

        nombrePorId.set(id, nombre);
        idPorNombre.set(claveNombre, id);

        const paleta = construirPaleta(fila);
        if (paleta) paletas[claveNombre] = paleta;
    }

    return { nombrePorId, idPorNombre, paletas };
}

export async function obtenerDirectorioProveedores(): Promise<DirectorioProveedores> {
    return construirDirectorio(
        await leerFilas(RANGO_PROVEEDORES, COLUMNAS_PROVEEDORES),
    );
}

/**
 * Paletas de burbujas de la hoja, listas para pasar a la interfaz.
 *
 * Va envuelto en `cache` de React para que las varias partes de un mismo render
 * que las necesitan (la página del catálogo, la del carrito) compartan una sola
 * lectura de Sheets. Fuera de ese render se vuelve a leer, que es lo que
 * permite cambiar un color en la hoja y verlo al recargar sin reiniciar el
 * servidor.
 */
export const obtenerPaletasDeRender = cache(
    async (): Promise<PaletasProveedor> => {
        const directorio = await obtenerDirectorioProveedores();
        return directorio.paletas;
    },
);

/**
 * Traduce el nombre de proveedor que usa la interfaz al `id_proveedor` de la
 * hoja. Devuelve `null` si el proveedor no está en `Lista_Proveedores`.
 */
export function idDeProveedor(
    directorio: DirectorioProveedores,
    nombre: string,
): string | null {
    return directorio.idPorNombre.get(claveProveedor(nombre)) ?? null;
}

/**
 * Traduce un `id_proveedor` al nombre que espera la interfaz.
 *
 * La interfaz colorea por nombre de proveedor (`coloresProveedor.ts`), y ahí la
 * entrada es "Farmater". Se invierte el alias para que el color siga saliendo.
 */
export function nombreDeProveedor(
    directorio: DirectorioProveedores,
    id: string,
): string | null {
    const nombreEnHoja = directorio.nombrePorId.get(id.trim());
    if (!nombreEnHoja) return null;

    return nombreEnCodigo(nombreEnHoja);
}
