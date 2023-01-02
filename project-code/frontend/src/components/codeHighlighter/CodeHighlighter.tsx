import Prism from "prismjs";
import {useEffect} from "react";
import "prismjs/themes/prism-coy.css"
import "prismjs/components/prism-java"
import "prismjs/components/prism-bash"
import "prismjs/components/prism-clike"
import "prismjs/components/prism-markdown"
import "prismjs/components/prism-python"
import "prismjs/components/prism-haskell"
import "prismjs/components/prism-csharp"
import "prismjs/components/prism-python"
import "prismjs/components/prism-typescript"
import "prismjs/components/prism-kotlin"
import "prismjs/components/prism-go"
import "prismjs/components/prism-jsx"
import "prismjs/components/prism-tsx"
import "prismjs/components/prism-sass"
import "prismjs/components/prism-scss"
import "prismjs/components/prism-sql"
import "prismjs/components/prism-lua"
import "prismjs/components/prism-latex"
import "prismjs/plugins/line-numbers/prism-line-numbers"
import "prismjs/plugins/line-numbers/prism-line-numbers.css"

interface CodeHighlighterProps {
    startLineNumber: number;
    payload: string;
    extension: string | null;
}

export const languageMap = new Map<string | null, string>([
    ['.js', 'javascript'],
    ['.md', 'markdown'],
    ['.c', 'clike'],
    ['.cpp', 'clike'],
    ['.sh', 'bash'],
    ['.java', 'java'],
    ['.hs', 'haskell'],
    ['.cs', 'cs'],
    ['.csv', 'csv'],
    ['.py', 'python'],
    ['.ts', 'typescript'],
    ['.kt', 'kotlin'],
    ['.go', 'go'],
    ['.lua', 'lua'],
    ['.json', 'json'],
    ['.tex', 'latex'],
    ['.lua', 'lua'],
    ['.tex', 'tex'],
    ['.php', 'php'],
    ['.jsx', 'jsx'],
    ['.tsx', 'tsx'],
    ['.sass', 'sass'],
    ['.scss', 'scss'],
    ['.sql', 'sql']
]);

/**
 * Highlights a set of code.
 *
 * @param startLineNumber the starting line of the code to highlight
 * @param payload the contents of the code
 * @param extension the extension representing the file
 */
export default function CodeHighlighter({ startLineNumber, payload, extension }: CodeHighlighterProps) {

    useEffect(() => {
        Prism.highlightAll();
    });
    return (
        <pre className="line-numbers" data-start={startLineNumber}>
            <code className={`language-${languageMap.get(extension)}` ?? 'plain'}>
                { payload }
            </code>
        </pre>

    );
}