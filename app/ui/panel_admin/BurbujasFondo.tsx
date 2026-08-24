"use client";

/**
 * Fondo decorativo con burbujas que "respiran" (escalan y se desplazan
 * suavemente con animaciones CSS puras). A diferencia de GradientBubbles
 * del login, no sigue al cursor.
 *
 * Exclusivo del panel de administración.
 */
export default function BurbujasFondo({ className }: { className?: string }) {
    return (
        <div
            className={className}
            aria-hidden="true"
            style={{ overflow: "hidden", background: "linear-gradient(135deg, #dbeafe 0%, #ede9fe 50%, #e0f2fe 100%)" }}
        >
            {/* Burbuja 1 — azul grande, respira lento */}
            <div
                style={{
                    position: "absolute",
                    top: "10%",
                    left: "15%",
                    width: "28rem",
                    height: "28rem",
                    borderRadius: "50%",
                    background: "radial-gradient(circle, rgba(96,165,250,0.45) 0%, transparent 70%)",
                    animation: "breathe1 8s ease-in-out infinite",
                }}
            />
            {/* Burbuja 2 — violeta, desfase */}
            <div
                style={{
                    position: "absolute",
                    top: "50%",
                    right: "10%",
                    width: "24rem",
                    height: "24rem",
                    borderRadius: "50%",
                    background: "radial-gradient(circle, rgba(167,139,250,0.4) 0%, transparent 70%)",
                    animation: "breathe2 10s ease-in-out infinite",
                }}
            />
            {/* Burbuja 3 — cian, esquina inferior */}
            <div
                style={{
                    position: "absolute",
                    bottom: "5%",
                    left: "30%",
                    width: "22rem",
                    height: "22rem",
                    borderRadius: "50%",
                    background: "radial-gradient(circle, rgba(103,232,249,0.35) 0%, transparent 70%)",
                    animation: "breathe3 12s ease-in-out infinite",
                }}
            />
            {/* Burbuja 4 — azul claro, superior derecha */}
            <div
                style={{
                    position: "absolute",
                    top: "0%",
                    right: "25%",
                    width: "18rem",
                    height: "18rem",
                    borderRadius: "50%",
                    background: "radial-gradient(circle, rgba(147,197,253,0.4) 0%, transparent 70%)",
                    animation: "breathe4 9s ease-in-out infinite",
                }}
            />
            {/* Burbuja 5 — rosa-lila suave, centro */}
            <div
                style={{
                    position: "absolute",
                    top: "35%",
                    left: "50%",
                    width: "20rem",
                    height: "20rem",
                    borderRadius: "50%",
                    background: "radial-gradient(circle, rgba(196,181,253,0.3) 0%, transparent 70%)",
                    animation: "breathe5 11s ease-in-out infinite",
                }}
            />

            {/* Keyframes para las animaciones de respiración */}
            <style>{`
                @keyframes breathe1 {
                    0%, 100% { transform: scale(1) translate(0, 0); opacity: 0.7; }
                    50% { transform: scale(1.15) translate(30px, -20px); opacity: 1; }
                }
                @keyframes breathe2 {
                    0%, 100% { transform: scale(1) translate(0, 0); opacity: 0.6; }
                    50% { transform: scale(1.2) translate(-25px, 15px); opacity: 0.9; }
                }
                @keyframes breathe3 {
                    0%, 100% { transform: scale(1) translate(0, 0); opacity: 0.65; }
                    50% { transform: scale(1.1) translate(20px, -25px); opacity: 0.95; }
                }
                @keyframes breathe4 {
                    0%, 100% { transform: scale(1) translate(0, 0); opacity: 0.5; }
                    50% { transform: scale(1.18) translate(-15px, 20px); opacity: 0.85; }
                }
                @keyframes breathe5 {
                    0%, 100% { transform: scale(1) translate(0, 0); opacity: 0.4; }
                    50% { transform: scale(1.12) translate(10px, -10px); opacity: 0.75; }
                }
            `}</style>
        </div>
    );
}
