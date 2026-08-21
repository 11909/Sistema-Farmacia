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
        // Quita el .readonly cuando haya que escribir en la hoja.
        scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"],
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
