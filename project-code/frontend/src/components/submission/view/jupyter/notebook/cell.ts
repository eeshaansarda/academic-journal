import { CodeOutput } from "@components/submission/view/jupyter/notebook/codeOutput";

/**
 * Represents a cell containing (Python) code.
 */
export interface CodeCell {
    cell_type: 'code';
    execution_count: number;
    metadata: any;
    source: string[];
    outputs: CodeOutput[];
}

/**
 * Represents a cell with markdown formatting.
 */
interface MarkdownCell {
    cell_type: 'markdown';
    metadata: any;
    source: string[];
}

/**
 * Represents a raw cell.
 */
interface RawCell {
    cell_type: 'raw';
    metadata: any;
    source: string[];
}

export type Cell = CodeCell | MarkdownCell | RawCell;

/**
 * Type guard for whether a cell is a code cell.
 * @param cell The cell.
 * @returns Whether.
 */
export function isCodeCell(cell: Cell): cell is CodeCell {
    return cell.cell_type === 'code';
}

/**
 * Type guard for whether a cell is a markdown cell.
 * @param cell The cell.
 * @returns Whether.
 */
export function isMarkdownCell(cell: Cell): cell is MarkdownCell {
    return cell.cell_type === 'markdown';
}

/**
 * Type guard for whether a cell is a raw cell.
 * @param cell The cell.
 * @returns Whether.
 */
export function isRawCell(cell: Cell): cell is MarkdownCell {
    return cell.cell_type === 'raw';
}