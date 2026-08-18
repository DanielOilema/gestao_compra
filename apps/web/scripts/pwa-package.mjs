#!/usr/bin/env node
/**
 * Abre o PWABuilder para empacotar a PWA (Android TWA / Windows).
 * Requer URL de produção em HTTPS com manifest e service worker ativos.
 *
 * Uso:
 *   pnpm pwa:package
 *   pnpm pwa:package -- https://seu-dominio.com
 */

const siteUrl = process.argv[2] ?? process.env.PWA_SITE_URL;

if (!siteUrl) {
  console.error(`
Erro: informe a URL de produção (HTTPS).

Exemplos:
  pnpm pwa:package -- https://protheus-connect.vercel.app
  PWA_SITE_URL=https://protheus-connect.vercel.app pnpm pwa:package
`);
  process.exit(1);
}

const target = `https://www.pwabuilder.com/reportcard?site=${encodeURIComponent(siteUrl)}`;
console.log(`Abrindo PWABuilder para: ${siteUrl}`);
console.log(target);

import { execSync } from "node:child_process";

const command =
  process.platform === "win32"
    ? `start "" "${target}"`
    : process.platform === "darwin"
      ? `open "${target}"`
      : `xdg-open "${target}"`;

execSync(command, { stdio: "inherit" });
