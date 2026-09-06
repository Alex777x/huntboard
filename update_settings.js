const fs = require('fs');
let content = fs.readFileSync('src/app/(seeker)/settings/page.tsx', 'utf8');

content = content.replace('import { useI18n } from "@/components/providers/I18nProvider";', 'import { useI18n } from "@/components/providers/I18nProvider";\nimport { localeIncludes } from "@/lib/utils";');
content = content.replace('function isStrictTextLLM(id: string, displayName?: string, description?: string): boolean {', 'function isStrictTextLLM(id: string, displayName: string | undefined, description: string | undefined, locale: string): boolean {');
content = content.replace('  const text = `${id} ${displayName || ""} ${description || ""}`.toLowerCase();', '  const text = `${id} ${displayName || ""} ${description || ""}`;');
content = content.replace('    if (text.includes(word)) {', '    if (localeIncludes(text, word, locale)) {');
content = content.replace(/isStrictTextLLM\((m\.id,\s*m\.name,\s*m\.description)\)/g, 'isStrictTextLLM($1, locale)');

// Wait, I need to check where isStrictTextLLM is called to ensure locale is passed
// Let's just do a regex replace for the calls

content = content.replace(/isStrictTextLLM\(m\.id, m\.name, m\.description\)/g, 'isStrictTextLLM(m.id, m.name, m.description, locale)');

fs.writeFileSync('src/app/(seeker)/settings/page.tsx', content);
