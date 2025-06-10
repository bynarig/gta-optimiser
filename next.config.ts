/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export', // Enables static HTML export

  // REQUIRED FOR GITHUB PAGES (PROJECT PAGES)
  basePath: process.env.NODE_ENV === 'production' ? '/gta-optimiser' : '', // Replace 'gta-optimiser' with your repository name
  assetPrefix: process.env.NODE_ENV === 'production' ? '/gta-optimiser/' : '', // Replace 'gta-optimiser' with your repository name, and include trailing slash
};

export default nextConfig;