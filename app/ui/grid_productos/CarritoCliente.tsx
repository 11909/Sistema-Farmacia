"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import BotonCopiarCodigo from "./BotonCopiarCodigo";
import BurbujasPrecio from "./BurbujasPrecio";
import { coloresDe, formatoPrecio } from "./coloresProveedor";
import type { PaletasProveedor } from "../../lib/proveedores";
import {
    confirmarPedidoDeSesion,
    guardarCarritoDeSesion,
} from "../../lib/acciones/carrito";
import {
    acotarCantidad,
    CANTIDAD_MAXIMA,
    type LineaVisible,
} from "../../lib/tiposCarrito";

/**
 * Margen antes de guardar en la hoja.
 *
 * Pulsar `+` cinco veces son cinco cambios de estado pero un solo guardado:
 * cada escritura son varias llamadas a la API de Sheets y no conviene lanzarlas
 * por cada clic.
 */
const ESPERA_GUARDADO_MS = 700;

/** Tipo MIME de un .xlsx. Sin él el navegador lo guardaría como binario suelto. */
const TIPO_XLSX =
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";

/**
 * Dispara la descarga de un archivo que llegó en base64.
 *
 * El .xlsx viene como valor de retorno de la Server Action, así que aquí se
 * reconstruye en memoria y se baja con un enlace sintético: no hay URL que
 * visitar, y así tampoco hace falta un endpoint que autorizar aparte.
 */
function descargarBase64(base64: string, nombre: string) {
    const binario = atob(base64);
    const bytes = new Uint8Array(binario.length);
    for (let i = 0; i < binario.length; i++) bytes[i] = binario.charCodeAt(i);

    const url = URL.createObjectURL(new Blob([bytes], { type: TIPO_XLSX }));

    const enlace = document.createElement("a");
    enlace.href = url;
    enlace.download = nombre;
    document.body.append(enlace);
    enlace.click();
    enlace.remove();

    // Se libera en el siguiente turno: revocar en el mismo tick puede cancelar
    // la descarga que el clic acaba de iniciar.
    setTimeout(() => URL.revokeObjectURL(url), 0);
}

function IconoAhorro() {
    return (
        <svg
            aria-hidden="true"
            className="h-4 w-4"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            viewBox="0 0 24 24"
        >
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3 7l6 6 4-4 8 8m0 0h-5m5 0v-5"
            />
        </svg>
    );
}

function IconoCarrito({ className = "h-5 w-5" }: { className?: string }) {
    return (
        <svg
            aria-hidden="true"
            className={className}
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            viewBox="0 0 24 24"
        >
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
            />
        </svg>
    );
}

function IconoBasura() {
    return (
        <svg
            aria-hidden="true"
            className="h-4 w-4"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.8}
            viewBox="0 0 24 24"
        >
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4 7h16M10 11v6M14 11v6M5 7l1 12a2 2 0 002 2h8a2 2 0 002-2l1-12M9 7V5a1 1 0 011-1h4a1 1 0 011 1v2"
            />
        </svg>
    );
}

/**
 * Lámina de cristal líquido para los datos que van sobre las burbujas de la
 * cabecera de grupo.
 *
 * La receta son cuatro capas: el velo translúcido y el anillo (los aporta la
 * paleta vía `cristal`, porque el tinte tiene que seguir la luminosidad del
 * proveedor), el `backdrop-blur` que difumina las burbujas justo detrás del chip
 * —de ahí la lectura de vidrio, y lo que despega el dato del fondo en
 * movimiento— y un box-shadow doble: el bisel interior claro arriba simula el
 * canto del cristal y la sombra exterior baja lo levanta del banner.
 */
function ChipCristal({
    cristal,
    className = "",
    children,
}: {
    cristal: string;
    className?: string;
    children: React.ReactNode;
}) {
    return (
        <span
            className={`inline-flex items-center rounded-full ring-1 ring-inset backdrop-blur-md backdrop-saturate-150 shadow-[inset_0_1px_0_rgba(255,255,255,0.45),0_1px_2px_rgba(15,23,42,0.10)] ${cristal} ${className}`}
        >
            {children}
        </span>
    );
}

/**
 * Etiqueta con el nombre del proveedor, sobre cristal.
 *
 * El texto va en `currentColor`: hereda el color del grupo y contrasta tanto
 * sobre las paletas claras (texto oscuro) como sobre la de Farmacenter (blanco),
 * sin necesitar un caso por proveedor.
 */
function EtiquetaProveedor({
    proveedor,
    cristal,
}: {
    proveedor: string;
    cristal: string;
}) {
    return (
        <ChipCristal
            cristal={cristal}
            className="px-3 py-1 text-[11px] font-bold uppercase tracking-[0.08em]"
        >
            {proveedor}
        </ChipCristal>
    );
}

type SelectorCantidadProps = {
    valor: number;
    maximo: number;
    etiqueta: string;
    onCambio: (cantidad: number) => void;
};

/**
 * Stepper de cantidad. El número es un `input` para poder teclear pedidos
 * grandes sin pulsar el `+` cincuenta veces; el valor se normaliza al salir del
 * campo para que nunca quede vacío ni fuera del rango permitido.
 */
function SelectorCantidad({
    valor,
    maximo,
    etiqueta,
    onCambio,
}: SelectorCantidadProps) {
    const [borrador, setBorrador] = useState<string | null>(null);
    const tope = Math.min(maximo, CANTIDAD_MAXIMA);

    function confirmar(texto: string) {
        const numero = Number.parseInt(texto, 10);
        setBorrador(null);
        if (Number.isNaN(numero)) return;
        onCambio(Math.min(Math.max(numero, 1), tope));
    }

    return (
        <div className="inline-flex items-center rounded-xl border border-gray-200 bg-gray-50 p-1">
            <button
                type="button"
                onClick={() => onCambio(valor - 1)}
                disabled={valor <= 1}
                aria-label={`Quitar una pieza de ${etiqueta}`}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-lg font-semibold leading-none text-gray-600 transition hover:bg-white hover:text-gray-900 hover:shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 disabled:cursor-not-allowed disabled:text-gray-300 disabled:hover:bg-transparent disabled:hover:shadow-none"
            >
                −
            </button>

            <label className="sr-only" htmlFor={`cantidad-${etiqueta}`}>
                Cantidad de {etiqueta}
            </label>
            <input
                id={`cantidad-${etiqueta}`}
                type="text"
                inputMode="numeric"
                value={borrador ?? String(valor)}
                onChange={(e) => setBorrador(e.target.value.replace(/\D/g, ""))}
                onBlur={(e) => confirmar(e.target.value)}
                onKeyDown={(e) => {
                    if (e.key === "Enter") e.currentTarget.blur();
                }}
                className="w-11 bg-transparent text-center font-mono text-sm font-bold tabular-nums text-gray-900 focus:outline-none focus-visible:rounded focus-visible:ring-2 focus-visible:ring-blue-500"
            />

            <button
                type="button"
                onClick={() => onCambio(valor + 1)}
                disabled={valor >= tope}
                aria-label={`Agregar una pieza de ${etiqueta}`}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-lg font-semibold leading-none text-gray-600 transition hover:bg-white hover:text-gray-900 hover:shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 disabled:cursor-not-allowed disabled:text-gray-300 disabled:hover:bg-transparent disabled:hover:shadow-none"
            >
                +
            </button>
        </div>
    );
}

type FilaProductoProps = {
    linea: LineaVisible;
    onCantidad: (id: string, cantidad: number) => void;
    onEliminar: (id: string) => void;
};

/** Una partida del pedido dentro del grupo de su proveedor. */
function FilaProducto({ linea, onCantidad, onEliminar }: FilaProductoProps) {
    // Sin precio no hay importes que calcular: la partida es de una sucursal y
    // los campos vienen recortados desde el servidor.
    const subtotal =
        linea.precioUnitario !== undefined
            ? linea.precioUnitario * linea.cantidad
            : null;
    const ahorroLinea =
        linea.precioUnitario !== undefined && linea.precioMasAlto !== undefined
            ? (linea.precioMasAlto - linea.precioUnitario) * linea.cantidad
            : 0;
    const casiAgotado = linea.existencias - linea.cantidad <= 3;

    return (
        <li className="flex flex-col gap-4 px-5 py-5 sm:flex-row sm:items-center sm:gap-5 sm:px-7">
            {/* Identificación del medicamento */}
            <div className="min-w-0 flex-1">
                {/* Texto plano y no enlace: no hay ficha de producto a la que
                    llevar, `/grid_productos/[codigo]` no existe como ruta. */}
                <h3 className="text-base font-bold leading-snug text-gray-900">
                    {linea.nombre}
                </h3>
                {linea.unidad && (
                    <p className="mt-0.5 text-[13px] text-gray-500">
                        Se surte por {linea.unidad}
                    </p>
                )}

                <div className="mt-1.5 flex items-center gap-1.5">
                    <span className="font-mono text-[13px] tracking-tight text-gray-400">
                        {linea.codigoBarras}
                    </span>
                    <BotonCopiarCodigo codigo={linea.codigoBarras} />
                </div>

                {casiAgotado && (
                    <p className="mt-2 text-[13px] font-semibold text-amber-600">
                        Solo {linea.existencias} piezas en existencia
                    </p>
                )}
            </div>

            {/* Precio unitario. Solo para administradores. */}
            {linea.precioUnitario !== undefined && (
                <div className="shrink-0 sm:w-28 sm:text-right">
                    <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-gray-400">
                        Unitario
                    </p>
                    <p className="font-mono text-sm font-semibold tabular-nums text-gray-700">
                        {formatoPrecio(linea.precioUnitario)}
                    </p>
                </div>
            )}

            {/* Cantidad */}
            <div className="shrink-0">
                <SelectorCantidad
                    valor={linea.cantidad}
                    maximo={linea.existencias}
                    etiqueta={linea.nombre}
                    onCambio={(cantidad) => onCantidad(linea.id, cantidad)}
                />
            </div>

            {/* Subtotal y eliminar */}
            <div
                className={`flex shrink-0 items-center gap-3 ${subtotal !== null
                    ? "justify-between sm:w-36 sm:justify-end"
                    : "justify-end"
                    }`}
            >
                {subtotal !== null && (
                    <div className="sm:text-right">
                        <p className="font-mono text-lg font-bold tabular-nums text-gray-900">
                            {formatoPrecio(subtotal)}
                        </p>
                        {ahorroLinea > 0 && (
                            <p className="font-mono text-[13px] font-semibold tabular-nums text-emerald-600">
                                −{formatoPrecio(ahorroLinea)}
                            </p>
                        )}
                    </div>
                )}

                <button
                    type="button"
                    onClick={() => onEliminar(linea.id)}
                    aria-label={`Eliminar ${linea.nombre} del carrito`}
                    className="rounded-lg p-2 text-gray-400 transition hover:bg-rose-50 hover:text-rose-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-500"
                >
                    <IconoBasura />
                </button>
            </div>
        </li>
    );
}

/**
 * Estado de sincronización con la hoja.
 *
 * `aria-live="polite"` para que un lector de pantalla anuncie el cambio sin
 * interrumpir; el carrito se guarda solo y sin esto no habría forma de saberlo.
 */
function EstadoGuardado({
    estado,
}: {
    estado: "sincronizado" | "guardando" | "error";
}) {
    if (estado === "error") {
        return (
            <p
                aria-live="polite"
                className="text-sm font-semibold text-rose-600"
            >
                No se pudo guardar el carrito
            </p>
        );
    }

    return (
        <p aria-live="polite" className="text-sm text-gray-400">
            {estado === "guardando" ? "Guardando..." : "Carrito guardado"}
        </p>
    );
}

/** Carrito vacío: mismo lenguaje de tarjeta, con la salida hacia el catálogo. */
function CarritoVacio() {
    return (
        <div className="rounded-3xl bg-white p-12 text-center shadow-sm ring-1 ring-gray-200/80">
            <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-blue-50 text-blue-600">
                <IconoCarrito className="h-8 w-8" />
            </span>
            <h2 className="mt-5 text-lg font-bold text-gray-900">
                Tu carrito está vacío
            </h2>
            <p className="mx-auto mt-1.5 max-w-sm text-sm text-gray-500">
                Compara precios entre proveedores y agrega los medicamentos que
                necesites para armar tu pedido.
            </p>
            <Link
                href="/grid_productos"
                className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-slate-800 px-6 py-3.5 text-base font-semibold text-white transition hover:bg-slate-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
            >
                Ver catálogo
            </Link>
        </div>
    );
}

function IconoDescarga({ className = "h-5 w-5" }: { className?: string }) {
    return (
        <svg
            aria-hidden="true"
            className={className}
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            viewBox="0 0 24 24"
        >
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 4v11m0 0l-4-4m4 4l4-4M4 19h16"
            />
        </svg>
    );
}

/**
 * Comprobante del pedido confirmado.
 *
 * Ocupa el sitio del carrito una vez confirmado, porque el carrito ya no
 * existe: la hoja lo cerró con su folio y la cuenta arranca uno nuevo en cuanto
 * agregue algo. El folio se muestra porque es la referencia con la que la
 * farmacia encuentra el pedido en la hoja.
 *
 * La descarga se repite desde aquí: el navegador puede bloquear la automática,
 * y el archivo ya está en memoria, así que volver a bajarlo no cuesta otra
 * confirmación.
 */
function PedidoConfirmadoAviso({
    folio,
    onDescargar,
}: {
    folio: string;
    onDescargar: () => void;
}) {
    return (
        <div
            aria-live="polite"
            className="rounded-3xl bg-white p-12 text-center shadow-sm ring-1 ring-gray-200/80"
        >
            <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                <svg
                    aria-hidden="true"
                    className="h-8 w-8"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    viewBox="0 0 24 24"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M5 13l4 4L19 7"
                    />
                </svg>
            </span>

            <h2 className="mt-5 text-lg font-bold text-gray-900">
                Pedido confirmado
            </h2>
            <p className="mx-auto mt-1.5 max-w-md text-sm text-gray-500">
                Quedó registrado con el folio{" "}
                <span className="font-mono font-bold text-gray-700">{folio}</span>{" "}
                y se descargó la hoja de cálculo con las partidas. Tu carrito
                está listo para el siguiente pedido.
            </p>

            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                <button
                    type="button"
                    onClick={onDescargar}
                    className="inline-flex items-center gap-2 rounded-2xl bg-slate-800 px-6 py-3.5 text-base font-semibold text-white transition hover:bg-slate-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                >
                    <IconoDescarga />
                    Descargar de nuevo
                </button>
                <Link
                    href="/grid_productos"
                    className="inline-flex items-center gap-2 rounded-2xl px-6 py-3.5 text-base font-semibold text-blue-700 transition hover:text-blue-900 focus:outline-none focus-visible:underline"
                >
                    Volver al catálogo
                </Link>
            </div>
        </div>
    );
}

export default function CarritoCliente({
    lineasIniciales,
    paletas,
    mostrarPrecios,
}: {
    lineasIniciales: LineaVisible[];
    /**
     * Colores de burbujas de `Lista_Proveedores`. Llegan como prop desde la
     * página: leerlos aquí obligaría a traer el cliente de Sheets al navegador.
     */
    paletas: PaletasProveedor;
    /**
     * Si se muestran importes. Va explícito además de venir implícito en que
     * las partidas traigan o no precio: deja la intención escrita y evita que
     * un carrito vacío, donde no hay partida que mirar, decida por su cuenta.
     *
     * No es la barrera: quien impide que una sucursal vea los precios es el
     * recorte del servidor. Esto solo ordena la interfaz.
     */
    mostrarPrecios: boolean;
}) {
    const [lineas, setLineas] = useState<LineaVisible[]>(lineasIniciales);
    const [estadoGuardado, setEstadoGuardado] = useState<
        "sincronizado" | "guardando" | "error"
    >("sincronizado");
    const [confirmando, setConfirmando] = useState(false);
    /** Pedido ya confirmado, con su archivo, para poder volver a descargarlo. */
    const [confirmado, setConfirmado] = useState<{
        folio: string;
        nombreArchivo: string;
        archivo: string;
    } | null>(null);
    const [errorConfirmar, setErrorConfirmar] = useState<string | null>(null);

    /**
     * El primer render no debe guardar: `lineas` viene del servidor y escribirlo
     * de vuelta sería una escritura inútil en cada visita a la página.
     */
    const yaMontado = useRef(false);

    /**
     * Salta el guardado automático del siguiente cambio de `lineas`.
     *
     * Al confirmar se vacía el carrito en pantalla, y ese cambio dispararía un
     * guardado que iría a escribir un carrito vacío en una hoja donde el folio
     * ya está cerrado. No hay nada que sincronizar: el servidor acaba de dejar
     * el estado bueno.
     */
    const omitirGuardado = useRef(false);

    useEffect(() => {
        if (!yaMontado.current) {
            yaMontado.current = true;
            return;
        }

        if (omitirGuardado.current) {
            omitirGuardado.current = false;
            return;
        }

        let cancelado = false;

        const temporizador = setTimeout(async () => {
            setEstadoGuardado("guardando");

            // Solo se manda lo que la hoja guarda; nombre y precios los
            // resuelve el servidor desde el catálogo.
            const resultado = await guardarCarritoDeSesion(
                lineas.map((l) => ({
                    codigoBarras: l.codigoBarras,
                    proveedor: l.proveedor,
                    cantidad: l.cantidad,
                })),
            );

            if (cancelado) return;
            setEstadoGuardado(resultado.ok ? "sincronizado" : "error");
        }, ESPERA_GUARDADO_MS);

        // Si `lineas` cambia antes de que venza la espera, se descarta el
        // guardado pendiente y se reinicia con el estado más reciente.
        return () => {
            cancelado = true;
            clearTimeout(temporizador);
        };
    }, [lineas]);

    function cambiarCantidad(id: string, cantidad: number) {
        setLineas((actuales) =>
            actuales.map((l) =>
                l.id === id
                    ? { ...l, cantidad: acotarCantidad(cantidad, l.existencias) }
                    : l,
            ),
        );
    }

    function eliminar(id: string) {
        setLineas((actuales) => actuales.filter((l) => l.id !== id));
    }

    /**
     * Cierra el pedido: lo sella en la hoja y baja el .xlsx.
     *
     * El carrito de la pantalla solo se vacía si el servidor confirmó. Si algo
     * falla, las partidas siguen ahí para volver a intentarlo, en lugar de dejar
     * al usuario sin pedido y sin archivo.
     */
    async function confirmar() {
        setConfirmando(true);
        setErrorConfirmar(null);

        const resultado = await confirmarPedidoDeSesion();
        setConfirmando(false);

        if (!resultado.ok) {
            setErrorConfirmar(
                resultado.motivo === "sin-sesion"
                    ? "Tu sesión expiró. Vuelve a iniciar sesión para confirmar el pedido."
                    : resultado.motivo === "vacio"
                        ? "Este carrito ya no tiene partidas por confirmar. Actualiza la página."
                        : "No se pudo confirmar el pedido. Inténtalo de nuevo.",
            );
            return;
        }

        descargarBase64(resultado.archivo, resultado.nombreArchivo);
        setConfirmado({
            folio: resultado.folio,
            nombreArchivo: resultado.nombreArchivo,
            archivo: resultado.archivo,
        });

        omitirGuardado.current = true;
        setLineas([]);
        setEstadoGuardado("sincronizado");
    }

    /**
     * El pedido se agrupa por proveedor porque cada uno se surte por separado:
     * así se ve de un golpe cuánto se le compra a cada casa.
     */
    const grupos = useMemo(() => {
        const porProveedor = new Map<string, LineaVisible[]>();

        for (const linea of lineas) {
            const existente = porProveedor.get(linea.proveedor);
            if (existente) existente.push(linea);
            else porProveedor.set(linea.proveedor, [linea]);
        }

        return [...porProveedor.entries()]
            .map(([proveedor, items]) => ({
                proveedor,
                items,
                // `null` cuando las partidas vienen sin importes.
                subtotal: items.every((l) => l.precioUnitario !== undefined)
                    ? items.reduce(
                        (suma, l) => suma + (l.precioUnitario ?? 0) * l.cantidad,
                        0,
                    )
                    : null,
                piezas: items.reduce((suma, l) => suma + l.cantidad, 0),
            }))
            // Con importes manda el peso en dinero: primero el proveedor al que
            // más se le compra. Sin ellos se ordena por piezas, que es lo único
            // comparable que queda.
            .sort((a, b) =>
                a.subtotal !== null && b.subtotal !== null
                    ? b.subtotal - a.subtotal
                    : b.piezas - a.piezas,
            );
    }, [lineas]);

    const totales = useMemo(() => {
        const piezas = lineas.reduce((suma, l) => suma + l.cantidad, 0);

        // Una sola partida sin precio invalida cualquier total: mejor no dar
        // ninguno que dar uno incompleto que se lea como el importe del pedido.
        if (!lineas.every((l) => l.precioUnitario !== undefined)) {
            return { subtotal: null, piezas, ahorro: 0, porcentaje: 0 };
        }

        const subtotal = lineas.reduce(
            (suma, l) => suma + (l.precioUnitario ?? 0) * l.cantidad,
            0,
        );
        const ahorro = lineas.reduce(
            (suma, l) =>
                l.precioMasAlto !== undefined
                    ? suma +
                    (l.precioMasAlto - (l.precioUnitario ?? 0)) * l.cantidad
                    : suma,
            0,
        );
        // Sobre lo que se habría pagado comprando todo al proveedor más caro.
        const referencia = subtotal + ahorro;
        const porcentaje =
            referencia > 0 ? Math.floor((ahorro / referencia) * 100) : 0;

        return { subtotal, piezas, ahorro, porcentaje };
    }, [lineas]);

    // El comprobante gana al carrito vacío: tras confirmar las dos condiciones
    // se cumplen, y lo que toca decir es que el pedido salió, no que no hay nada.
    if (confirmado) {
        return (
            <PedidoConfirmadoAviso
                folio={confirmado.folio}
                onDescargar={() =>
                    descargarBase64(confirmado.archivo, confirmado.nombreArchivo)
                }
            />
        );
    }

    if (lineas.length === 0) return <CarritoVacio />;

    return (
        <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-3">
            {/* Partidas del pedido, agrupadas por proveedor */}
            <div className="flex flex-col gap-6 lg:col-span-2">
                {grupos.map((grupo) => {
                    const colores = coloresDe(grupo.proveedor, paletas);

                    return (
                        <section
                            key={grupo.proveedor}
                            aria-label={`Productos de ${grupo.proveedor}`}
                            className="overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-gray-200/80 transition duration-200 hover:shadow-xl hover:shadow-gray-900/5 hover:ring-gray-300"
                        >
                            {/* Cabecera del grupo con el fondo de burbujas del
                                banner de mejor precio, teñido con el color del
                                proveedor. El texto usa `colores.banner` y
                                opacidades de `currentColor`, como en el banner:
                                así contrasta tanto sobre las paletas claras como
                                sobre la oscura de Farmacenter. */}
                            <header
                                className={`relative isolate flex flex-wrap items-center gap-x-3 gap-y-1.5 overflow-hidden px-5 py-4 sm:px-7 ${colores.banner}`}
                            >
                                <div className="absolute inset-0 -z-10">
                                    <BurbujasPrecio
                                        idFiltro={`goo-grupo-${grupo.proveedor.toLowerCase()}`}
                                        paleta={colores.burbujas}
                                        // Burbujas de ~34 px con un suelo en px:
                                        // el 4.5% solo manda en pantallas anchas
                                        // y en móvil no se quedan en puntitos.
                                        tamano="max(34px, 4.5%)"
                                        alto="max(34px, 4.5cqw)"
                                        // El desenfoque va en px absolutos: hay
                                        // que bajarlo del 9 del banner o el
                                        // umbral de alfa se come las burbujas en
                                        // una tira de ~55 px de alto.
                                        desenfoque={5}
                                        suavizado={0.8}
                                        desenfoqueExtra={1}
                                    />
                                </div>

                                <EtiquetaProveedor
                                    proveedor={grupo.proveedor}
                                    cristal={colores.cristal}
                                />
                                <ChipCristal
                                    cristal={colores.cristal}
                                    className="px-2.5 py-1 text-[13px] font-medium"
                                >
                                    {grupo.items.length}{" "}
                                    {grupo.items.length === 1 ? "producto" : "productos"} ·{" "}
                                    {grupo.piezas} {grupo.piezas === 1 ? "pieza" : "piezas"}
                                </ChipCristal>
                                <span
                                    aria-hidden="true"
                                    className="min-w-4 flex-1 border-t border-dashed border-current opacity-30"
                                />
                                {grupo.subtotal !== null && (
                                    <ChipCristal
                                        cristal={colores.cristal}
                                        className="px-3 py-1 font-mono text-sm font-bold tabular-nums"
                                    >
                                        {formatoPrecio(grupo.subtotal)}
                                    </ChipCristal>
                                )}
                            </header>

                            <ul className="divide-y divide-gray-100">
                                {grupo.items.map((linea) => (
                                    <FilaProducto
                                        key={linea.id}
                                        linea={linea}
                                        onCantidad={cambiarCantidad}
                                        onEliminar={eliminar}
                                    />
                                ))}
                            </ul>
                        </section>
                    );
                })}

                <div className="flex flex-wrap items-center justify-between gap-3">
                    <Link
                        href="/grid_productos"
                        className="inline-flex items-center gap-1.5 text-sm font-semibold text-blue-700 transition hover:text-blue-900 focus:outline-none focus-visible:underline"
                    >
                        <svg
                            aria-hidden="true"
                            className="h-4 w-4"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth={2}
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M15 19l-7-7 7-7"
                            />
                        </svg>
                        Seguir comparando precios
                    </Link>

                    <div className="flex items-center gap-4">
                        <EstadoGuardado estado={estadoGuardado} />
                        <button
                            type="button"
                            onClick={() => setLineas([])}
                            className="text-sm font-medium text-gray-500 transition hover:text-rose-600 focus:outline-none focus-visible:underline"
                        >
                            Vaciar carrito
                        </button>
                    </div>
                </div>
            </div>

            {/* Resumen del pedido */}
            <aside className="lg:sticky lg:top-24">
                <div className="rounded-3xl bg-white p-7 shadow-sm ring-1 ring-gray-200/80">
                    <h2 className="text-lg font-bold text-gray-900">Resumen del pedido</h2>

                    {/* Total, con el banner de burbujas del catálogo pero sin
                        `paleta`: usa la propia del efecto (fondo blanco,
                        burbujas verdes). El pedido suma varios proveedores, así
                        que teñirlo con el color de uno de ellos daría a entender
                        que el total es solo suyo. Texto oscuro fijo, no
                        `colores.banner`: sobre este fondo claro el blanco de
                        Farmacenter desaparecería. */}
                    <div className="relative isolate mt-4 overflow-hidden rounded-2xl px-5 py-4 text-emerald-950">
                        <div className="absolute inset-0 -z-10">
                            <BurbujasPrecio idFiltro="goo-carrito-total" />
                        </div>

                        <div className="flex items-start justify-between gap-2">
                            <p className="text-[11px] font-bold uppercase tracking-[0.12em] opacity-75">
                                {mostrarPrecios ? "Total del pedido" : "Piezas del pedido"}
                            </p>
                            <p className="text-base font-bold leading-none">
                                {grupos.length}{" "}
                                {grupos.length === 1 ? "proveedor" : "proveedores"}
                            </p>
                        </div>
                        <div className="mt-2 flex items-end justify-between gap-2">
                            {/* Sin importes el dato grande pasan a ser las
                                piezas: es lo que la sucursal sí puede ver y
                                deja el banner con algo que leer. */}
                            {totales.subtotal !== null ? (
                                <>
                                    <p className="font-mono text-3xl font-bold leading-none tabular-nums">
                                        {formatoPrecio(totales.subtotal)}
                                    </p>
                                    <p className="text-right text-xs leading-tight opacity-75">
                                        piezas
                                        <br />
                                        <span className="font-mono tabular-nums">
                                            {totales.piezas}
                                        </span>
                                    </p>
                                </>
                            ) : (
                                <p className="font-mono text-3xl font-bold leading-none tabular-nums">
                                    {totales.piezas}{" "}
                                    <span className="text-base font-semibold">
                                        {totales.piezas === 1 ? "pieza" : "piezas"}
                                    </span>
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Desglose por proveedor: mismo patrón visual que el ranking. */}
                    <ul className="mt-4 flex flex-col gap-1">
                        {grupos.map((grupo) => {
                            const colores = coloresDe(grupo.proveedor, paletas);

                            return (
                                <li
                                    key={grupo.proveedor}
                                    className="flex items-center gap-2.5 rounded-xl px-2.5 py-2"
                                >
                                    <span
                                        className={`h-2.5 w-2.5 shrink-0 rounded-full ${colores.insignia}`}
                                    />
                                    <span className="truncate text-sm font-medium text-gray-600">
                                        {grupo.proveedor}
                                    </span>
                                    <span
                                        aria-hidden="true"
                                        className="min-w-4 flex-1 border-t border-dashed border-gray-300"
                                    />
                                    {/* Sin importes se listan las piezas que se
                                        le compran a cada proveedor. */}
                                    <span className="shrink-0 font-mono text-sm font-semibold tabular-nums text-gray-700">
                                        {grupo.subtotal !== null
                                            ? formatoPrecio(grupo.subtotal)
                                            : `${grupo.piezas} ${grupo.piezas === 1 ? "pza" : "pzas"}`}
                                    </span>
                                </li>
                            );
                        })}
                    </ul>

                    {totales.ahorro > 0 && (
                        <div className="mt-4 flex items-center justify-between gap-2 rounded-2xl bg-emerald-50 px-4 py-3">
                            <span className="flex items-center gap-1.5 text-[13px] font-semibold text-emerald-700">
                                <IconoAhorro />
                                Ahorras {totales.porcentaje}%
                            </span>
                            <span className="font-mono text-sm font-bold tabular-nums text-emerald-700">
                                {formatoPrecio(totales.ahorro)}
                            </span>
                        </div>
                    )}

                    {/* Desglose de importes: solo para administradores. A una
                        sucursal se le muestran las piezas y los proveedores, que
                        es lo que necesita para revisar el pedido. */}
                    <dl className="mt-4 flex flex-col gap-2 border-t border-gray-100 pt-4 text-sm">
                        {totales.subtotal !== null ? (
                            <>
                                <div className="flex items-center justify-between">
                                    <dt className="text-gray-500">Subtotal</dt>
                                    <dd className="font-mono font-semibold tabular-nums text-gray-700">
                                        {formatoPrecio(totales.subtotal)}
                                    </dd>
                                </div>
                                <div className="flex items-center justify-between">
                                    <dt className="text-gray-500">Envío</dt>
                                    <dd className="text-[13px] font-semibold text-emerald-600">
                                        Incluido
                                    </dd>
                                </div>
                                <div className="mt-1 flex items-center justify-between border-t border-gray-100 pt-3">
                                    <dt className="font-bold text-gray-900">
                                        Total a pagar
                                    </dt>
                                    <dd className="font-mono text-lg font-bold tabular-nums text-gray-900">
                                        {formatoPrecio(totales.subtotal)}
                                    </dd>
                                </div>
                            </>
                        ) : (
                            <>
                                <div className="flex items-center justify-between">
                                    <dt className="text-gray-500">Productos</dt>
                                    <dd className="font-mono font-semibold tabular-nums text-gray-700">
                                        {lineas.length}
                                    </dd>
                                </div>
                                <div className="flex items-center justify-between">
                                    <dt className="text-gray-500">Piezas</dt>
                                    <dd className="font-mono font-semibold tabular-nums text-gray-700">
                                        {totales.piezas}
                                    </dd>
                                </div>
                                <div className="mt-1 flex items-center justify-between border-t border-gray-100 pt-3">
                                    <dt className="font-bold text-gray-900">Proveedores</dt>
                                    <dd className="font-mono text-lg font-bold tabular-nums text-gray-900">
                                        {grupos.length}
                                    </dd>
                                </div>
                            </>
                        )}
                    </dl>

                    {/* Confirmar cierra el pedido en la hoja y descarga su
                        .xlsx. Se bloquea mientras hay un guardado en vuelo: si
                        no, el último ajuste de cantidad podría quedarse fuera
                        del pedido que se está sellando. */}
                    <button
                        type="button"
                        onClick={confirmar}
                        disabled={confirmando || estadoGuardado === "guardando"}
                        className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-800 px-5 py-4 text-base font-semibold text-white transition hover:bg-slate-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:bg-slate-400"
                    >
                        {confirmando ? (
                            "Confirmando pedido..."
                        ) : (
                            <>
                                <IconoDescarga className="h-5 w-5" />
                                Confirmar pedido
                            </>
                        )}
                    </button>

                    {errorConfirmar && (
                        <p
                            aria-live="polite"
                            className="mt-3 rounded-2xl bg-rose-50 px-4 py-3 text-center text-[13px] font-semibold text-rose-700"
                        >
                            {errorConfirmar}
                        </p>
                    )}

                    <p className="mt-3 text-center text-xs text-gray-400">
                        Al confirmar se registra el pedido y se descarga en Excel. Los
                        precios pueden variar según la disponibilidad del proveedor al
                        momento de surtir.
                    </p>
                </div>
            </aside>
        </div>
    );
}
