/** @type {import('next').NextConfig} */
const nextConfig = {
  // Aumentar límite de body para subir archivos grandes (fotos, audio, video)
  serverExternalPackages: [],
  experimental: {
    serverActions: {
      bodySizeLimit: '25mb',
    },
  },
};

export default nextConfig;
