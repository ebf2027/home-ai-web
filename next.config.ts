import type { NextConfig } from "next";

const withPWA = require("next-pwa")({
  dest: "public", // É aqui que o Service Worker será gerado
  disable: process.env.NODE_ENV === "development", // Desativa no modo de desenvolvimento para não bugar o seu live reload
  register: true,
  skipWaiting: true,
});

const nextConfig: NextConfig = {
  /* config options here */
};

export default withPWA(nextConfig);