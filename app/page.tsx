"use client"
import Image from "next/image";
import { ChangeEventHandler, useEffect, useState } from "react";
import 'katex/dist/katex.min.css';
import Latex from 'react-latex-next';
import { matrix, Matrix, multiply, index, row, MathNumericType } from 'mathjs';
import { gaussJordanModSteps, math, matrixToLatex } from "./gauss";

export default function Home() {
  const [matrix, setMatrix] = useState<Matrix>();
  const [output, setOutput] = useState<string[]>([]);
  const [parseErr, setParseErr] = useState(false);
  const [mod, setMod] = useState(1);

  useEffect(() => {
    if (matrix) {
      const steps = gaussJordanModSteps(matrix, mod);
      const output = steps.map(el => matrixToLatex(el))
      setOutput(output);
    }
  }, [matrix, mod]);

  const handleMatrix = (value: string): void => {
    try {
      const matrix = parseMatrixString(value);
      setParseErr(false);
      setMatrix(matrix);
    } catch (error) {
      console.error("Invalid matrix format", error);
      setParseErr(true);
      setMatrix(math.matrix());
    }
  }
  return (
    <div className="p-5 flex flex-col max-w-64 gap-5">
      <h1 className="font-bold text-2xl">Gauss-jordan algorithm</h1>
      <div>
        <label htmlFor="matrix" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Matrix</label>
        <textarea id="matrix" rows={4} className="block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 font-mono" placeholder={"1 2 4 5\n4 5 6 7\n8 9 1 2"} onChange={(e) => handleMatrix(e.target.value)}></textarea>
        {parseErr && <p className="mt-2 text-sm text-red-600 dark:text-red-500">Parsing error</p>}
      </div>
      <div>
        <label htmlFor="modulo" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Modulo</label>
        <input type="text" id="modulo" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 font-mono" value={mod} onChange={(e) => setMod(e.target.value == "" ? 0 : parseInt(e.target.value))}required />
      </div>
      {output.length > 0 && 
      <div className="flex flex-col gap-2">
        <h1 className="font-bold text-xl">Output</h1>
        {output.map((el, i) => (
          <div key={i} className="flex flex-col gap-2">
            {i+1 === output.length ?  <div>Final result:</div> : <div>Step {i+1}:</div>}
            <Latex>{`$` + el + `$`}</Latex>
          </div>
        ))}
      </div>
      }
      <p className="text-gray-500">Disclaimer: No guarantee of correctness. Code includes AI-generated content. </p>
    </div>
  );
}

const parseMatrixString = (value: string): Matrix => {
  // Split the string by newlines to get rows
  const rows = value.trim().split('\n');
  
  // Parse each row into an array of numbers
  const matrixArray = rows.map(row => 
    row.trim().split(/\s+/).map(num => parseFloat(num))
  );
  
  // Create a mathjs matrix
  return matrix(matrixArray);
};
