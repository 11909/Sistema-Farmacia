"use server";

import { revalidatePath } from "next/cache";
import { obtenerCatalogo, limpiarCatalogo } from "./catalogo";
import { anexarFilas } from "./sheets";

export type OfertaInput = {
    idProveedor: string;
    precio: string;
    existencias: number | string;
    presentacion: string;
};

export type NuevoProductoInput = {
    nombre: string;
    codigoBarras: string;
    ofertas: OfertaInput[];
};

export type RespuestaAccion = {
    error?: string;
    exito?: boolean;
};

export async function guardarNuevoProducto(datos: NuevoProductoInput): Promise<RespuestaAccion> {
    try {
        const catalogo = await obtenerCatalogo();
        
        const codigo = datos.codigoBarras.trim();
        const nombre = datos.nombre.trim();

        if (!codigo) {
            return { error: "El código de barras es requerido." };
        }
        if (!nombre) {
            return { error: "El nombre es requerido." };
        }

        // 1. Validar que el código no exista
        if (catalogo.porCodigo.has(codigo)) {
            return { error: "Ya existe un medicamento registrado con ese código de barras." };
        }

        // 2. Insertar en la pestaña Producto
        // Columnas: A codigo_barras | B nombre | C imagen
        const filaProducto = [codigo, nombre, ""];
        await anexarFilas("Producto!A:C", [filaProducto]);

        // 3. Insertar en la pestaña Producto_Lista_Proveedores
        // Columnas: A codigo_barras | B id_proveedor | C precio_unitario_producto | D existencia_producto | E presentacion
        const filasOfertas = datos.ofertas.map((oferta) => [
            codigo,
            oferta.idProveedor,
            oferta.precio,
            oferta.existencias === "" ? "" : Number(oferta.existencias),
            oferta.presentacion.trim()
        ]);
        
        await anexarFilas("Producto_Lista_Proveedores!A:E", filasOfertas);

        // 4. Limpiar caché del catálogo e indicar a Next.js que revalide la página
        limpiarCatalogo();
        revalidatePath("/panel_admin/productos");

        return { exito: true };
    } catch (error) {
        console.error("Error al guardar producto:", error);
        return { error: "Ocurrió un error al guardar en la base de datos." };
    }
}
