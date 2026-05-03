export type PromptRuleListType = 'ordered' | 'unordered' | 'none'

export interface PromptRuleGroup {
    title: string
    list: string[]
    type: PromptRuleListType
}

export function getPromptRuleGroup(ruleGroup: PromptRuleGroup): string {
    const { title, list, type } = ruleGroup;

    if (type === 'ordered') {
        return getPromptNumberedList(title, list).join("\n")
    }

    return getPromptList(title, list, type).join("\n")
}


function getPromptList(title: string, list: string[], type: 'unordered' | 'none' = 'unordered'): string[] {
    const lines: string[] = [`${title}:`];

    const itemIdentifier = type === 'none' ? '' : '- '

    for (const listItem of list) {
        lines.push(`${itemIdentifier}${listItem}`);
    }

    return lines;
}

function getPromptNumberedList(title: string, list: string[]): string[] {
    const lines: string[] = [`${title}:`];

    list.forEach((listItem, index) => {
        lines.push(`${index + 1}. ${listItem}`);
    });

    return lines;
}