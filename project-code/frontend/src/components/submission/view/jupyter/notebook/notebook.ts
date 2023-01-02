import { Cell } from "@components/submission/view/jupyter/notebook/cell";

/**
 * Represents a Jupyter notebook.
 */
export interface Notebook {
    cells: Cell[];
    metadata: {
        kernel_info?: {
            name: string;
        };
        language_info?: {
            name: string;
            version?: string;
        }
    };
    nbformat: number;
    nbformat_minor: number;
}