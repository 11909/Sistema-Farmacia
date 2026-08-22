import NextAuth from "next-auth";
import { authOptions } from "@/app/lib/auth";

/**
 * Endpoint dinámico de NextAuth: atiende /api/auth/signin, /callback,
 * /session, /csrf y /signout. `signIn()` y `useSession()` del cliente hablan
 * con esta ruta.
 */
const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
