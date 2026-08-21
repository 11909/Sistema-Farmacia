import { leerFilas } from "./sheets";

/**
 * Pestaña `Lista_Proveedores`: A id_proveedor | B nombre_proveedor.
 *
 * Es el catálogo de proveedores de la hoja, y la única fuente de `id_proveedor`,
 * que es la clave con la que `Carrito_Producto` referencia al proveedor de cada
 * partida.
 */
export const RANGO_PROVEEDORES = "Lista_Proveedores!A2:B";
export const COLUMNAS_PROVEEDORES = 2;

const COL = { id: 0, nombre: 1 } as const;

/**
 * Nombres del catálogo de ejemplo que no coinciden con los de la hoja.
 *
 * El catálogo en código usa "Farmater" y en `Lista_Proveedores` el proveedor se
 * llama "Farmacenter" (id 3). Sin este alias las partidas de ese proveedor no
 * se podrían guardar, porque no habría `id_proveedor` que escribir.
 *
 * Es un parche, no una solución: lo correcto es unificar el nombre en un lado.
 * Se deja explícito y en un solo sitio para que se vea que hay una discrepancia
 * pendiente en los datos.
 */
const ALIAS: Record<string, string> = {
    farmater: "farmacenter",
};

function clave(nombre: string): string {
    const normalizado = nombre.trim().toLowerCase();
    return ALIAS[normalizado] ?? normalizado;
}

export type Proveedor = { id: string; nombre: string };

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

    for (const fila of filas) {
        const id = fila[COL.id].trim();
        const nombre = fila[COL.nombre].trim();
        if (!id || !nombre) continue;

        nombrePorId.set(id, nombre);
        idPorNombre.set(clave(nombre), id);
    }

    return { nombrePorId, idPorNombre };
}

export async function obtenerDirectorioProveedores(): Promise<DirectorioProveedores> {
    return construirDirectorio(
        await leerFilas(RANGO_PROVEEDORES, COLUMNAS_PROVEEDORES),
    );
}

/**
 * Traduce el nombre de proveedor que usa la interfaz al `id_proveedor` de la
 * hoja. Devuelve `null` si el proveedor no está en `Lista_Proveedores`.
 */
export function idDeProveedor(
    directorio: DirectorioProveedores,
    nombre: string,
): string | null {
    return directorio.idPorNombre.get(clave(nombre)) ?? null;
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

    const aliasInverso = Object.entries(ALIAS).find(
        ([, canonico]) => canonico === nombreEnHoja.trim().toLowerCase(),
    );

    if (!aliasInverso) return nombreEnHoja;

    // Se recupera la capitalización del catálogo en código.
    const [nombreEnCodigo] = aliasInverso;
    return nombreEnCodigo.charAt(0).toUpperCase() + nombreEnCodigo.slice(1);
}
