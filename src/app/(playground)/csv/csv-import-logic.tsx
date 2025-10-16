"use client";

import { useState, useCallback, ChangeEvent } from "react";

interface ParsedData {
    headers: string[];
    rows: string[][];
}

const SEPARATORS = [
    { value: ",", label: "," },
    { value: ";", label: ";" },
    { value: "-", label: "-" },
];

export function useCSVImportLogic() {
    const [inputMode, setInputMode] = useState<"file" | "text">("file");
    const [file, setFile] = useState<File | null>(null);
    const [csvContent, setCsvContent] = useState<string>("");
    const [textInput, setTextInput] = useState<string>("");
    const [separator, setSeparator] = useState<string>(",");
    const [customSeparator, setCustomSeparator] = useState<string>("");
    const [parsedData, setParsedData] = useState<ParsedData | null>(null);
    const [originalParsedData, setOriginalParsedData] = useState<ParsedData | null>(null);
    const [editedCells, setEditedCells] = useState<Set<string>>(new Set());
    const [selectedRows, setSelectedRows] = useState<Set<number>>(new Set());
    const [customHeaders, setCustomHeaders] = useState<string[]>([]);
    const [useCustomHeaders, setUseCustomHeaders] = useState(false);
    const [hasHeaders, setHasHeaders] = useState(true);

    const parseCSV = useCallback(
        (content: string, sep: string): ParsedData => {
            if (!content.trim()) {
                return { headers: [], rows: [] };
            }

            const lines = content.split("\n").filter((line) => line.trim());
            if (lines.length === 0) {
                return { headers: [], rows: [] };
            }

            const parseLine = (line: string): string[] => {
                const result: string[] = [];
                let current = "";
                let inQuotes = false;

                for (let i = 0; i < line.length; i++) {
                    const char = line[i];
                    const nextChar = line[i + 1];

                    if (char === "\"") {
                        if (inQuotes && nextChar === "\"") {
                            current += "\"";
                            i++;
                        } else {
                            inQuotes = !inQuotes;
                        }
                    } else if (char === sep && !inQuotes) {
                        result.push(current.trim());
                        current = "";
                    } else {
                        current += char;
                    }
                }

                result.push(current.trim());
                return result;
            };

            const allRows = lines.map(parseLine);

            if (hasHeaders && allRows.length > 0) {
                const headers = allRows[0];
                const rows = allRows.slice(1);
                return { headers, rows };
            } else {
                const maxColumns = Math.max(...allRows.map((row) => row.length));
                const headers = Array.from({ length: maxColumns }, (_, i) => `Column ${i + 1}`);
                return { headers, rows: allRows };
            }
        },
        [hasHeaders],
    );

    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile && selectedFile.type === "text/csv") {
            setFile(selectedFile);

            const reader = new FileReader();
            reader.onload = (event) => {
                const content = event.target?.result as string;
                setCsvContent(content);
                const parsed = parseCSV(content, separator);
                setParsedData(parsed);
                setOriginalParsedData(parsed);
                setCustomHeaders(parsed.headers);
                setEditedCells(new Set());
                setSelectedRows(new Set(Array.from({ length: parsed.rows.length }, (_, i) => i)));
            };
            reader.readAsText(selectedFile);
        }
    };

    const handleTextInputChange = (value: string) => {
        setTextInput(value);
        setCsvContent(value);
        if (value.trim()) {
            const parsed = parseCSV(value, separator);
            setParsedData(parsed);
            setOriginalParsedData(parsed);
            setCustomHeaders(parsed.headers);
            setEditedCells(new Set());
        } else {
            setParsedData(null);
            setOriginalParsedData(null);
            setCustomHeaders([]);
            setEditedCells(new Set());
            setSelectedRows(new Set());
        }
    };

    const handleInputModeChange = (mode: "file" | "text") => {
        setInputMode(mode);
        setFile(null);
        setTextInput("");
        setCsvContent("");
        setParsedData(null);
        setOriginalParsedData(null);
        setCustomHeaders([]);
        setEditedCells(new Set());
        setSelectedRows(new Set());
        setCustomSeparator("");
    };

    const handleSeparatorChange = (newSeparator: string) => {
        setSeparator(newSeparator);
        if (newSeparator !== "custom") {
            setCustomSeparator("");
        }
        const content = inputMode === "file" ? csvContent : textInput;
        if (content) {
            const actualSeparator = newSeparator === "custom" ? customSeparator : newSeparator;
            if (actualSeparator) {
                const parsed = parseCSV(content, actualSeparator);
                setParsedData(parsed);
                setOriginalParsedData(parsed);
                setCustomHeaders(parsed.headers);
                setEditedCells(new Set());
                setSelectedRows(new Set(Array.from({ length: parsed.rows.length }, (_, i) => i)));
            }
        }
    };

    const handleCustomSeparatorChange = (value: string) => {
        setCustomSeparator(value);
        if (separator === "custom" && value) {
            const content = inputMode === "file" ? csvContent : textInput;
            if (content) {
                const parsed = parseCSV(content, value);
                setParsedData(parsed);
                setOriginalParsedData(parsed);
                setCustomHeaders(parsed.headers);
                setEditedCells(new Set());
                setSelectedRows(new Set(Array.from({ length: parsed.rows.length }, (_, i) => i)));
            }
        }
    };

    const handleHeaderChange = (index: number, value: string) => {
        const newHeaders = [...customHeaders];
        newHeaders[index] = value;
        setCustomHeaders(newHeaders);
    };

    const handleHasHeadersChange = (value: boolean) => {
        setHasHeaders(value);
        const content = inputMode === "file" ? csvContent : textInput;
        if (content) {
            const actualSeparator = separator === "custom" ? customSeparator : separator;
            if (actualSeparator) {
                const parsed = parseCSV(content, actualSeparator);
                setParsedData(parsed);
                setOriginalParsedData(parsed);
                setCustomHeaders(parsed.headers);
                setEditedCells(new Set());
                setSelectedRows(new Set(Array.from({ length: parsed.rows.length }, (_, i) => i)));
            }
        }
    };

    const handleCellChange = (rowIndex: number, cellIndex: number, value: string) => {
        if (!parsedData) return;

        const newParsedData = {
            ...parsedData,
            rows: parsedData.rows.map((row, rIdx) => (rIdx === rowIndex ? row.map((cell, cIdx) => (cIdx === cellIndex ? value : cell)) : row)),
        };
        setParsedData(newParsedData);

        const cellKey = `${rowIndex}-${cellIndex}`;
        const newEditedCells = new Set(editedCells);
        if (originalParsedData && originalParsedData.rows[rowIndex]?.[cellIndex] !== value) {
            newEditedCells.add(cellKey);
        } else {
            newEditedCells.delete(cellKey);
        }
        setEditedCells(newEditedCells);
    };

    const handleResetData = () => {
        if (originalParsedData) {
            setParsedData(originalParsedData);
            setEditedCells(new Set());
        }
    };

    const handleResetCell = (rowIndex: number, cellIndex: number) => {
        if (!parsedData || !originalParsedData) return;

        const originalValue = originalParsedData.rows[rowIndex]?.[cellIndex] || "";
        const newParsedData = {
            ...parsedData,
            rows: parsedData.rows.map((row, rIdx) => (rIdx === rowIndex ? row.map((cell, cIdx) => (cIdx === cellIndex ? originalValue : cell)) : row)),
        };
        setParsedData(newParsedData);

        const cellKey = `${rowIndex}-${cellIndex}`;
        const newEditedCells = new Set(editedCells);
        newEditedCells.delete(cellKey);
        setEditedCells(newEditedCells);
    };

    const getCellDisplayInfo = (cellKey: string) => {
        const [rowIndex, cellIndex] = cellKey.split("-").map(Number);
        const currentValue = parsedData?.rows[rowIndex]?.[cellIndex] || "";
        const originalValue = originalParsedData?.rows[rowIndex]?.[cellIndex] || "";
        const columnName = (useCustomHeaders ? customHeaders : parsedData?.headers || [])[cellIndex] || `Column ${cellIndex + 1}`;

        return {
            rowIndex,
            cellIndex,
            columnName,
            rowNumber: rowIndex + 1,
            currentValue,
            originalValue,
        };
    };

    const toggleRowSelection = (rowIndex: number) => {
        const newSelectedRows = new Set(selectedRows);
        if (newSelectedRows.has(rowIndex)) {
            newSelectedRows.delete(rowIndex);
        } else {
            newSelectedRows.add(rowIndex);
        }
        setSelectedRows(newSelectedRows);
    };

    const selectAllRows = () => {
        if (!parsedData) return;
        setSelectedRows(new Set(Array.from({ length: parsedData.rows.length }, (_, i) => i)));
    };

    const deselectAllRows = () => {
        setSelectedRows(new Set());
    };

    const handleSubmit = () => {
        if (!parsedData) return;

        const finalHeaders = useCustomHeaders ? customHeaders : parsedData.headers;
        const selectedRowsArray = Array.from(selectedRows).sort((a, b) => a - b);
        const selectedRowsData = selectedRowsArray.map((index) => parsedData.rows[index]);

        console.log("=== CSV Import Results ===");
        console.log("Headers:", finalHeaders);
        console.log("Selected Rows:", selectedRowsArray.length, "of", parsedData.rows.length);
        console.log("Total Columns:", finalHeaders.length);

        selectedRowsData.forEach((row, index) => {
            const originalRowIndex = selectedRowsArray[index];
            const rowObject: Record<string, string> = {};
            finalHeaders.forEach((header, colIndex) => {
                rowObject[header] = row[colIndex] || "";
            });
            console.log(`Row ${originalRowIndex + 1}:`, rowObject);
        });

        console.log("=== Raw Data Structure ===");
        console.log("All entities:", {
            headers: finalHeaders,
            rows: selectedRowsData,
            selectedRowIndexes: selectedRowsArray,
            metadata: {
                separator: separator,
                totalRows: selectedRowsData.length,
                totalOriginalRows: parsedData.rows.length,
                totalColumns: finalHeaders.length,
                hasCustomHeaders: useCustomHeaders,
            },
        });
    };

    return {
        inputMode,
        file,
        csvContent,
        textInput,
        separator,
        customSeparator,
        parsedData,
        editedCells,
        selectedRows,
        customHeaders,
        useCustomHeaders,
        hasHeaders,
        SEPARATORS,
        handleInputModeChange,
        handleFileChange,
        handleTextInputChange,
        handleSeparatorChange,
        handleCustomSeparatorChange,
        handleHeaderChange,
        handleHasHeadersChange,
        handleCellChange,
        handleResetData,
        handleResetCell,
        getCellDisplayInfo,
        handleSubmit,
        toggleRowSelection,
        selectAllRows,
        deselectAllRows,
        setUseCustomHeaders,
    };
}
