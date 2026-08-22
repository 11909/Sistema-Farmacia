import type { DefaultSession, DefaultUser } from "next-auth";
import type { DefaultJWT } from "next-auth/jwt";
import type { Rol } from "@/app/lib/credenciales";

/**
 * Extiende los tipos de NextAuth con `rol` y `zona`, que se añaden en los
 * callbacks `jwt` y `session` de `app/lib/auth.ts`.
 */
declare module "next-auth" {
    interface User extends DefaultUser {
        rol?: Rol;
        /** Solo para cuentas de sucursal. */
        zona?: string | null;
    }

    interface Session {
        user?: DefaultSession["user"] & {
            rol?: Rol;
            zona?: string | null;
        };
    }
}

declare module "next-auth/jwt" {
    interface JWT extends DefaultJWT {
        rol?: Rol;
        zona?: string | null;
    }
}
