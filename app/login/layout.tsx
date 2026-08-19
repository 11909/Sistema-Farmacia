export default function LoginLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-br from-blue-100 via-white to-blue-200 bg-[length:200%_200%] animate-gradient-rotate">
            <div className="w-full max-w-md">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-full mb-4">
                        <svg
                            className="w-8 h-8 text-white"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            aria-hidden="true"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                            />
                        </svg>
                    </div>
                    <h1 className="text-2xl font-bold text-gray-800">Sistema Farmacia</h1>
                    <p className="text-gray-500 mt-1">Inicia sesión para continuar</p>
                </div>

                {/* Card con gradiente animado */}
                <div className="relative rounded-2xl p-[2px] overflow-hidden shadow-lg">
                    {/* Contenido del card */}
                    <div className="relative bg-white rounded-2xl p-8">{children}</div>
                </div>

                {/* Footer */}
                <p className="text-center text-xs text-gray-400 mt-6">
                    &copy; 2026 Sistema Farmacia. Todos los derechos reservados.
                </p>
            </div>
        </div>
    );
}
