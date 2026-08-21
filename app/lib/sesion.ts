import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "./auth";

/**
 * Lee la sesión en el servidor (Server Components, Route Handlers, Server
 * Actions). Devuelve `null` si no hay sesión válida.
 */
export async function obtenerSesion() {
    return getServerSession(authOptions);
}

/**
 * Comprobación autoritativa de acceso para rutas protegidas.
 *
 * `proxy.ts` solo mira si existe la cookie, que es una comprobación optimista
 * para ahorrar renders. La verificación real de la firma del token va aquí,
 * pegada a los datos, y es la que deben usar los layouts y páginas.
 *
 * @param destino Ruta a la que volver después de iniciar sesión.
 */
export async function requerirSesion(destino: string) {
    const sesion = await obtenerSesion();

    if (!sesion?.user?.email) {
        redirect(`/login?callbackUrl=${encodeURIComponent(destino)}`);
    }

    return sesion;
}
