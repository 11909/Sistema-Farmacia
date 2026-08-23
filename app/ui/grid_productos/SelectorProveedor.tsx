"use client";

import { useState } from "react";
import BotonAgregarCarrito from "./BotonAgregarCarrito";
import {
    coloresDe,
    fondoDeSeleccion,
    formatoPrecio,
} from "./coloresProveedor";
import type { PaletasProveedor } from "../../lib/proveedores";
import type { OfertaVisible } from "../../lib/tiposCatalogo";

/**
 * Ranking de proveedores de una tarjeta, con el proveedor elegible.
 *
 * Antes era un componente de servidor que solo pintaba el orden, y al carrito
 * iba siempre el ganador de la comparación. Ahora la fila es seleccionable: el
 * ganador es la opción marcada por defecto, pero se puede comprar a otro
 * proveedor (porque el barato tarda, porque ya se le hace un pedido a esa casa,
 * o por lo que sea), y el botón agrega el que esté seleccionado.
 *
 * La fila elegida se marca con el `bubble_background` de su proveedor, tal como
 * está en `Lista_Proveedores` (ver `fondoDeSeleccion`). Es color plano y no el
 * efecto de burbujas del banner: en una tira de ~40 px el efecto se lee como
 * ruido, y además serían 24 filtros SVG más por página sin aportar nada.
 *
 * Son `input type="radio"` de verdad, escondidos bajo la fila, y no `div` con
 * `onClick`: así el grupo ya trae de fábrica la navegación con flechas, el
 * anuncio de "opción 2 de 4" en un lector de pantalla y el foco visible, que
 * habría que reimplementar a mano con `role="radio"`.
 */

type SelectorProveedorProps = {
    codigoBarras: string;
    nombre: string;
    /**
     * Ofertas ya ordenadas de más barata a más cara, con las agotadas al final.
     * El orden lo decide el servidor (`ofertasOrdenadas`), que es quien tiene los
     * precios; aquí solo se pinta.
     */
    ofertas: OfertaVisible[];
    /**
     * Paletas de `Lista_Proveedores`. De aquí sale el fondo de la fila elegida.
     * Es el mismo objeto para las 24 tarjetas de la página, así que el payload
     * lo serializa una sola vez.
     */
    paletas: PaletasProveedor;
    /** Si se pintan los importes. Con `false` las ofertas llegan sin precio. */
    mostrarPrecios: boolean;
};

export default function SelectorProveedor({
    codigoBarras,
    nombre,
    ofertas,
    paletas,
    mostrarPrecios,
}: SelectorProveedorProps) {
    const disponibles = ofertas.filter((o) => o.disponible);

    // Arranca en el ganador de la comparación: es la recomendación de la
    // tarjeta, y así quien no quiera elegir nada solo pulsa el botón.
    const [seleccionado, setSeleccionado] = useState(
        () => disponibles[0]?.proveedor ?? null,
    );

    // La mayoría de los productos de la hoja solo tiene un proveedor, así que
    // conviene decirlo en lugar de pintar una comparativa de un solo renglón
    // como si fuera el resultado de comparar.
    if (ofertas.length === 0) {
        return (
            <>
                <p className="mt-4 rounded-xl bg-gray-50 px-3 py-2.5 text-[13px] text-gray-500">
                    Sin precios registrados en la hoja.
                </p>
                <BotonAgregarCarrito
                    codigoBarras={codigoBarras}
                    proveedor={null}
                    nombre={nombre}
                />
            </>
        );
    }

    return (
        <>
            <fieldset className="mt-4">
                <legend className="sr-only">
                    Proveedor al que comprar {nombre}
                </legend>

                <div className="flex flex-col gap-1">
                    {ofertas.map((oferta, idx) => {
                        const colores = coloresDe(oferta.proveedor, paletas);
                        const elegido = oferta.proveedor === seleccionado;
                        // Un agotado se sigue listando, porque su puesto en el
                        // ranking es información, pero no se puede comprar.
                        const deshabilitado = !oferta.disponible;

                        return (
                            <label
                                key={oferta.proveedor}
                                // El fondo de la fila elegida es el
                                // `bubble_background` del proveedor, leído de la
                                // hoja. `colores.banner` va con él porque es el
                                // color de texto pensado para ese fondo: sobre el
                                // de Farmacenter, que es casi negro, el texto
                                // tiene que ser blanco.
                                style={elegido ? fondoDeSeleccion(colores) : undefined}
                                // `has-[:focus-visible]` pinta el anillo de foco
                                // en la fila: el radio real está oculto y su
                                // propio anillo no se vería.
                                className={`flex items-center gap-2.5 rounded-xl px-2.5 py-2 transition has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-blue-500 ${elegido ? colores.banner : ""
                                    } ${deshabilitado
                                        ? "cursor-not-allowed"
                                        : "cursor-pointer hover:bg-gray-50"
                                    }`}
                            >
                                <input
                                    type="radio"
                                    className="sr-only"
                                    name={`proveedor-${codigoBarras}`}
                                    value={oferta.proveedor}
                                    checked={elegido}
                                    disabled={deshabilitado}
                                    onChange={() =>
                                        setSeleccionado(oferta.proveedor)
                                    }
                                />

                                {/* Puesto en el ranking. El elegido lo lleva en
                                    su insignia de color; el resto en gris. */}
                                <span
                                    className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full font-mono text-xs font-bold ${elegido
                                        ? colores.insignia
                                        : deshabilitado
                                            ? "text-gray-300"
                                            : "text-gray-400"
                                        }`}
                                >
                                    {idx + 1}
                                </span>

                                <span
                                    className={`truncate text-sm ${elegido
                                        ? "font-bold"
                                        : deshabilitado
                                            ? "font-medium text-gray-300"
                                            : "font-medium text-gray-600"
                                        }`}
                                >
                                    {oferta.proveedor}
                                </span>

                                <span
                                    aria-hidden="true"
                                    className={`min-w-4 flex-1 border-t border-dashed ${elegido
                                        ? "border-current opacity-40"
                                        : deshabilitado
                                            ? "border-gray-200"
                                            : "border-gray-300"
                                        }`}
                                />

                                {deshabilitado ? (
                                    <span className="shrink-0 text-[13px] font-semibold text-rose-400">
                                        Agotado
                                    </span>
                                ) : (
                                    mostrarPrecios &&
                                    oferta.precio !== undefined && (
                                        <span
                                            className={`shrink-0 font-mono text-sm tabular-nums ${elegido
                                                ? "font-bold"
                                                : "font-semibold text-gray-700"
                                                }`}
                                        >
                                            {formatoPrecio(oferta.precio)}
                                        </span>
                                    )
                                )}
                            </label>
                        );
                    })}
                </div>
            </fieldset>

            {/* `key` con el proveedor: cambiar de proveedor remonta el botón y
                con él se va su estado de "Agregado al carrito". Si no, tras
                agregar a City el botón seguiría diciendo "Agregado" al pasar a
                Ofasa, que es justo lo contrario de lo que pasó. */}
            <BotonAgregarCarrito
                key={seleccionado ?? "sin-proveedor"}
                codigoBarras={codigoBarras}
                proveedor={seleccionado}
                nombre={nombre}
            />
        </>
    );
}
