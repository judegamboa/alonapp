<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.

# Design

Before building or changing ANY UI (pages, components, emails, the client portal), invoke the `alon-design` skill (`.claude/skills/alon-design/SKILL.md`). It defines the token palette, typography, tideline signature, component conventions (Base UI `render` prop, no `asChild`), copy voice, and the quality floor. Do not introduce raw colors or new fonts outside that system.
<!-- END:nextjs-agent-rules -->
