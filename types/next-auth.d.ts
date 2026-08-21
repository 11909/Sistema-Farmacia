import type { DefaultSession, DefaultUser } from "next-auth";
import type { DefaultJWT } from "next-auth/jwt";

/**
 * Extiende los tipos de NextAuth con el campo `rol`, que se añade en los
 * callbacks `jwt` y `session` de `app/lib/auth.ts`.
 */
declare module "next-auth" {
    interface User extends DefaultUser {
        rol?: string;
    }

    interface Session {
        user?: DefaultSession["user"] & { rol?: string };
    }
}

declare module "next-auth/jwt" {
    interface JWT extends DefaultJWT {
        rol?: string;
    }
}
