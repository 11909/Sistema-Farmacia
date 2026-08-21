import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { intentarAcceso } from "./administradores";
import { CODIGO_ACCESO } from "./codigosAcceso";

/**
 * Configuración de NextAuth.
 *
 * Un solo proveedor de credenciales, validado contra la pestaña
 * `Administrador` de Google Sheets. La estrategia de sesión es JWT porque no
 * hay base de datos donde persistir sesiones: el token va firmado en cookie.
 */
export const authOptions: NextAuthOptions = {
    providers: [
        CredentialsProvider({
            id: "credentials",
            name: "Correo y contraseña",
            credentials: {
                email: { label: "Correo electrónico", type: "email" },
                password: { label: "Contraseña", type: "password" },
            },
            /**
             * Devolver un usuario acepta el acceso; lanzar un Error lo rechaza
             * y NextAuth reenvía el `message` al cliente como `error`. Por eso
             * los mensajes son códigos y no frases.
             */
            async authorize(credentials) {
                const email = credentials?.email ?? "";
                const password = credentials?.password ?? "";

                let resultado;
                try {
                    resultado = await intentarAcceso(email, password);
                } catch (error) {
                    // Un fallo de red o de permisos contra Sheets no debe
                    // presentarse como "usuario inexistente".
                    console.error(
                        "[auth] Fallo al consultar la pestaña Administrador:",
                        error instanceof Error ? error.message : error,
                    );
                    throw new Error(CODIGO_ACCESO.errorHoja);
                }

                if (resultado.estado === "usuario-inexistente") {
                    throw new Error(CODIGO_ACCESO.usuarioInexistente);
                }

                if (resultado.estado === "contrasena-incorrecta") {
                    throw new Error(CODIGO_ACCESO.contrasenaIncorrecta);
                }

                const admin = resultado.administrador;

                // Lo que se devuelve aquí alimenta el callback `jwt`.
                return {
                    id: admin.email,
                    email: admin.email,
                    name: admin.nombreCompleto,
                    rol: "administrador",
                };
            },
        }),
    ],

    session: {
        strategy: "jwt",
        maxAge: 8 * 60 * 60, // 8 horas, aproximadamente un turno de trabajo
    },

    pages: {
        signIn: "/login",
        error: "/login",
    },

    callbacks: {
        // `user` solo llega en el inicio de sesión; en las renovaciones
        // siguientes el rol ya viene dentro del token.
        async jwt({ token, user }) {
            if (user) token.rol = user.rol;
            return token;
        },
        async session({ session, token }) {
            if (session.user) session.user.rol = token.rol;
            return session;
        },
    },

    secret: process.env.NEXTAUTH_SECRET,
};
