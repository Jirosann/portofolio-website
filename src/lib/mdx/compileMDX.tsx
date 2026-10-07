 
 
/* eslint-disable jsx-a11y/alt-text */
import fs from 'fs';
import { compileMDX as compileNextMDX } from 'next-mdx-remote/rsc';
import { compileMermaid } from '../../../scripts/compile-mermaid';
import type { ProjectSoftware } from '@/lib/validation/schemas';
import { ArchitectureDiagram } from '@/components/organisms/ArchitectureDiagram';

export async function compileMDX(mdxPath: string, project: ProjectSoftware) {
  if (!fs.existsSync(mdxPath)) {
    throw new Error(`MDX file not found: ${mdxPath}`);
  }
  
  let mdxSource = fs.readFileSync(mdxPath, 'utf-8');
  let compiledSvg = '';
  
  // If project has Mermaid diagram, compile it and inject
  if (project.architectureDiagram?.type === 'mermaid' && project.architectureDiagram.source) {
    try {
      compiledSvg = await compileMermaid(
        project.architectureDiagram.source,
        `${project.title} Architecture Diagram`
      );
      
      // Replace placeholder comment with ArchitectureDiagram component
      // Placeholder: [DIAGRAM INJECTED HERE - DO NOT EDIT]
      mdxSource = mdxSource.replace(
        /\[DIAGRAM INJECTED HERE - DO NOT EDIT\]/g,
        `<ProjectArchitectureDiagram />`
      );
    } catch (error: any) {
      console.error(`Failed to compile Mermaid diagram for ${project.slug}:`, error.message);
      // Leave placeholder in place if compilation fails
    }
  }
  
  // Compile MDX with custom components
  const { content } = await compileNextMDX({
    source: mdxSource,
    components: {
      ProjectArchitectureDiagram: () => compiledSvg ? (
        <ArchitectureDiagram svgContent={compiledSvg} title={`${project.title} Architecture Diagram`} />
      ) : null,
      // Custom components for MDX rendering
      h2: (props: any) => <h2 className="text-2xl font-bold mt-8 mb-4 text-text" {...props} />,
      h3: (props: any) => <h3 className="text-xl font-semibold mt-6 mb-3 text-text" {...props} />,
      p: (props: any) => <p className="mb-4 leading-relaxed text-text" {...props} />,
      ul: (props: any) => <ul className="list-disc list-inside mb-4 space-y-2" {...props} />,
      ol: (props: any) => <ol className="list-decimal list-inside mb-4 space-y-2" {...props} />,
      li: (props: any) => <li className="text-text" {...props} />,
      strong: (props: any) => <strong className="font-semibold text-text" {...props} />,
      code: (props: any) => <code className="font-mono text-sm bg-gray-100 px-1 rounded" {...props} />,
      a: (props: any) => {
        const isExternal = props.href?.startsWith('http');
        return (
          <a 
            className="text-[var(--color-link-text)] hover:underline" 
            target={isExternal ? '_blank' : undefined}
            rel={isExternal ? 'noopener noreferrer' : undefined}
            {...props} 
          />
        );
      },
      img: (props: any) => (
        <img
          {...props}
          className="my-6 rounded-lg max-w-full h-auto"
          loading="lazy"
        />
      ),
    },
    options: {
      parseFrontmatter: false,
    },
  });
  
  return content;
}
