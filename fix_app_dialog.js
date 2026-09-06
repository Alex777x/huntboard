const fs = require('fs');
let content = fs.readFileSync('src/components/applications/ApplicationDialog.tsx', 'utf8');

content = content.replace('on{t.common.delete}?: (id: string) => void;', 'onDelete?: (id: string) => void;');
content = content.replace('on{t.common.delete}(application.id)', 'onDelete(application.id)');

fs.writeFileSync('src/components/applications/ApplicationDialog.tsx', content);
