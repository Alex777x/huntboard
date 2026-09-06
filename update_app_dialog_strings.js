const fs = require('fs');
let content = fs.readFileSync('src/components/applications/ApplicationDialog.tsx', 'utf8');

// replace "Edit Application" -> {t.common.edit}
content = content.replace(/"Edit Application" : "New Job Application"/g, 't.common.edit : t.common.newApplication');
content = content.replace(/"Save Changes" : "Create Application"/g, 't.common.saveChanges : t.common.newApplication');
content = content.replace(/"Cancel"/g, 't.common.cancel');
content = content.replace(/"Delete"/g, 't.common.delete');
// Note: We'll replace with just {t.common.edit} if it's inside {} already, wait...
// The original is: {application ? "Edit Application" : "New Job Application"}
// So replacing the string literal with a variable works if we remove the quotes.

fs.writeFileSync('src/components/applications/ApplicationDialog.tsx', content);
