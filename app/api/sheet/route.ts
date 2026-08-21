import { NextResponse } from 'next/server';
import { google } from 'googleapis';

export async function GET() {
    try {
        // 1. Autenticación con la cuenta de servicio
        const auth = new google.auth.GoogleAuth({
            credentials: {
                client_email: process.env.GOOGLE_CLIENT_EMAIL,
                // Reemplazamos los saltos de línea literales por reales
                private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
            },
            scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'], // Quita el .readonly si necesitas escribir
        });

        const sheets = google.sheets({ version: 'v4', auth });

        // 2. Hacer la petición a Google Sheets
        const response = await sheets.spreadsheets.values.get({
            spreadsheetId: process.env.GOOGLE_SHEET_ID,
            range: 'Producto!A1:C10', // Pestañas disponibles: Administrador, Sucursal, Carrito, Carrito_Producto, Producto, Producto_Lista_Proveedores, Lista_Proveedores
        });

        // 3. Devolver los datos
        return NextResponse.json({ data: response.data.values });

    } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        console.error('[api/sheet] Error al conectar con Sheets:', message);
        return NextResponse.json(
            { error: 'Error al conectar con Sheets', detail: message },
            { status: 500 },
        );
    }
}