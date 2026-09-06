const fs = require('fs');
let content = fs.readFileSync('src/app/(auth)/register/page.tsx', 'utf8');

content = content.replace('import { Badge } from "@/components/ui/badge";', 'import { Badge } from "@/components/ui/badge";\nimport { useI18n } from "@/components/providers/I18nProvider";');
content = content.replace('export default function RegisterPage() {', 'export default function RegisterPage() {\n  const { t } = useI18n();');

content = content.replace('Choose your account type', '{t.auth.register}');
content = content.replace('Select how you plan to use HuntBoard to customize your workspace', '{t.auth.register}');
content = content.replace('<h3 className="text-sm font-bold text-white">Job Seeker</h3>', '<h3 className="text-sm font-bold text-white">{t.auth.seekerRole}</h3>');
content = content.replace('<h3 className="text-sm font-bold text-white">Recruiter / Employer</h3>', '<h3 className="text-sm font-bold text-white">{t.auth.recruiterRole}</h3>');
content = content.replace('Continue with Google as {selectedRole === "seeker" ? "Job Seeker" : "Recruiter"}', '{t.auth.register}');
content = content.replace('Already have an account?', '');
content = content.replace('>Log in<', '>{t.auth.login}<');

fs.writeFileSync('src/app/(auth)/register/page.tsx', content);
