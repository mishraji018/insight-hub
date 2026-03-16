const fs = require('fs');
const log = fs.readFileSync('ts.log', 'utf8');
const rx = /^(.+?\.tsx?)\(\d+,\d+\): error TS/gm;
let m;
const e = new Set();
while((m = rx.exec(log)) !== null) {
  e.add(m[1].trim());
}
console.log(Array.from(e).join('\n'));
