"use client";

import { SessionProvider } from "next-auth/react";

/**
 * Envuelve el árbol en el `SessionProvider` de NextAuth para que los
 * componentes de cliente puedan usar `useSession()`.
 *
 * Tiene que ser un componente de cliente: `SessionProvider` usa contexto
 * de React, que no existe en los Server Components.
 */
export const Provider = ({ children }: { children: React.ReactNode }) => {
    return <SessionProvider>{children}</SessionProvider>;
};
