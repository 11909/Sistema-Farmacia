import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // `exceljs` es CommonJS y tira de APIs de Node (streams, zlib). Se deja fuera
  // del bundle de servidor para que se cargue con el `require` nativo: al
  // empaquetarlo, sus dependencias condicionales acaban resolviéndose mal.
  // Solo lo usa `app/lib/pedidoXlsx.ts`, en el servidor.
  serverExternalPackages: ["exceljs"],
};

export default nextConfig;
