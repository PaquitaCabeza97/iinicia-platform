/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  // Sección 12: Redirecciones 301 desde URLs relevantes heredadas de WordPress
  async redirects() {
    return [
      {
        source: '/quienes-somos',
        destination: '/universidad',
        permanent: true,
      },
      {
        source: '/nosotros',
        destination: '/universidad',
        permanent: true,
      },
      {
        source: '/programas',
        destination: '/oferta-academica',
        permanent: true,
      },
      {
        source: '/cursos',
        destination: '/oferta-academica',
        permanent: true,
      },
      {
        source: '/inscripciones',
        destination: '/admisiones',
        permanent: true,
      },
      {
        source: '/wp-login.php',
        destination: '/login',
        permanent: true,
      },
      {
        source: '/wp-admin',
        destination: '/login',
        permanent: true,
      },
      {
        source: '/mi-cuenta',
        destination: '/mi-iinicia',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
