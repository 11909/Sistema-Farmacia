import type { Metadata } from "next";
import { Suspense } from "react";
import { redirect } from "next/navigation";
import { obtenerSesion } from "../lib/sesion";
import FormularioLogin from "../ui/login/FormularioLogin";

export const metadata: Metadata = {
    title: "Iniciar sesión · Sistema Farmacia",
    description: "Acceso para administradores del Sistema Farmacia.",
};

export default async function LoginPage() {
    // Quien ya tiene sesión no necesita ver el formulario otra vez.
    const sesion = await obtenerSesion();
    if (sesion) redirect("/grid_productos");

    // El formulario lee `callbackUrl` con `useSearchParams`, que obliga a un
    // límite de Suspense para que Next pueda prerenderizar el resto.
    return (
        <Suspense fallback={<div className="h-96" aria-hidden="true" />}>
            <FormularioLogin />
        </Suspense>
    );
}
