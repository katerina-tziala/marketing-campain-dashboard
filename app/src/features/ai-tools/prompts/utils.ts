import type { PromptRuleGroup, PromptRuleListType } from './types';

export function getPromptRuleGroup(ruleGroup: PromptRuleGroup): string {
  const { title, preamble, list, type, notes } = ruleGroup;

  const lines: string[] = [`${title}:`];

  if (preamble) {
    lines.push(preamble);
  }

  if (type === 'ordered') {
    list.forEach((item, index) => lines.push(`${index + 1}. ${item}`));
  } else {
    const prefix = type === 'none' ? '' : '- ';
    list.forEach((item) => lines.push(`${prefix}${item}`));
  }

  if (notes?.length) {
    lines.push('');
    notes.forEach((note) => lines.push(note));
  }

  return lines.join('\n');
}

export function getPromptList(
  title: string,
  list: string[],
  type: PromptRuleListType = 'unordered',
): string[] {
  const lines: string[] = [`${title}:`];

  const itemIdentifier = type === 'none' ? '' : '- ';

  for (const listItem of list) {
    lines.push(`${itemIdentifier}${listItem}`);
  }

  return lines;
}

export function getPromptNumberedList(title: string, list: string[]): string[] {
  const lines: string[] = [`${title}:`];

  list.forEach((listItem, index) => {
    lines.push(`${index + 1}. ${listItem}`);
  });

  return lines;
}
