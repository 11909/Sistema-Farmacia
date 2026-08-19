import { CardSkeletonGrid } from "../ui/grid_productos/CardSkeleton";

/**
 * Fallback de la ruta completa: Next envuelve `page.tsx` en un <Suspense>
 * con este componente, así que se ve al navegar hacia /grid_productos.
 */
export default function Loading() {
    return (
        <main className="min-h-screen bg-gradient-to-b from-blue-50 via-slate-50 to-cyan-50/60 font-sans">
            <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                {/* Placeholder de "Mostrando N medicamentos" */}
                <div className="mb-4 h-4 w-48 animate-pulse rounded bg-gray-200" />

                <CardSkeletonGrid />
            </div>
        </main>
    );
}
