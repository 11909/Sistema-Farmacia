import { NextResponse } from 'next/server';
import { leerFilas } from '@/app/lib/sheets';
import { obtenerSesion } from '@/app/lib/sesion';

/**
 * Prueba de conexión con Google Sheets.
 *
 * Exige sesión: el endpoint devuelve datos de la hoja, así que no debe quedar
 * abierto a cualquiera que alcance el servidor.
 */
export async function GET() {
    const sesion = await obtenerSesion();
    if (!sesion) {
        return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    try {
        // Pestañas disponibles: Administrador, Sucursal, Carrito,
        // Carrito_Producto, Producto, Producto_Lista_Proveedores,
        // Lista_Proveedores.
        const data = await leerFilas('Producto!A1:C10', 3);

        return NextResponse.json({ data });
    } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        console.error('[api/sheet] Error al conectar con Sheets:', message);
        return NextResponse.json(
            { error: 'Error al conectar con Sheets', detail: message },
            { status: 500 },
        );
    }
}
