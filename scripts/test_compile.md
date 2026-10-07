
import { compileMermaid } from "./compile-mermaid";

const mermaidSyntax = `graph TD
  A[Client] --> B[API Gateway]
  B --> C[Product Service]
  B --> D[Cart Service]
  B --> E[Payment Service]
  C --> F[(PostgreSQL)]
  D --> F
  E --> G[Stripe API]`;

compileMermaid(mermaidSyntax, "E-Commerce API Architecture Diagram")
  .then(svg => {
    fs.writeFileSync("svg-output-test.svg", svg);
    console.log("Done");
    console.log("Title present:", svg.includes("<title>"));
    console.log("Aria-label present:", svg.includes("aria-label"));
  })
  .catch(err => console.error("Failed:", err));

