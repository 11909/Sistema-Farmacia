"use server";

import { refresh } from "next/cache";
import { obtenerSesion } from "../sesion";
import { agregarAlCarrito, guardarCarrito, leerCarrito } from "../carrito";
import { puedeVerPrecios } from "../permisos";
import {
    sinPrecios,
    type LineaVisible,
    type PartidaGuardada,
} from "../tiposCarrito";
import type { Rol } from "../credenciales";

/**
 * Acciones de servidor del carrito.
 *
 * Cada función comprueba la sesión por su cuenta. No es redundante con el
 * `proxy.ts` ni con el layout: las Server Actions son endpoints POST reales y se
 * pueden invocar directamente, sin pasar por la interfaz. El correo de la cuenta
 * se toma siempre de la sesión, nunca de los argumentos, para que nadie pueda
 * escribir en el carrito de otro.
 */

export type ResultadoGuardado =
    | { ok: true; lineas: LineaVisible[] }
    | { ok: false; motivo: "sin-sesion" | "error" };

/**
 * Recorta las partidas a lo que el rol tiene permitido ver.
 *
 * Se aplica en la frontera con el cliente, justo antes de devolver: lo que sale
 * de una Server Action va al navegador, así que es aquí donde tiene que caer el
 * filtro y no en el componente que pinta.
 */
function paraElRol(lineas: Parameters<typeof sinPrecios>[0], rol: Rol) {
    return puedeVerPrecios(rol) ? lineas : sinPrecios(lineas);
}

/** Valida lo que llega del cliente antes de tocar la hoja. */
function sanearPartidas(valor: unknown): PartidaGuardada[] {
    if (!Array.isArray(valor)) return [];

    const partidas: PartidaGuardada[] = [];

    for (const bruto of valor) {
        if (typeof bruto !== "object" || bruto === null) continue;

        const { codigoBarras, proveedor, cantidad } = bruto as Record<
            string,
            unknown
        >;

        if (typeof codigoBarras !== "string" || typeof proveedor !== "string") {
            continue;
        }

        const numero =
            typeof cantidad === "number" ? cantidad : Number(cantidad);
        if (!Number.isFinite(numero) || numero < 1) continue;

        partidas.push({
            codigoBarras: codigoBarras.trim(),
            proveedor: proveedor.trim(),
            cantidad: Math.trunc(numero),
        });
    }

    return partidas;
}

/**
 * Sustituye el carrito de la cuenta en sesión por las partidas recibidas.
 *
 * Devuelve las líneas tal como quedaron guardadas, ya validadas contra el
 * catálogo, para que el cliente adopte el estado del servidor en lugar de
 * quedarse con el suyo.
 */
export async function guardarCarritoDeSesion(
    partidas: unknown,
): Promise<ResultadoGuardado> {
    const sesion = await obtenerSesion();
    const email = sesion?.user?.email;
    const rol = sesion?.user?.rol;

    if (!email || !rol) return { ok: false, motivo: "sin-sesion" };

    try {
        const lineas = await guardarCarrito(email, rol, sanearPartidas(partidas));

        // Actualiza el router de cliente para que la insignia del carrito en la
        // barra superior, que se renderiza en el layout, refleje el cambio.
        refresh();

        return { ok: true, lineas: paraElRol(lineas, rol) };
    } catch (error) {
        console.error(
            "[carrito] No se pudo guardar el carrito:",
            error instanceof Error ? error.message : error,
        );
        return { ok: false, motivo: "error" };
    }
}

/**
 * Suma una pieza al carrito de la cuenta en sesión, desde el catálogo.
 *
 * El precio no se recibe del cliente a propósito: lo resuelve el servidor desde
 * el catálogo a partir del código de barras y el proveedor. Aceptarlo como
 * argumento permitiría mandar el precio que se quisiera.
 */
export async function agregarAlCarritoDeSesion(
    codigoBarras: string,
    proveedor: string,
): Promise<ResultadoGuardado> {
    const sesion = await obtenerSesion();
    const email = sesion?.user?.email;
    const rol = sesion?.user?.rol;

    if (!email || !rol) return { ok: false, motivo: "sin-sesion" };

    if (typeof codigoBarras !== "string" || typeof proveedor !== "string") {
        return { ok: false, motivo: "error" };
    }

    try {
        const lineas = await agregarAlCarrito(
            email,
            rol,
            codigoBarras,
            proveedor,
        );
        refresh();
        return { ok: true, lineas: paraElRol(lineas, rol) };
    } catch (error) {
        console.error(
            "[carrito] No se pudo agregar al carrito:",
            error instanceof Error ? error.message : error,
        );
        return { ok: false, motivo: "error" };
    }
}

/** Carrito guardado de la cuenta en sesión, sin los importes que no le tocan. */
export async function leerCarritoDeSesion(): Promise<LineaVisible[]> {
    const sesion = await obtenerSesion();
    const email = sesion?.user?.email;
    const rol = sesion?.user?.rol;
    if (!email || !rol) return [];

    return paraElRol(await leerCarrito(email), rol);
}
