import styles from "./BurbujasPrecio.module.scss";

/**
 * Paleta del efecto. Es una intersección con `Record<'--${string}', string>`
 * porque `React.CSSProperties` por sí solo no admite custom properties.
 */
export type PaletaBurbujas = React.CSSProperties &
    Record<`--${string}`, string>;

type BurbujasPrecioProps = {
    /**
     * Identificador único del filtro SVG de esta instancia. Cada tarjeta debe
     * pasar uno distinto: dos elementos con el mismo `id` en el documento harían
     * que todos los banners resolvieran al mismo filtro.
     */
    idFiltro: string;
    /** Custom properties que tiñen las burbujas (ver `PaletaBurbujas`). */
    paleta: PaletaBurbujas;
    /** Ancho base de cada burbuja, en % del ancho del contenedor. */
    tamano?: string;
    /**
     * Alto base de cada burbuja. Por defecto se deriva de `tamano` con la
     * relación de aspecto del banner (3.4:1), que solo sirve si el contenedor
     * mantiene esa forma.
     *
     * En un contenedor fluido conviene darlo en `cqw` con el mismo número que
     * `tamano`: al medirse contra el ancho, las burbujas salen redondas a
     * cualquier ancho de pantalla.
     */
    alto?: string;
    /**
     * Radio del difuminado previo al umbral, en px. **Es la medida crítica al
     * cambiar de tamaño de contenedor**: al ser absoluta, un valor pensado para
     * un banner de ~100 px de alto disuelve por completo las burbujas de una
     * etiqueta de ~20 px (el alfa cae por debajo del umbral y no se dibuja
     * nada). Como regla, en torno a un 10% del lado menor del contenedor.
     */
    desenfoque?: number;
    /** Blur mínimo posterior al umbral, que quita el aliasing del recorte. */
    suavizado?: number;
    /** Blur extra sobre el conjunto ya fusionado, en px. */
    desenfoqueExtra?: number;
    /** Opacidad del conjunto fusionado; deja respirar el degradado de fondo. */
    opacidad?: number;
};

/**
 * Fondo animado de burbujas, derivado del efecto del login
 * (`app/ui/login/GradientBubbles.tsx`).
 *
 * Se usa en el banner de mejor precio del catálogo y, con los parámetros
 * reescalados, en la cabecera de cada grupo de proveedor del carrito.
 *
 * Aquí no hay interacción con el cursor, así que es un componente de servidor:
 * todo el movimiento es CSS y no manda un byte de JavaScript al cliente.
 *
 * El filtro `goo` (blur + feColorMatrix) es lo que fusiona los blobs y les da el
 * borde gelatinoso; se aplica por `style` en lugar de por CSS para poder usar el
 * `id` único de cada instancia.
 */
export default function BurbujasPrecio({
    idFiltro,
    paleta,
    tamano,
    alto,
    desenfoque = 9,
    suavizado = 1.2,
    desenfoqueExtra = 2,
    opacidad,
}: BurbujasPrecioProps) {
    // Las medidas viajan como custom properties para no duplicar el SCSS: si no
    // se pasan, el módulo aplica los valores del banner.
    const estilo: PaletaBurbujas = { ...paleta };
    if (tamano !== undefined) estilo["--bp-tamano"] = tamano;
    if (alto !== undefined) estilo["--bp-alto"] = alto;
    if (opacidad !== undefined) estilo["--bp-opacidad-capa"] = String(opacidad);

    return (
        <div className={styles.capa} style={estilo} aria-hidden="true">
            {/* La definición del filtro tiene que vivir en el árbol para que
                url(#id) la resuelva. */}
            <svg xmlns="http://www.w3.org/2000/svg" focusable="false">
                <defs>
                    {/* Región amplia: por defecto el filtro recorta al 110% de
                        la caja y las burbujas que asoman por los bordes
                        aparecerían cortadas en seco. */}
                    <filter
                        id={idFiltro}
                        x="-25%"
                        y="-25%"
                        width="150%"
                        height="150%"
                        colorInterpolationFilters="sRGB"
                    >
                        {/* 1. Difumina lo suficiente para que los halos de dos
                               burbujas vecinas se solapen. */}
                        <feGaussianBlur
                            in="SourceGraphic"
                            stdDeviation={desenfoque}
                            result="difuminado"
                        />
                        {/* 2. Umbral sobre el canal alfa (alpha * 26 - 12): lo
                               que quedó por encima de ~0.46 se vuelve opaco y el
                               resto desaparece. Ahí nace la fusión: el solape de
                               dos halos supera el umbral y se convierte en un
                               cuello continuo entre ambas burbujas. */}
                        <feColorMatrix
                            in="difuminado"
                            mode="matrix"
                            values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 26 -12"
                            result="fusion"
                        />
                        {/* 3. Un blur mínimo quita el aliasing del umbral sin
                               deshacer la silueta. Sin `feBlend` con el original:
                               reponer las burbujas sueltas encima delataría el
                               truco y rompería el aspecto de lava. */}
                        <feGaussianBlur in="fusion" stdDeviation={suavizado} />
                    </filter>
                </defs>
            </svg>

            <div
                className={styles.contenedor}
                style={{ filter: `url(#${idFiltro}) blur(${desenfoqueExtra}px)` }}
            >
                <div className={styles.b1} />
                <div className={styles.b2} />
                <div className={styles.b3} />
                <div className={styles.b4} />
                <div className={styles.b5} />
                <div className={styles.b6} />
                <div className={styles.b7} />
            </div>
        </div>
    );
}
