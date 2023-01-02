/**
 * Represents output as a stream.
 */
interface StreamOutput {
    output_type: 'stream';
    name: 'stdout' | 'stderr';
    text: string;
}

/**
 * Represents a data output.
 */
interface DisplayDataOutput {
    output_type: 'display_data';
    data: Data;
    metadata: any;
}

/**
 * Represents output from execution of a cell.
 */
interface ExecutionResultOutput {
    output_type: 'execute_result';
    execution_count: number;
    data: Data;
    metadata: any;
}

/**
 * Represents error output.
 */
interface ErrorOutput {
    output_type: 'error';
    ename: string;
    evalue: string;
    traceback: string[];
}

/**
 * Represents data within output.
 */
interface Data {
    "text/plain"?: string[];
}

export type CodeOutput = StreamOutput | DisplayDataOutput | ExecutionResultOutput | ErrorOutput;

/**
 * Type guard for whether an output is a stream output.
 * @param output The output.
 * @returns Whether.
 */
export function isStreamOutput(output: CodeOutput): output is StreamOutput {
    return output.output_type === 'stream';
}

/**
 * Type guard for whether an output is a display data output.
 * @param output The output.
 * @returns Whether.
 */
export function isDisplayDataOutput(output: CodeOutput): output is DisplayDataOutput {
    return output.output_type === 'display_data';
}

/**
 * Type guard for whether an output is an execution result output.
 * @param output The output.
 * @returns Whether.
 */
export function isExecutionResultOutput(output: CodeOutput): output is ExecutionResultOutput {
    return output.output_type === 'execute_result';
}

/**
 * Type guard for whether an output is an error output.
 * @param output The output.
 * @returns Whether.
 */
export function isErrorOutput(output: CodeOutput): output is ErrorOutput {
    return output.output_type === 'error';
}
