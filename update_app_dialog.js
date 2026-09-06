const fs = require('fs');
let content = fs.readFileSync('src/components/applications/ApplicationDialog.tsx', 'utf8');

content = content.replace('import { Badge } from "@/components/ui/badge";', 'import { Badge } from "@/components/ui/badge";\nimport { useI18n } from "@/components/providers/I18nProvider";');
content = content.replace('export function ApplicationDialog({', 'export function ApplicationDialog({\n  isOpen,\n  onClose,\n  application,\n  initialStatus = "wishlist",\n  onSave,\n  onDelete,\n}: ApplicationDialogProps) {\n  const { t } = useI18n();\n\n  // ... (dummy skip)\n  const _dummy = false; // Just to break regex mismatch\n');

// Since we matched the function signature, let's do a smarter replace
let lines = content.split('\n');
let newLines = [];
let inFunc = false;
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('export function ApplicationDialog({')) {
    inFunc = true;
  }
  if (inFunc && lines[i].includes('  const [formData, setFormData] = React.useState')) {
    newLines.push('  const { t } = useI18n();');
    inFunc = false;
  }
  
  // replace some texts
  let line = lines[i];
  line = line.replace('New Job Application', '{t.common.newApplication}');
  line = line.replace('Company Name *', '{t.cv.experience.company}');
  line = line.replace('Job Title *', '{t.cv.experience.role}');
  line = line.replace('Delete', '{t.common.delete}');
  line = line.replace('Cancel', '{t.common.cancel}');
  line = line.replace('Save Changes', '{t.common.saveChanges}');
  line = line.replace('Wishlist (Planning)', '{t.applications.stages.wishlist}');
  
  newLines.push(line);
}

fs.writeFileSync('src/components/applications/ApplicationDialog.tsx', newLines.join('\n'));
