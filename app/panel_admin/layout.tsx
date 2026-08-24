import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../lib/auth";
import IconoLogin from "../ui/shared/IconoLogin";
import BurbujasFondo from "../ui/panel_admin/BurbujasFondo";

export default async function PanelAdminLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	const session = await getServerSession(authOptions);

	// Si no hay sesión o el rol no es administrador, expulsar de esta ruta.
	if (!session || session.user?.rol !== "administrador") {
		redirect("/grid_productos");
	}

	return (
		<div className="relative min-h-screen font-sans">
			{/* Fondo: burbujas con efecto de respiración */}
			<BurbujasFondo className="pointer-events-none fixed inset-0 -z-10" />

			<div className="mx-auto flex min-h-screen w-full max-w-[1600px] items-start px-4 sm:px-6 lg:px-8">
				<aside className="sticky top-4 my-4 flex h-[calc(100vh-2rem)] w-64 shrink-0 flex-col rounded-l-2xl bg-white px-4 py-5 text-gray-800 shadow-sm ring-1 ring-gray-200/80">
					{/* Filo biselado superior — borde iluminado del cristal */}
					<div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 h-px rounded-t-2xl bg-gradient-to-r from-transparent via-white/80 to-transparent" />
					{/* Filo biselado izquierdo */}
					<div aria-hidden="true" className="pointer-events-none absolute inset-y-0 left-0 w-px rounded-l-2xl bg-gradient-to-b from-transparent via-white/50 to-transparent" />
					<Link
						href="/grid_productos"
						className="flex items-center gap-2 rounded-xl px-3 py-3 transition hover:opacity-80 focus:outline-none focus:ring-2 focus:ring-blue-400"
					>
						<span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-600 text-white">
							<IconoLogin className="h-9 w-9" />
						</span>
						<span className="text-lg font-bold text-gray-800">
							Sistema Farmacia
						</span>
					</Link>

					<nav aria-label="Panel de administración" className="mt-8 space-y-2">
						<p className="px-3 pb-2 text-xs font-bold uppercase tracking-[0.18em] text-gray-500">
							Administración
						</p>
						<Link
							href="/panel_admin/productos"
							className="flex items-center gap-3 rounded-xl border border-transparent px-3 py-3 text-base font-medium text-gray-700 transition hover:border-white/40 hover:bg-white/30 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-400"
						>
							<svg
								aria-hidden="true"
								className="h-6 w-6 shrink-0 text-gray-500"
								fill="none"
								stroke="currentColor"
								strokeWidth={2}
								viewBox="0 0 24 24"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									d="M4 5a2 2 0 012-2h12a2 2 0 012 2v14a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm4 3h8M8 12h8M8 16h5"
								/>
							</svg>
							<span>Productos</span>
						</Link>

						<Link
							href="/panel_admin/proveedores"
							className="flex items-center gap-3 rounded-xl border border-transparent px-3 py-3 text-base font-medium text-gray-700 transition hover:border-white/40 hover:bg-white/30 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-400"
						>
							<svg
								aria-hidden="true"
								className="h-6 w-6 shrink-0 text-gray-500"
								fill="none"
								stroke="currentColor"
								strokeWidth={2}
								viewBox="0 0 24 24"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									d="M3 21h18M5 21V7l7-4 7 4v14M9 21v-4h6v4M8 10h.01M12 10h.01M16 10h.01"
								/>
							</svg>
							<span>Proveedores</span>
						</Link>
					</nav>

					{/* Pie del panel — separador + link de regreso */}
					<div className="mt-auto">
						{/* Divisor glass */}
						<div aria-hidden="true" className="mb-3 h-px bg-gradient-to-r from-transparent via-gray-300/60 to-transparent" />
						<Link
							href="/grid_productos"
							className="flex items-center gap-3 rounded-xl border border-transparent px-3 py-3 text-sm font-medium text-blue-600 transition hover:border-white/40 hover:bg-white/30 hover:text-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
						>
							<svg
								aria-hidden="true"
								className="h-5 w-5 shrink-0"
								fill="none"
								stroke="currentColor"
								strokeWidth={2}
								viewBox="0 0 24 24"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									d="M10 19l-7-7m0 0l7-7m-7 7h18"
								/>
							</svg>
							<span>Regresar al catálogo</span>
						</Link>
					</div>
				</aside>

				<main className="my-4 min-h-[calc(100vh-2rem)] min-w-0 flex-1 rounded-r-2xl bg-slate-100 px-4 py-8 sm:px-6 lg:px-10">{children}</main>
			</div>
		</div>
	);
}
