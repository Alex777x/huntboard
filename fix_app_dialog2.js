const fs = require('fs');
let content = fs.readFileSync('src/components/applications/ApplicationDialog.tsx', 'utf8');

content = content.replace('on{t.common.delete},', 'onDelete,');
content = content.replace('{application && on{t.common.delete} ? (', '{application && onDelete ? (');
content = content.replace('onClick={() => on{t.common.delete}(application.id)}', 'onClick={() => onDelete(application.id)}');

fs.writeFileSync('src/components/applications/ApplicationDialog.tsx', content);
