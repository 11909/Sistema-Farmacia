import GradientBubbles from "../ui/login/GradientBubbles";
import IconoLogin from "../ui/shared/IconoLogin";

export default function LoginLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="relative min-h-screen flex items-center justify-center px-4 overflow-hidden">
            {/* Fondo animado */}
            <GradientBubbles />

            {/* Contenido */}
            <div className="relative z-10 w-full max-w-md">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-full mb-4">
                        <IconoLogin className="w-15 h-15 text-white" />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-800">Sistema Farmacia</h1>
                    <p className="text-gray-500 mt-1">Bienvenido!</p>
                </div>

                {/* Card */}
                <div className="rounded-2xl shadow-lg bg-white/80 backdrop-blur-sm border border-white/60">
                    <div className="rounded-2xl p-8">{children}</div>
                </div>

                {/* Footer */}
                <p className="text-center text-xs text-gray-400 mt-6">
                    &copy; 2026 Sistema Farmacia. Todos los derechos reservados.
                </p>
            </div>
        </div>
    );
}
