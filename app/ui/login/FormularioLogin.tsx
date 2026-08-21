"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { mensajeParaCodigo } from "../../lib/codigosAcceso";
import ModalAviso from "../shared/ModalAviso";

/** Adónde se manda al administrador cuando no venía de una ruta protegida. */
const DESTINO_POR_DEFECTO = "/grid_productos";

export default function FormularioLogin() {
    const [showPassword, setShowPassword] = useState(false);
    const [enviando, setEnviando] = useState(false);
    /** Código de error devuelto por NextAuth, o null si no hay modal abierto. */
    const [codigoError, setCodigoError] = useState<string | null>(null);

    const router = useRouter();
    const searchParams = useSearchParams();

    /**
     * `callbackUrl` lo añade `proxy.ts` al desviar a alguien sin sesión, para
     * devolverlo después a donde quería entrar. Solo se aceptan rutas
     * relativas: admitir una URL absoluta desde el query string abriría un
     * redirect hacia un dominio ajeno.
     */
    const callbackUrl = searchParams.get("callbackUrl");
    const destino =
        callbackUrl?.startsWith("/") && !callbackUrl.startsWith("//")
            ? callbackUrl
            : DESTINO_POR_DEFECTO;

    async function manejarEnvio(evento: React.FormEvent<HTMLFormElement>) {
        evento.preventDefault();
        if (enviando) return;

        setCodigoError(null);
        setEnviando(true);

        const datos = new FormData(evento.currentTarget);

        // `redirect: false` deja que NextAuth devuelva el resultado en lugar de
        // navegar por su cuenta, que es lo que permite abrir el modal.
        const resultado = await signIn("credentials", {
            redirect: false,
            email: String(datos.get("email") ?? ""),
            password: String(datos.get("password") ?? ""),
        });

        if (!resultado?.ok) {
            // `error` trae el código lanzado por `authorize`.
            setCodigoError(resultado?.error ?? "DESCONOCIDO");
            setEnviando(false);
            return;
        }

        // Al entrar sí se navega. `refresh()` revalida los Server Components
        // para que el layout de /grid_productos vea la sesión recién creada.
        router.replace(destino);
        router.refresh();
    }

    const mensaje = mensajeParaCodigo(codigoError);

    return (
        <>
            {/* Sin `noValidate`: el navegador exige `required` y el formato de
                correo antes de llegar al servidor. */}
            <form className="space-y-5" onSubmit={manejarEnvio}>
                {/* Email / Usuario */}
                <div>
                    <label
                        htmlFor="email"
                        className="block text-sm font-medium text-gray-700 mb-1"
                    >
                        Correo electrónico
                    </label>
                    <input
                        id="email"
                        name="email"
                        type="email"
                        autoComplete="email"
                        required
                        placeholder="tu@correo.com"
                        // `text-gray-800` explícito: sin él el input hereda el
                        // color del <body>, que en modo oscuro es casi blanco y
                        // desaparece sobre la tarjeta blanca del login.
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition placeholder:text-gray-400"
                    />
                </div>

                {/* Contraseña */}
                <div>
                    <label
                        htmlFor="password"
                        className="block text-sm font-medium text-gray-700 mb-1"
                    >
                        Contraseña
                    </label>
                    <div className="relative">
                        <input
                            id="password"
                            name="password"
                            type={showPassword ? "text" : "password"}
                            autoComplete="current-password"
                            required
                            placeholder="••••••••"
                            // Mismo motivo que en el campo de correo: el color
                            // heredado lo vuelve ilegible en modo oscuro.
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition placeholder:text-gray-400 pr-12"
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition"
                            aria-label={
                                showPassword ? "Ocultar contraseña" : "Mostrar contraseña"
                            }
                        >
                            {showPassword ? (
                                <svg
                                    className="w-5 h-5"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L6.59 6.59m7.532 7.532l3.29 3.29M3 3l18 18"
                                    />
                                </svg>
                            ) : (
                                <svg
                                    className="w-5 h-5"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                    />
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                                    />
                                </svg>
                            )}
                        </button>
                    </div>
                </div>

                {/* Recordar + Olvidé */}
                <div className="flex items-center justify-between">
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input
                            type="checkbox"
                            className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-600">Recordarme</span>
                    </label>
                    <a
                        href="/login/recuperar_contrasena"
                        className="text-sm text-blue-600 hover:text-blue-800 transition"
                    >
                        ¿Olvidaste tu contraseña?
                    </a>
                </div>

                {/* Botón */}
                <button
                    type="submit"
                    disabled={enviando}
                    className="w-full py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition disabled:cursor-not-allowed disabled:bg-blue-400"
                >
                    {enviando ? "Verificando..." : "Iniciar sesión"}
                </button>
            </form>

            <ModalAviso
                abierto={codigoError !== null}
                titulo={mensaje.titulo}
                detalle={mensaje.detalle}
                onCerrar={() => setCodigoError(null)}
            />
        </>
    );
}
