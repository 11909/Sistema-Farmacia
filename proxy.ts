import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

/**
 * Proxy: lo que en Next 15 y anteriores se llamaba `middleware.ts`.
 *
 * Filtra de forma optimista las peticiones sin sesión para que no lleguen a
 * renderizar rutas protegidas. NO es la capa de autorización: la comprobación
 * autoritativa está en `requerirSesion()`, que se llama desde el layout de
 * /grid_productos, junto a los datos.
 */
export async function proxy(request: NextRequest) {
    const token = await getToken({
        req: request,
        secret: process.env.NEXTAUTH_SECRET,
    });

    if (token) return NextResponse.next();

    const destino = new URL("/login", request.url);
    destino.searchParams.set(
        "callbackUrl",
        request.nextUrl.pathname + request.nextUrl.search,
    );

    return NextResponse.redirect(destino);
}

export const config = {
    // Cubre /grid_productos y todo lo que cuelgue debajo.
    matcher: ["/grid_productos", "/grid_productos/:path*"],
};
