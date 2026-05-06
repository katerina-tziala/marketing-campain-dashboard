import { readdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';

export const ignoredDirectories = new Set(['.git', 'coverage', 'dist', 'node_modules', 'public']);

const rootDir = process.cwd();
const mode = process.argv.includes('--check') ? 'check' : 'write';
const supportedExtensions = new Set(['.css', '.scss', '.vue']);

const applyRulePattern = /^([ \t]*)@apply\s+([^;]*?);/gm;
const vueStyleBlockPattern = /(<style\b[^>]*>)([\s\S]*?)(<\/style>)/gi;

export async function collectFiles(directory, supportedExtensionsFilter) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const absolutePath = path.join(directory, entry.name);

    if (entry.isDirectory()) {
      if (!ignoredDirectories.has(entry.name)) {
        files.push(...(await collectFiles(absolutePath, supportedExtensionsFilter)));
      }

      continue;
    }

    if (entry.isFile() && supportedExtensionsFilter.has(path.extname(entry.name))) {
      files.push(absolutePath);
    }
  }

  return files;
}

function formatApplyRules(source) {
  return source.replace(applyRulePattern, (_rule, indent, rawClasses) => {
    const classes = rawClasses.trim().split(/\s+/).filter(Boolean).sort();

    if (classes.length === 0) {
      return `${indent}@apply;`;
    }

    if (classes.length === 1) {
      return `${indent}@apply ${classes[0]};`;
    }

    const classIndent = `${indent}  `;
    const firstLine = `${indent}@apply ${classes[0]}`;
    const remainingLines = classes.slice(1).map((className, index) => {
      const suffix = index === classes.length - 2 ? ';' : '';

      return `${classIndent}${className}${suffix}`;
    });

    return [firstLine, ...remainingLines].join('\n');
  });
}

export function formatTailwindApply(source, filePath) {
  if (path.extname(filePath) !== '.vue') {
    return formatApplyRules(source);
  }

  return source.replace(
    vueStyleBlockPattern,
    (_block, openingTag, styleContent, closingTag) =>
      `${openingTag}${formatApplyRules(styleContent)}${closingTag}`,
  );
}

async function main() {
  const changedFiles = [];
  const files = await collectFiles(rootDir, supportedExtensions);

  for (const filePath of files) {
    const source = await readFile(filePath, 'utf8');
    const formatted = formatTailwindApply(source, filePath);

    if (formatted === source) {
      continue;
    }

    changedFiles.push(path.relative(rootDir, filePath));

    if (mode === 'write') {
      await writeFile(filePath, formatted);
    }
  }

  if (mode === 'check' && changedFiles.length > 0) {
    // eslint-disable-next-line no-undef
    console.error('Tailwind @apply formatting needed:');

    for (const filePath of changedFiles) {
      // eslint-disable-next-line no-undef
      console.error(`  ${filePath}`);
    }

    process.exitCode = 1;
  } else if (mode === 'write' && changedFiles.length > 0) {
    // eslint-disable-next-line no-undef
    console.log(`Formatted Tailwind @apply rules in ${changedFiles.length} file(s).`);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  await main();
}
