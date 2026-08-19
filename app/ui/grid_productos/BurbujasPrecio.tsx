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
};

/**
 * Fondo animado de burbujas para el banner de mejor precio, derivado del efecto
 * del login (`app/ui/login/GradientBubbles.tsx`).
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
}: BurbujasPrecioProps) {
    return (
        <div className={styles.capa} style={paleta} aria-hidden="true">
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
                            stdDeviation="9"
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
                        <feGaussianBlur in="fusion" stdDeviation="1.2" />
                    </filter>
                </defs>
            </svg>

            <div
                className={styles.contenedor}
                style={{ filter: `url(#${idFiltro}) blur(2px)` }}
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
