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

export type ActualizarProductoInput = {
    codigoBarrasOriginal: string;
    proveedorOriginal: string;
    nombre: string;
    codigoBarras: string;
    precio: number | string;
    existencias: number | string;
    presentacion: string;
};

export async function actualizarProducto(datos: ActualizarProductoInput): Promise<RespuestaAccion> {
    const { leerFilas, reemplazarDatos } = await import("./sheets");
    const { idDeProveedor } = await import("./proveedores");

    try {
        const catalogo = await obtenerCatalogo();
        const { codigoBarrasOriginal, proveedorOriginal } = datos;
        const codigoNuevo = datos.codigoBarras.trim();
        const nombreNuevo = datos.nombre.trim();
        
        if (!codigoNuevo || !nombreNuevo) {
            return { error: "El código de barras y el nombre son obligatorios." };
        }

        if (codigoNuevo !== codigoBarrasOriginal && catalogo.porCodigo.has(codigoNuevo)) {
            return { error: "Ya existe otro producto con el nuevo código de barras." };
        }

        const filasOfertas = await leerFilas("Producto_Lista_Proveedores!A2:E", 5);
        const prevOfertasLen = filasOfertas.length;

        const idProvOriginal = idDeProveedor(catalogo.directorio, proveedorOriginal);
        if (!idProvOriginal) {
            return { error: "No se encontró el ID del proveedor en el directorio." };
        }

        let filaEncontrada = false;
        for (let i = 0; i < filasOfertas.length; i++) {
            const fila = filasOfertas[i];
            const codigo = fila[0].trim();
            const idProv = fila[1].trim();

            if (codigo === codigoBarrasOriginal) {
                if (codigoNuevo !== codigoBarrasOriginal) {
                    fila[0] = codigoNuevo;
                }
                
                if (idProv === idProvOriginal) {
                    filaEncontrada = true;
                    fila[2] = String(datos.precio);
                    fila[3] = datos.existencias === "" ? "" : String(datos.existencias);
                    fila[4] = datos.presentacion.trim();
                }
            }
        }

        if (!filaEncontrada) {
            return { error: "No se encontró la oferta en la base de datos para editarla." };
        }

        const filasProducto = await leerFilas("Producto!A2:C", 3);
        const prevProductoLen = filasProducto.length;
        
        for (let i = 0; i < filasProducto.length; i++) {
            const fila = filasProducto[i];
            if (fila[0].trim() === codigoBarrasOriginal) {
                fila[0] = codigoNuevo;
                fila[1] = nombreNuevo;
                break;
            }
        }

        await reemplazarDatos("Producto", "C", filasProducto, prevProductoLen);
        await reemplazarDatos("Producto_Lista_Proveedores", "E", filasOfertas, prevOfertasLen);

        limpiarCatalogo();
        revalidatePath("/panel_admin/productos");

        return { exito: true };
    } catch (error) {
        console.error("Error al actualizar producto:", error);
        return { error: "Ocurrió un error al actualizar la base de datos." };
    }
}

export async function eliminarOfertaProducto(codigoBarras: string, proveedor: string): Promise<RespuestaAccion> {
    const { leerFilas, reemplazarDatos } = await import("./sheets");
    const { idDeProveedor } = await import("./proveedores");

    try {
        const catalogo = await obtenerCatalogo();
        
        const idProvEliminar = idDeProveedor(catalogo.directorio, proveedor);
        if (!idProvEliminar) {
            return { error: "No se encontró el ID del proveedor." };
        }

        const filasOfertas = await leerFilas("Producto_Lista_Proveedores!A2:E", 5);
        const prevOfertasLen = filasOfertas.length;

        const nuevasFilasOfertas = filasOfertas.filter((fila) => {
            return !(fila[0].trim() === codigoBarras && fila[1].trim() === idProvEliminar);
        });

        if (nuevasFilasOfertas.length === prevOfertasLen) {
            return { error: "No se encontró el registro para eliminar." };
        }

        const quedanOfertas = nuevasFilasOfertas.some((fila) => fila[0].trim() === codigoBarras);

        let filasProducto = await leerFilas("Producto!A2:C", 3);
        const prevProductoLen = filasProducto.length;

        if (!quedanOfertas) {
            filasProducto = filasProducto.filter((fila) => {
                return fila[0].trim() !== codigoBarras;
            });
        }

        if (!quedanOfertas) {
            await reemplazarDatos("Producto", "C", filasProducto, prevProductoLen);
        }
        await reemplazarDatos("Producto_Lista_Proveedores", "E", nuevasFilasOfertas, prevOfertasLen);

        limpiarCatalogo();
        revalidatePath("/panel_admin/productos");

        return { exito: true };
    } catch (error) {
        console.error("Error al eliminar oferta:", error);
        return { error: "Ocurrió un error al eliminar de la base de datos." };
    }
}
