import fs from 'fs';
import path from 'path';

function fixFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let original = content;

  // Pattern: const { a, b } = useAuthStore();
  const regex = /const\s+\{\s*([^}]+?)\s*\}\s*=\s*useAuthStore\(\);/g;
  
  content = content.replace(regex, (match, vars) => {
    const variables = vars.split(',').map(v => v.trim()).filter(v => v);
    if (variables.length === 1) {
      if (variables[0] === "user as any") return `const user = useAuthStore(s => s.user) as any;`;
      return `const ${variables[0]} = useAuthStore(s => s.${variables[0]});`;
    } else {
       // use multiple statements
       return variables.map(v => `const ${v} = useAuthStore(s => s.${v});`).join('\n  ');
    }
  });

  if (content !== original) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Fixed ${filePath}`);
  }
}

function walkDir(dir) {
  if (!fs.existsSync(dir)) return;
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      walkDir(fullPath);
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
      fixFile(fullPath);
    }
  }
}

walkDir('./src');
walkDir('./mobile/src');
walkDir('./mobile');
console.log('Done!');
