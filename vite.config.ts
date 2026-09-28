// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - TanStack devtools (dev-only, first), tanstackStart, viteReact, tailwindcss, tsConfigPaths,
//     nitro (build-only using cloudflare as a default target), VITE_* env injection, @ path alias,
//     React/TanStack dedupe, error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... }, etc... }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

// GitHub Pages serves this repo at /liatstafftravel/ — only apply that base in CI deploy builds
// so Lovable and local `npm run dev` keep working at /.
const isGitHubPages = process.env.GITHUB_PAGES === "true";
const repoBase = "/liatstafftravel";

export default defineConfig({
  vite: {
    base: isGitHubPages ? `${repoBase}/` : "/",
  },
  // Static hosting on GitHub Pages — skip the Nitro server bundle
  nitro: isGitHubPages ? false : undefined,
  tanstackStart: {
    // Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
    // nitro/vite builds from this
    server: { entry: "server" },
    ...(isGitHubPages
      ? {
          spa: { enabled: true },
          router: { basepath: repoBase },
        }
      : {}),
  },
});
