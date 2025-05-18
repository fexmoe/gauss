import { create, all, Matrix } from 'mathjs';

export const math = create(all);

const mod = (n: number, p: number): number => {
    if (p === 1) return n;
    return((n % p) + p) % p
};

const modInverse = (a: number, p: number): number => {
    if (p === 1) {
        if (a === 0) throw new Error("Division by zero");
        return 1 / a; // Regular inverse for standard elimination
    }
    let [oldR, r] = [a, p];
    let [oldS, s] = [1, 0];
    while (r !== 0) {
        const quotient = Math.floor(oldR / r);
        [oldR, r] = [r, oldR - quotient * r];
        [oldS, s] = [s, oldS - quotient * s];
    }
    return mod(oldR !== 1 ? 0 : oldS, p);
};

// Helper function to get all column indices as an array
const getAllCols = (cols: number) => Array.from({length: cols}, (_, j) => j);

// Modified matrix operation helpers using proper indexing
const swapRows = (matrix: Matrix, i: number, j: number): Matrix => {
    const rows = matrix.toArray() as number[][];
    [rows[i], rows[j]] = [rows[j], rows[i]];
    return math.matrix(rows);
};

const scaleRow = (matrix: Matrix, rowIdx: number, scalar: number, p: number): Matrix => {
    const rows = matrix.toArray() as number[][];
    rows[rowIdx] = rows[rowIdx].map(x => mod(x * scalar, p));
    return math.matrix(rows);
};

const subtractRow = (matrix: Matrix, targetRow: number, sourceRow: number, factor: number, p: number): Matrix => {
    const rows = matrix.toArray() as number[][];
    const source = rows[sourceRow];
    rows[targetRow] = rows[targetRow].map((x, j) => mod(x - factor * source[j], p));
    return math.matrix(rows);
};

// Modified Gauss-Jordan with step tracking using array conversions
export const gaussJordanModSteps = (matrix: Matrix, p: number): Matrix[] => {
    const steps: Matrix[] = [];
    let M = matrix.clone();
    
    const [rows, cols] = M.size();
    let lead = 0;

    // Track initial state
    steps.push(M.clone());

    for (let r = 0; r < rows; r++) {
        if (lead >= cols - 1) break;

        // Find pivot
        let i = r;
        while (mod(M.get([i, lead]), p) === 0) {
            i++;
            if (i === rows) {
                i = r;
                lead++;
                if (lead === cols - 1) break;
            }
        }
        if (lead === cols - 1) break;

        // Row swap with tracking
        if (i !== r) {
            M = swapRows(M, i, r);
            steps.push(M.clone());
        }

        // Scale pivot row
        const pivotVal = mod(M.get([r, lead]), p);
        const invPivot = modInverse(pivotVal, p);
        M = scaleRow(M, r, invPivot, p);
        steps.push(M.clone());

        // Eliminate other rows with tracking
        for (let i = 0; i < rows; i++) {
            if (i !== r) {
                const factor = mod(M.get([i, lead]), p);
                M = subtractRow(M, i, r, factor, p);
                steps.push(M.clone());
            }
        }

        lead++;
    }
    
    return steps;
};


export function matrixToLatex(matrix: Matrix): string {
    const array = matrix.toArray() as number[][];
    const rows = array.map(row => 
        row.map(x => x.toString().padStart(2)).join(' & ')
    ).join(' \\\\\n');
    
    return `\\begin{pmatrix}\n${rows}\n\\end{pmatrix}`;
}