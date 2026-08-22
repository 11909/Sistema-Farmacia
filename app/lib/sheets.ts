import { google, type sheets_v4 } from "googleapis";

/**
 * Cliente compartido de Google Sheets.
 *
 * Se memoiza a nivel de módulo porque crear un `GoogleAuth` nuevo en cada
 * petición obliga a renegociar el token de la cuenta de servicio. La librería
 * ya cachea y refresca el access token por su cuenta.
 */
let clienteSheets: sheets_v4.Sheets | null = null;

/** Lanza si falta la variable, para no fallar más tarde con un error opaco. */
function variableRequerida(nombre: string): string {
    const valor = process.env[nombre];
    if (!valor) {
        throw new Error(
            `Falta la variable de entorno ${nombre}. Revisa tu archivo .env.local`,
        );
    }
    return valor;
}

export function obtenerClienteSheets(): sheets_v4.Sheets {
    if (clienteSheets) return clienteSheets;

    const auth = new google.auth.GoogleAuth({
        credentials: {
            client_email: variableRequerida("GOOGLE_CLIENT_EMAIL"),
            // En .env.local los saltos de línea van escapados como "\n"
            // literales; la librería necesita saltos reales.
            private_key: variableRequerida("GOOGLE_PRIVATE_KEY").replace(
                /\\n/g,
                "\n",
            ),
        },
        // Lectura y escritura: el carrito se persiste en las pestañas
        // `Carrito` y `Carrito_Producto`.
        scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });

    clienteSheets = google.sheets({ version: "v4", auth });
    return clienteSheets;
}

/**
 * Lee un rango y devuelve las filas como matriz de strings.
 *
 * Google recorta las celdas vacías del final de cada fila, así que las filas
 * llegan con longitudes distintas. Aquí se rellenan a `totalColumnas` para
 * poder indexar por número de columna sin comprobar `undefined` cada vez.
 */
export async function leerFilas(
    rango: string,
    totalColumnas: number,
): Promise<string[][]> {
    const sheets = obtenerClienteSheets();

    const respuesta = await sheets.spreadsheets.values.get({
        spreadsheetId: variableRequerida("GOOGLE_SHEET_ID"),
        range: rango,
    });

    const filas = respuesta.data.values ?? [];

    return filas.map((fila) =>
        Array.from({ length: totalColumnas }, (_, i) => String(fila[i] ?? "")),
    );
}

/**
 * Lee varios rangos en una sola petición.
 *
 * Importa más de lo que parece: la API de Sheets limita a 60 lecturas por
 * minuto y por usuario, y hacer una llamada por pestaña agota la cuota
 * enseguida. `batchGet` cuenta como una sola lectura sin importar cuántos
 * rangos lleve.
 *
 * Devuelve las matrices en el mismo orden que `rangos`.
 */
export async function leerVariosRangos(
    rangos: string[],
    columnasPorRango: number[],
): Promise<string[][][]> {
    const sheets = obtenerClienteSheets();

    const respuesta = await sheets.spreadsheets.values.batchGet({
        spreadsheetId: variableRequerida("GOOGLE_SHEET_ID"),
        ranges: rangos,
    });

    const rangosDevueltos = respuesta.data.valueRanges ?? [];

    return rangos.map((_, i) => {
        const filas = rangosDevueltos[i]?.values ?? [];
        const columnas = columnasPorRango[i];

        return filas.map((fila) =>
            Array.from({ length: columnas }, (_, c) => String(fila[c] ?? "")),
        );
    });
}

/** Escribe `filas` a partir de la celda superior izquierda de `rango`. */
export async function escribirFilas(
    rango: string,
    filas: (string | number)[][],
): Promise<void> {
    if (filas.length === 0) return;

    const sheets = obtenerClienteSheets();

    await sheets.spreadsheets.values.update({
        spreadsheetId: variableRequerida("GOOGLE_SHEET_ID"),
        range: rango,
        // RAW y no USER_ENTERED: los valores se guardan tal cual, sin que Sheets
        // reinterprete un código de barras como número en notación científica ni
        // convierta una cadena que empiece por "=" en fórmula.
        valueInputOption: "RAW",
        requestBody: { values: filas },
    });
}

/**
 * Añade filas al final de los datos existentes de una pestaña.
 *
 * Devuelve el rango que Sheets escribió realmente (por ejemplo
 * `Carrito!A5:F5`), que es la forma de saber en qué fila quedó lo insertado sin
 * gastar otra lectura.
 */
export async function anexarFilas(
    rango: string,
    filas: (string | number)[][],
): Promise<string | null> {
    if (filas.length === 0) return null;

    const sheets = obtenerClienteSheets();

    const respuesta = await sheets.spreadsheets.values.append({
        spreadsheetId: variableRequerida("GOOGLE_SHEET_ID"),
        range: rango,
        valueInputOption: "RAW",
        insertDataOption: "INSERT_ROWS",
        requestBody: { values: filas },
    });

    return respuesta.data.updates?.updatedRange ?? null;
}

/** Extrae el número de la primera fila de un rango tipo `Carrito!A5:F5`. */
export function primeraFilaDeRango(rango: string | null): number | null {
    const coincidencia = rango?.match(/![A-Z]+(\d+)/);
    if (!coincidencia) return null;

    const fila = Number.parseInt(coincidencia[1], 10);
    return Number.isFinite(fila) ? fila : null;
}

/**
 * Reemplaza por completo los datos de una pestaña, conservando la fila 1 de
 * encabezados.
 *
 * El orden importa: primero se sobrescriben las filas nuevas y solo después se
 * limpia el sobrante. Al revés habría un instante en el que la pestaña queda
 * vacía, y si la segunda llamada falla se pierden los datos.
 *
 * @param pestana Nombre de la pestaña, sin rango.
 * @param ultimaColumna Letra de la última columna con datos, por ejemplo "F".
 */
export async function reemplazarDatos(
    pestana: string,
    ultimaColumna: string,
    filas: (string | number)[][],
    /**
     * Cuántas filas de datos había antes. Se pasa desde fuera cuando quien
     * llama ya leyó la pestaña, para no gastar otra lectura de la cuota.
     */
    filasPrevias: number,
): Promise<void> {
    const sheets = obtenerClienteSheets();
    const spreadsheetId = variableRequerida("GOOGLE_SHEET_ID");

    if (filas.length > 0) {
        await sheets.spreadsheets.values.update({
            spreadsheetId,
            range: `${pestana}!A2`,
            valueInputOption: "RAW",
            requestBody: { values: filas },
        });
    }

    // Si ahora hay menos filas que antes, el resto quedaría como basura.
    if (filasPrevias > filas.length) {
        await sheets.spreadsheets.values.clear({
            spreadsheetId,
            range: `${pestana}!A${2 + filas.length}:${ultimaColumna}${1 + filasPrevias}`,
        });
    }
}
