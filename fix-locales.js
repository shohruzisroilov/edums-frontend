const fs = require('fs');
const path = require('path');

const files = ['en.ts', 'ru.ts', 'uz.ts', 'uz-cyrl.ts'];
const permissions = [
  { key: 'permission.groups.view_own', base: 'permission.groups.view' },
  { key: 'permission.students.view_own', base: 'permission.students.view' },
  { key: 'permission.attendance.view_own', base: 'permission.attendance.view' },
  { key: 'permission.attendance.mark_own', base: 'permission.attendance.mark' },
  { key: 'permission.reports.view_own', base: 'permission.reports.view' },
];

for (const file of files) {
  const p = path.join(__dirname, 'src', 'i18n', 'dictionaries', file);
  let content = fs.readFileSync(p, 'utf8');

  // Remove duplicates added earlier if any
  content = content.replace(/    'permission\.groups\.view_own': "Faqat o'ziga tegishli guruhlarni ko'rish",\n    'permission\.groups\.view_own': "Faqat o'ziga tegishli guruhlarni ko'rish",\n/, "    'permission.groups.view_own': \"Faqat o'ziga tegishli guruhlarni ko'rish\",\n");

  for (const perm of permissions) {
    if (!content.includes(`'${perm.key}'`)) {
      // Find the base key and insert the _own key right after
      const regex = new RegExp(`(    '${perm.base}': .*?,\n)`);
      if (content.match(regex)) {
         content = content.replace(regex, `$1    '${perm.key}': "Own view (temp translation)",\n`);
      }
    }
  }
  
  fs.writeFileSync(p, content, 'utf8');
}
