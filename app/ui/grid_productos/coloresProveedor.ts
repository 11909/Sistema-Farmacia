import type { PaletaBurbujas } from "./BurbujasPrecio";

/**
 * Identidad visual de cada proveedor.
 *
 * Vive fuera de las páginas porque la comparten el catálogo
 * (`app/grid_productos/page.tsx`) y el carrito
 * (`app/grid_productos/carrito/page.tsx`): el color tiene que significar lo
 * mismo en los dos sitios para que el usuario reconozca de un vistazo quién
 * gana la comparación y de quién es cada partida del pedido.
 *
 * City -> azul, Ofasa -> naranja, Farmater -> negro, Tenorio -> amarillo.
 */
export type ColoresProveedor = {
    /** Color de texto del banner de mejor precio (el fondo lo pintan las burbujas). */
    banner: string;
    /** Paleta de las burbujas animadas del banner. */
    burbujas: PaletaBurbujas;
    /** Insignia circular del primer lugar / etiqueta del proveedor. */
    insignia: string;
    /** Fondo suave de la fila ganadora del ranking o del grupo del carrito. */
    fila: string;
    /** Guion separador de la fila ganadora. */
    guion: string;
};

export const COLOR_PROVEEDOR: Record<string, ColoresProveedor> = {
    City: {
        banner: "text-blue-950",
        burbujas: {
            "--bp-fondo1": "rgb(219, 234, 254)",
            "--bp-fondo2": "rgb(239, 246, 255)",
            "--bp-color1": "147, 197, 253",
            "--bp-color2": "96, 165, 250",
            "--bp-color3": "191, 219, 254",
            "--bp-color4": "59, 130, 246",
        },
        insignia: "bg-blue-600 text-white",
        fila: "bg-blue-50",
        guion: "border-blue-300",
    },
    Farmater: {
        // Único caso con texto claro. Tras el umbral del filtro las manchas
        // quedan opacas, así que ninguna pasa de neutral-500: por encima de ese
        // tono el texto blanco del banner dejaría de contrastar.
        banner: "text-white",
        burbujas: {
            "--bp-fondo1": "rgb(38, 38, 38)",
            "--bp-fondo2": "rgb(23, 23, 23)",
            "--bp-color1": "82, 82, 82",
            "--bp-color2": "115, 115, 115",
            "--bp-color3": "64, 64, 64",
            "--bp-color4": "96, 96, 96",
        },
        insignia: "bg-neutral-800 text-white",
        fila: "bg-neutral-100",
        guion: "border-neutral-400",
    },
    Ofasa: {
        banner: "text-orange-950",
        burbujas: {
            "--bp-fondo1": "rgb(255, 237, 213)",
            "--bp-fondo2": "rgb(255, 247, 237)",
            "--bp-color1": "253, 186, 116",
            "--bp-color2": "249, 115, 22",
            "--bp-color3": "254, 215, 170",
            "--bp-color4": "251, 146, 60",
        },
        insignia: "bg-orange-500 text-white",
        fila: "bg-orange-50",
        guion: "border-orange-300",
    },
    Tenorio: {
        banner: "text-amber-950",
        burbujas: {
            "--bp-fondo1": "rgb(254, 243, 199)",
            "--bp-fondo2": "rgb(255, 251, 235)",
            "--bp-color1": "252, 211, 77",
            "--bp-color2": "245, 158, 11",
            "--bp-color3": "253, 230, 138",
            "--bp-color4": "251, 191, 36",
        },
        insignia: "bg-amber-400 text-amber-950",
        fila: "bg-amber-50",
        guion: "border-amber-400",
    },
};

/** Respaldo para proveedores sin paleta propia (o cuando no hay ganador). */
export const COLOR_NEUTRO: ColoresProveedor = {
    banner: "text-gray-900",
    burbujas: {
        "--bp-fondo1": "rgb(229, 231, 235)",
        "--bp-fondo2": "rgb(243, 244, 246)",
        "--bp-color1": "209, 213, 219",
        "--bp-color2": "156, 163, 175",
        "--bp-color3": "229, 231, 235",
        "--bp-color4": "107, 114, 128",
    },
    insignia: "bg-gray-500 text-white",
    fila: "bg-gray-50",
    guion: "border-gray-300",
};

/** Paleta del proveedor, con respaldo neutro si el nombre no está registrado. */
export function coloresDe(proveedor: string | null | undefined) {
    if (!proveedor) return COLOR_NEUTRO;
    return COLOR_PROVEEDOR[proveedor] ?? COLOR_NEUTRO;
}

/** Precio con dos decimales: $1234.50 */
export function formatoPrecio(valor: number) {
    return `$${valor.toFixed(2)}`;
}

/** Precio sin decimales, para rangos compactos ($45-$60). */
export function precioCompacto(valor: number) {
    return `$${Math.round(valor)}`;
}
