/**
 * Códigos de error que viajan del servidor al formulario de login.
 *
 * NextAuth propaga el `message` del Error que lanza `authorize` como parámetro
 * `error` en la respuesta de `signIn()`. Se usan códigos y no frases para que
 * el texto visible viva en el cliente y el contrato no dependa de la redacción.
 *
 * Este módulo no importa nada del servidor a propósito: lo comparten el
 * proveedor de credenciales y el componente de cliente.
 */
export const CODIGO_ACCESO = {
    usuarioInexistente: "USUARIO_INEXISTENTE",
    contrasenaIncorrecta: "CONTRASENA_INCORRECTA",
    errorHoja: "ERROR_HOJA_CALCULO",
} as const;

export type CodigoAcceso =
    (typeof CODIGO_ACCESO)[keyof typeof CODIGO_ACCESO];

/** Texto que se muestra en el modal para cada código. */
export const MENSAJE_ACCESO: Record<
    CodigoAcceso,
    { titulo: string; detalle: string }
> = {
    [CODIGO_ACCESO.usuarioInexistente]: {
        titulo: "Usuario inexistente",
        detalle:
            "El correo que ingresaste no está registrado como administrador. Verifícalo e inténtalo de nuevo.",
    },
    [CODIGO_ACCESO.contrasenaIncorrecta]: {
        titulo: "Contraseña incorrecta",
        detalle:
            "El correo existe, pero la contraseña no coincide. Revísala e inténtalo de nuevo.",
    },
    [CODIGO_ACCESO.errorHoja]: {
        titulo: "No se pudo verificar tu acceso",
        detalle:
            "Hubo un problema al consultar la base de datos. Espera un momento e inténtalo de nuevo.",
    },
};

/** Mensaje de reserva para cualquier error no contemplado. */
export const MENSAJE_GENERICO = {
    titulo: "No se pudo iniciar sesión",
    detalle: "Ocurrió un error inesperado. Inténtalo de nuevo.",
};

export function mensajeParaCodigo(codigo: string | null | undefined) {
    if (codigo && codigo in MENSAJE_ACCESO) {
        return MENSAJE_ACCESO[codigo as CodigoAcceso];
    }
    return MENSAJE_GENERICO;
}
