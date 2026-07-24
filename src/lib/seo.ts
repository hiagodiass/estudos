import { useEffect } from "react";

/**
 * SEO simples por rota, sem dependências extras: define o <title> e a
 * meta description a cada página. Como o EstudoH é uma SPA de uso
 * pessoal/local, isso é suficiente — não precisamos de SSR nem de tags
 * Open Graph dinâmicas.
 */
export function useSeo(title: string, description?: string) {
  useEffect(() => {
    const previousTitle = document.title;
    document.title = `${title} · EstudoFlow`;

    let meta = document.querySelector<HTMLMetaElement>('meta[name="description"]');
    const previousDescription = meta?.getAttribute("content") ?? null;

    if (description) {
      if (!meta) {
        meta = document.createElement("meta");
        meta.setAttribute("name", "description");
        document.head.appendChild(meta);
      }
      meta.setAttribute("content", description);
    }

    return () => {
      document.title = previousTitle;
      if (meta && previousDescription !== null) {
        meta.setAttribute("content", previousDescription);
      }
    };
  }, [title, description]);
}
