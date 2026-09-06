const fs = require('fs');
let content = fs.readFileSync('src/app/(auth)/login/page.tsx', 'utf8');

content = content.replace('import { Button } from "@/components/ui/button";', 'import { Button } from "@/components/ui/button";\nimport { useI18n } from "@/components/providers/I18nProvider";');
content = content.replace('export default function LoginPage() {', 'export default function LoginPage() {\n  const { t } = useI18n();');

content = content.replace('Sign in to access your AI-powered career pipeline', '{t.auth.login}');
content = content.replace('Continue with Google', '{t.auth.login}');
content = content.replace('Or Fast Demo Preview', '{t.nav.dashboard}');
content = content.replace('Explore as Job Seeker', '{t.auth.seekerRole}');
content = content.replace('Explore as Platform Admin', '{t.nav.adminMode}');
content = content.replace("Don&apos;t have an account yet?", '');
content = content.replace('Select your role & Register', '{t.auth.register}');

fs.writeFileSync('src/app/(auth)/login/page.tsx', content);
