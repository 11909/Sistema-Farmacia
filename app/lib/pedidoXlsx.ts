// Import por defecto y no `{ Workbook }`: `exceljs` es CommonJS, y como se
// carga con el `require` nativo (ver `serverExternalPackages` en
// `next.config.ts`), los exports nombrados no siempre se detectan. El objeto de
// exports sí llega completo por el default.
import ExcelJS from "exceljs";
import type { Worksheet, Row } from "exceljs";
import type { PedidoConfirmado } from "./carrito";

/**
 * Hoja de cálculo del pedido confirmado.
 *
 * Se genera en el servidor y no en el navegador por dos motivos. Uno, que los
 * importes de una cuenta de sucursal no salen del servidor (ver `sinPrecios`),
 * así que el cliente no tiene con qué armar la columna de precios aunque
 * quisiera. Y dos, que el archivo tiene que reflejar lo que quedó registrado en
 * la hoja al confirmar, que es lo que el servidor acaba de escribir.
 *
 * Vive en su propio módulo para que `exceljs` solo entre por aquí: lo importa la
 * acción de servidor, y nada de esto viaja al navegador.
 */

/** Gris de fondo de los encabezados de tabla. */
const RELLENO_ENCABEZADO = "FFF1F5F9";
/** Azul del título, a juego con el de la interfaz. */
const AZUL_TITULO = "FF1D4ED8";

const FORMATO_IMPORTE = '"$"#,##0.00';
/** Texto literal: sin esto Excel convierte un código de barras en 7.5011E+12. */
const FORMATO_TEXTO = "@";

type Columna = {
    encabezado: string;
    ancho: number;
    /** Formato de número de la columna, cuando no es texto corriente. */
    formato?: string;
    /** Solo se incluye cuando la cuenta puede ver importes. */
    soloConPrecios?: boolean;
};

const COLUMNAS: Columna[] = [
    { encabezado: "Proveedor", ancho: 16 },
    { encabezado: "Producto", ancho: 52 },
    { encabezado: "Código de barras", ancho: 20, formato: FORMATO_TEXTO },
    { encabezado: "Unidad", ancho: 10 },
    { encabezado: "Cantidad", ancho: 11 },
    {
        encabezado: "Precio unitario",
        ancho: 16,
        formato: FORMATO_IMPORTE,
        soloConPrecios: true,
    },
    {
        encabezado: "Importe",
        ancho: 16,
        formato: FORMATO_IMPORTE,
        soloConPrecios: true,
    },
];

/** Nombre de archivo seguro: `pedido-12-2026-08-22.xlsx`. */
export function nombreArchivoPedido(pedido: PedidoConfirmado): string {
    const folio = pedido.folio.replace(/[^\w-]/g, "") || "sin-folio";
    return `pedido-${folio}-${pedido.fecha}.xlsx`;
}

/** Pone en negrita una fila completa, encabezados y totales. */
function enNegrita(fila: Row, hasta: number) {
    for (let c = 1; c <= hasta; c++) fila.getCell(c).font = { bold: true };
}

/** Encabezados de tabla: negrita sobre gris, con filtro y fila congelada. */
function escribirEncabezados(hoja: Worksheet, columnas: Columna[]) {
    const fila = hoja.addRow(columnas.map((c) => c.encabezado));
    enNegrita(fila, columnas.length);

    for (let c = 1; c <= columnas.length; c++) {
        fila.getCell(c).fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: RELLENO_ENCABEZADO },
        };
    }

    hoja.views = [{ state: "frozen", ySplit: fila.number }];
    hoja.autoFilter = {
        from: { row: fila.number, column: 1 },
        to: { row: fila.number, column: columnas.length },
    };
}

/**
 * Bloque de datos del pedido, sobre la tabla.
 *
 * Va en dos columnas (etiqueta y valor) en lugar de una línea de texto para que
 * el folio se pueda copiar de una celda al pegarlo en otro sitio.
 */
function escribirCabecera(
    hoja: Worksheet,
    pedido: PedidoConfirmado,
    email: string,
    piezas: number,
    mostrarPrecios: boolean,
) {
    const titulo = hoja.addRow([`Pedido ${pedido.folio}`]);
    titulo.getCell(1).font = { bold: true, size: 16, color: { argb: AZUL_TITULO } };

    const datos: [string, string | number][] = [
        ["Folio", pedido.folio],
        ["Fecha", pedido.fecha],
        ["Hora", pedido.hora],
        ["Cuenta", email],
        ["Productos", pedido.lineas.length],
        ["Piezas", piezas],
    ];
    if (mostrarPrecios) datos.push(["Total", pedido.total]);

    for (const [etiqueta, valor] of datos) {
        const fila = hoja.addRow([etiqueta, valor]);
        fila.getCell(1).font = { bold: true };
        if (etiqueta === "Total") fila.getCell(2).numFmt = FORMATO_IMPORTE;
    }

    hoja.addRow([]);
}

/** Hoja principal: una fila por partida, ordenadas por proveedor. */
function escribirPartidas(
    hoja: Worksheet,
    pedido: PedidoConfirmado,
    email: string,
    mostrarPrecios: boolean,
) {
    const columnas = COLUMNAS.filter(
        (c) => mostrarPrecios || !c.soloConPrecios,
    );
    hoja.columns = columnas.map((c) => ({ width: c.ancho }));

    const piezas = pedido.lineas.reduce((suma, l) => suma + l.cantidad, 0);
    escribirCabecera(hoja, pedido, email, piezas, mostrarPrecios);
    escribirEncabezados(hoja, columnas);

    // Mismo criterio que la interfaz: el pedido se lee por proveedor, porque
    // cada uno se surte por separado.
    const ordenadas = [...pedido.lineas].sort(
        (a, b) =>
            a.proveedor.localeCompare(b.proveedor, "es") ||
            a.nombre.localeCompare(b.nombre, "es"),
    );

    for (const linea of ordenadas) {
        const valores: (string | number)[] = [
            linea.proveedor,
            linea.nombre,
            linea.codigoBarras,
            linea.unidad ?? "PZ",
            linea.cantidad,
        ];
        if (mostrarPrecios) {
            valores.push(
                linea.precioUnitario,
                linea.precioUnitario * linea.cantidad,
            );
        }

        const fila = hoja.addRow(valores);
        columnas.forEach((columna, i) => {
            if (columna.formato) fila.getCell(i + 1).numFmt = columna.formato;
        });
    }

    // Fila de totales, alineada con las columnas que sí llevan suma.
    const totales: (string | number)[] = ["Total", "", "", "", piezas];
    if (mostrarPrecios) totales.push("", pedido.total);

    const filaTotal = hoja.addRow(totales);
    enNegrita(filaTotal, columnas.length);
    if (mostrarPrecios) {
        filaTotal.getCell(columnas.length).numFmt = FORMATO_IMPORTE;
    }
}

/**
 * Segunda hoja: cuánto se le compra a cada proveedor.
 *
 * Es el desglose que el resumen del carrito muestra en pantalla, y en el archivo
 * sirve para repartir el pedido entre proveedores sin tener que sumar a mano.
 */
function escribirResumen(
    hoja: Worksheet,
    pedido: PedidoConfirmado,
    mostrarPrecios: boolean,
) {
    type Grupo = { productos: number; piezas: number; importe: number };
    const porProveedor = new Map<string, Grupo>();

    for (const linea of pedido.lineas) {
        const grupo = porProveedor.get(linea.proveedor) ?? {
            productos: 0,
            piezas: 0,
            importe: 0,
        };
        grupo.productos += 1;
        grupo.piezas += linea.cantidad;
        grupo.importe += linea.precioUnitario * linea.cantidad;
        porProveedor.set(linea.proveedor, grupo);
    }

    const columnas: Columna[] = [
        { encabezado: "Proveedor", ancho: 22 },
        { encabezado: "Productos", ancho: 12 },
        { encabezado: "Piezas", ancho: 12 },
    ];
    if (mostrarPrecios) {
        columnas.push({
            encabezado: "Importe",
            ancho: 16,
            formato: FORMATO_IMPORTE,
        });
    }

    hoja.columns = columnas.map((c) => ({ width: c.ancho }));
    escribirEncabezados(hoja, columnas);

    // Con importes manda el peso en dinero; sin ellos, las piezas. Es el mismo
    // orden que usa el resumen en pantalla.
    const grupos = [...porProveedor.entries()].sort((a, b) =>
        mostrarPrecios
            ? b[1].importe - a[1].importe
            : b[1].piezas - a[1].piezas,
    );

    for (const [proveedor, grupo] of grupos) {
        const valores: (string | number)[] = [
            proveedor,
            grupo.productos,
            grupo.piezas,
        ];
        if (mostrarPrecios) valores.push(grupo.importe);

        const fila = hoja.addRow(valores);
        if (mostrarPrecios) {
            fila.getCell(columnas.length).numFmt = FORMATO_IMPORTE;
        }
    }
}

/**
 * Genera el .xlsx del pedido y lo devuelve en base64.
 *
 * Base64 porque el archivo vuelve como valor de retorno de una Server Action, y
 * ahí solo viajan datos serializables. Un pedido son unas pocas decenas de
 * filas, así que el sobrecoste del encoding es irrelevante frente a montar un
 * endpoint aparte que habría que autorizar por su cuenta.
 *
 * @param mostrarPrecios Si el archivo lleva importes. Sale de `puedeVerPrecios`:
 * a una cuenta de sucursal no se le entrega un pedido con precios, igual que no
 * los ve en pantalla.
 */
export async function generarPedidoXlsx(
    pedido: PedidoConfirmado,
    email: string,
    mostrarPrecios: boolean,
): Promise<string> {
    const libro = new ExcelJS.Workbook();
    libro.creator = "Sistema Farmacia";
    libro.created = new Date();

    escribirPartidas(libro.addWorksheet("Pedido"), pedido, email, mostrarPrecios);
    escribirResumen(libro.addWorksheet("Por proveedor"), pedido, mostrarPrecios);

    const buffer = await libro.xlsx.writeBuffer();
    return Buffer.from(buffer as ArrayBuffer).toString("base64");
}
