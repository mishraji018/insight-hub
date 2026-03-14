import fs from 'fs';
import path from 'path';

function fixFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let original = content;

  // Add showsVerticalScrollIndicator={false} to ScrollView if not present
  content = content.replace(/<ScrollView(?![^>]*showsVerticalScrollIndicator)/g, '<ScrollView showsVerticalScrollIndicator={false}');

  // Add activeOpacity={0.7} to TouchableOpacity if not present
  content = content.replace(/<TouchableOpacity(?![^>]*activeOpacity)/g, '<TouchableOpacity activeOpacity={0.7}');

  // Add resizeMode="cover" to Image if not present
  content = content.replace(/<Image(?![^>]*resizeMode)/g, '<Image resizeMode="cover"');

  // Add returnKeyType="done" to TextInput if not present
  content = content.replace(/<TextInput(?![^>]*returnKeyType)/g, '<TextInput returnKeyType="done"');

  if (content !== original) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Fixed ${path.basename(filePath)}`);
  }
}

function walkDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      walkDir(fullPath);
    } else if (fullPath.endsWith('.tsx')) {
      fixFile(fullPath);
    }
  }
}

walkDir('./mobile/src/screens');
console.log('Done!');
