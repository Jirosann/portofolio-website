interface ArchitectureDiagramProps {
  svgContent: string;
  title: string;
}

/**
 * Renders a pre-compiled SVG architecture diagram with accessibility attributes.
 * The SVG is compiled at build time (Mermaid → SVG) and injected here.
 * Screen reader gets the title; the visual diagram is aria-hidden to prevent double-reading.
 */
export function ArchitectureDiagram({ svgContent, title }: ArchitectureDiagramProps) {
  if (!svgContent) return null;

  return (
    <figure className="architecture-diagram" role="figure" aria-label={title}>
      <figcaption className="sr-only">{title}</figcaption>
      <div
        className="architecture-diagram-svg"
        // SVG has its own <title> injected by compileMermaid
        dangerouslySetInnerHTML={{ __html: svgContent }}
        aria-hidden="true"
      />
    </figure>
  );
}
