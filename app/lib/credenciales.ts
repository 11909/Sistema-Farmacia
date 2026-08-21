import { timingSafeEqual } from "node:crypto";

/**
 * Utilidades compartidas por las pestañas de cuentas (`Administrador` y
 * `Sucursal`). Viven aparte para que la comparación de contraseñas exista una
 * sola vez: duplicarla es la forma habitual de que una copia se quede sin el
 * endurecimiento que tiene la otra.
 */

/** Rol de la cuenta, según la pestaña donde se encontró el correo. */
export type Rol = "administrador" | "sucursal";

/** Cuenta autenticada, con lo mínimo que necesita la interfaz. */
export type Cuenta = {
    email: string;
    /** Texto que se muestra en la barra superior. Nunca vacío. */
    nombreCompleto: string;
    telefono: string;
    rol: Rol;
    /** Solo para sucursales; `null` en administradores. */
    zona: string | null;
};

/** Fila localizada en una pestaña, con la contraseña aún sin comparar. */
export type CuentaConCredencial = {
    cuenta: Cuenta;
    contrasena: string;
};

/** Normaliza para comparar correos: sin espacios y en minúsculas. */
export function normalizarEmail(valor: string): string {
    return valor.trim().toLowerCase();
}

/**
 * Compara dos secretos sin cortar en el primer byte distinto.
 *
 * `timingSafeEqual` exige buffers del mismo tamaño, así que se rellenan al
 * largo mayor y la diferencia de longitud se comprueba aparte.
 */
export function contrasenaCoincide(
    recibida: string,
    esperada: string,
): boolean {
    const a = Buffer.from(recibida, "utf8");
    const b = Buffer.from(esperada, "utf8");
    const largo = Math.max(a.length, b.length, 1);

    const aRelleno = Buffer.alloc(largo);
    const bRelleno = Buffer.alloc(largo);
    a.copy(aRelleno);
    b.copy(bRelleno);

    return timingSafeEqual(aRelleno, bRelleno) && a.length === b.length;
}

/**
 * Nombre a mostrar cuando las columnas de nombre están vacías.
 *
 * En la pestaña `Sucursal` la columna `nombre` está vacía en todas las filas,
 * así que sin esto la barra superior saldría en blanco. Se degrada a la zona y,
 * en última instancia, a la parte local del correo.
 */
export function nombreParaMostrar(
    partes: (string | null | undefined)[],
    email: string,
): string {
    const nombre = partes
        .map((p) => p?.trim() ?? "")
        .filter(Boolean)
        .join(" ");

    return nombre || email.split("@")[0] || email;
}
