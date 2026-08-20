"use client";

import Link from "next/link";
import { useState } from "react";

export default function RecuperarContrasena() {
    const [enviado, setEnviado] = useState(false);

    function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        // TODO: lógica real de envío de correo de recuperación
        setEnviado(true);
    }

    if (enviado) {
        return (
            <div className="text-center space-y-4">
                <div className="inline-flex items-center justify-center w-14 h-14 bg-green-100 rounded-full">
                    <svg
                        className="w-7 h-7 text-green-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 13l4 4L19 7"
                        />
                    </svg>
                </div>
                <h2 className="text-lg font-semibold text-gray-800">
                    Correo enviado
                </h2>
                <p className="text-sm text-gray-600">
                    Si el correo ingresado está registrado, recibirás un enlace
                    para restablecer tu contraseña.
                </p>
                <Link
                    href="/login"
                    className="inline-block mt-4 text-sm text-blue-600 hover:text-blue-800 transition"
                >
                    ← Volver al inicio de sesión
                </Link>
            </div>
        );
    }

    return (
        <>
            <div className="text-center mb-6">
                <h2 className="text-lg font-semibold text-gray-800">
                    Recuperar contraseña
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                    Ingresa tu correo electrónico y te enviaremos un enlace para
                    restablecer tu contraseña.
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
                {/* Email */}
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
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition placeholder:text-gray-400"
                    />
                </div>

                {/* Botón */}
                <button
                    type="submit"
                    className="w-full py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition"
                >
                    Enviar enlace de recuperación
                </button>
            </form>

            {/* Volver */}
            <div className="mt-6 text-center">
                <Link
                    href="/login"
                    className="text-sm text-blue-600 hover:text-blue-800 transition"
                >
                    ← Volver al inicio de sesión
                </Link>
            </div>
        </>
    );
}
