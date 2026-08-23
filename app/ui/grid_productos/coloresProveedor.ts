import type { CSSProperties } from "react";
import { claveProveedor } from "../../lib/nombresProveedor";
import type { PaletaBurbujas } from "./BurbujasPrecio";
import type {
    PaletasProveedor,
    ParadasSeleccion,
} from "../../lib/proveedores";

/**
 * Identidad visual de cada proveedor.
 *
 * Vive fuera de las páginas porque la comparten el catálogo
 * (`app/grid_productos/page.tsx`) y el carrito
 * (`app/grid_productos/carrito/page.tsx`): el color tiene que significar lo
 * mismo en los dos sitios para que el usuario reconozca de un vistazo quién
 * gana la comparación y de quién es cada partida del pedido.
 *
 * City -> azul, Ofasa -> naranja, Farmacenter -> negro, Tenorio -> amarillo.
 *
 * La excepción es el total del resumen del carrito: ahí el pedido es de varios
 * proveedores a la vez, así que no usa ninguna de estas paletas y deja a
 * `BurbujasPrecio` pintar la suya (fondo blanco, burbujas verdes).
 */
export type ColoresProveedor = {
    /** Color de texto del banner de mejor precio (el fondo lo pintan las burbujas). */
    banner: string;
    /**
     * Paleta de las burbujas animadas del banner.
     *
     * Es el único campo que la hoja puede sustituir: las columnas
     * `bubble_color` y `bubble_background` de `Lista_Proveedores` mandan sobre
     * lo que hay aquí (ver `coloresDe`). El resto son clases de Tailwind, que
     * tienen que existir en el código para que el compilador las genere.
     */
    burbujas: PaletaBurbujas;
    /** Insignia circular del puesto en el ranking / etiqueta del proveedor. */
    insignia: string;
    /**
     * Relleno y anillo del cristal de los chips que van encima de las burbujas
     * (ver `ChipCristal` en `CarritoCliente`).
     *
     * El tinte sigue la luminosidad de la paleta, no el gusto: un velo blanco
     * sobre las burbujas oscuras de Farmacenter las aclararía y el texto blanco
     * del grupo perdería contraste, así que ahí el cristal es ahumado.
     */
    cristal: string;
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
        cristal: "bg-white/40 ring-white/60",
    },
    Farmacenter: {
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
        // neutral-600 y no 800: el 800 es exactamente el mismo tono que
        // `--bp-fondo1`, así que sobre el fondo de la fila seleccionada del
        // selector la insignia se volvería invisible. Sobre blanco, que es donde
        // la usa el desglose del carrito, los dos tonos funcionan igual.
        insignia: "bg-neutral-600 text-white",
        // Cristal ahumado: aquí el texto del grupo es blanco.
        cristal: "bg-black/25 ring-white/25",
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
        cristal: "bg-white/45 ring-white/70",
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
        cristal: "bg-white/45 ring-white/70",
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
    cristal: "bg-white/45 ring-white/60",
};

/**
 * Paleta del proveedor, con respaldo neutro si el nombre no está registrado.
 *
 * Si se le pasan las paletas de `Lista_Proveedores` (las trae
 * `obtenerCatalogo` en el servidor), las burbujas salen de la hoja y el
 * resto de la identidad sigue viniendo del código. Cuando el proveedor no está
 * en la hoja, o tiene las celdas de color vacías o mal formadas, se queda con
 * `burbujas` de `COLOR_PROVEEDOR`: así un error de dedo en una celda no deja el
 * banner sin fondo.
 */
export function coloresDe(
    proveedor: string | null | undefined,
    paletas?: PaletasProveedor,
): ColoresProveedor {
    if (!proveedor) return COLOR_NEUTRO;

    const base = COLOR_PROVEEDOR[proveedor] ?? COLOR_NEUTRO;
    if (!paletas) return base;

    const deLaHoja = paletas[claveProveedor(proveedor)];
    return deLaHoja ? { ...base, burbujas: deLaHoja } : base;
}

/**
 * Ángulo del degradado de `bubble_background`, el mismo que usa la capa de
 * burbujas (ver `BurbujasPrecio.module.scss`), para que el fondo del proveedor
 * se vea igual lo pinte quien lo pinte.
 */
const ANGULO_FONDO = "40deg";

/**
 * Fondo con el que se marca el proveedor seleccionado.
 *
 * Son las dos paradas de la columna `selector_color` de `Lista_Proveedores`: una
 * versión más clara de `bubble_background`, porque la fila del selector mide
 * ~40 px y el tinte del banner resulta demasiado cargado a ese tamaño.
 *
 * Si la hoja no trae `selector_color` para ese proveedor, cae a
 * `bubble_background`, que es el degradado del banner y siempre está. Es una
 * degradación sensata: la fila se ve más cargada de lo previsto, pero se sigue
 * leyendo como seleccionada y el color de texto de `banner` sigue contrastando.
 *
 * Va como `style` en lugar de una clase de Tailwind porque el valor sale de la
 * hoja: el compilador no puede generar una clase para un color que no está
 * escrito en el código. Los valores ya vienen filtrados por `COLOR_VALIDO` en
 * `proveedores.ts`, que es lo que evita que una celda cuele algo raro en el
 * atributo.
 *
 * Devuelve `{}` solo si no hay ninguno de los dos, y entonces la fila se queda
 * sin fondo en lugar de con un degradado a medias.
 */
export function fondoDeSeleccion(
    colores: ColoresProveedor,
    paradas: ParadasSeleccion | undefined,
): CSSProperties {
    const [fondo1, fondo2] = paradas ?? [
        colores.burbujas["--bp-fondo1"],
        colores.burbujas["--bp-fondo2"],
    ];
    if (!fondo1 || !fondo2) return {};

    return {
        backgroundImage: `linear-gradient(${ANGULO_FONDO}, ${fondo1}, ${fondo2})`,
    };
}

/** Precio con dos decimales: $1234.50 */
export function formatoPrecio(valor: number) {
    return `$${valor.toFixed(2)}`;
}

/** Precio sin decimales, para rangos compactos ($45-$60). */
export function precioCompacto(valor: number) {
    return `$${Math.round(valor)}`;
}


