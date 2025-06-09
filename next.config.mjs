import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  distDir: path.resolve(__dirname, "../client/build/.next"),

  // Para exportación completamente estática
  output: "export",

  // Configuración adicional si es necesaria
  trailingSlash: true,
};

export default nextConfig;
