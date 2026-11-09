const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const ts = require('typescript');
const source = fs.readFileSync('lib/printSafety.ts', 'utf8');
const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText;
const moduleExports = {};
vm.runInNewContext(compiled, { exports: moduleExports });
const { escapePrintText, safePrintCustomization } = moduleExports;
const attack = '</style><script>alert(1)</script><img src=x onerror=alert(1)>';
const escaped = escapePrintText(attack);
assert.equal(escaped.includes('<'), false);
assert.equal(escapePrintText('A & B "quoted"'), 'A &amp; B &quot;quoted&quot;');
const colors = safePrintCustomization({ cellTextColor: attack, cellBorderSize: attack, cellFontSize: Infinity, cardBackgroundColor: attack });
assert.equal(colors.cellTextColor, '#24382c');
assert.equal(colors.cellBorderSize, 3);
assert.equal(colors.cellFontSize, 1);
assert.equal(colors.cardBackgroundColor, '#ffffff');
assert.equal(safePrintCustomization({ cellTextColor: '#aabbcc' }).cellTextColor, '#aabbcc');
for (const path of ['app/page.tsx', 'app/card/[code]/page.tsx']) {
  const code = fs.readFileSync(path, 'utf8');
  assert.match(code, /escapePrintText\(item\)/, `${path} must escape card items`);
  assert.match(code, /safePrintCustomization\(/, `${path} must sanitize print styles`);
}
console.log('Print safety checks passed');
