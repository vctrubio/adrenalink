"use client";

import { Fragment } from "react";
import { Menu, Transition } from "@headlessui/react";
import { ChevronDown, X } from "lucide-react";
import { useCSVImportLogic } from "./csv-import-logic";

export default function CSVImport() {
    const logic = useCSVImportLogic();

    return (
        <div className="p-6">
            <h1 className="text-3xl font-bold mb-6">CSV Import System</h1>

            <div className="mb-6 p-4 border border-border rounded-lg bg-card">
                <h2 className="text-xl font-semibold mb-4">1. Choose Input Method</h2>

                <div className="mb-4">
                    <div className="flex gap-4">
                        <button
                            onClick={() => logic.handleInputModeChange("file")}
                            className={`px-4 py-2 rounded border transition-colors ${logic.inputMode === "file"
                                ? "bg-primary text-primary-foreground border-primary"
                                : "bg-background text-foreground border-border hover:bg-accent hover:text-accent-foreground"
                            }`}
                        >
              Upload File
                        </button>
                        <button
                            onClick={() => logic.handleInputModeChange("text")}
                            className={`px-4 py-2 rounded border transition-colors ${logic.inputMode === "text"
                                ? "bg-primary text-primary-foreground border-primary"
                                : "bg-background text-foreground border-border hover:bg-accent hover:text-accent-foreground"
                            }`}
                        >
              Paste Text
                        </button>
                    </div>
                </div>

                {logic.inputMode === "file" ? (
                    <>
                        <input
                            type="file"
                            accept=".csv"
                            onChange={logic.handleFileChange}
                            className="block w-full text-sm text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-accent file:text-accent-foreground hover:file:bg-accent/80"
                        />
                        {logic.file && (
                            <p className="mt-2 text-sm text-muted-foreground">
                Selected: {logic.file.name} ({(logic.file.size / 1024).toFixed(2)} KB)
                            </p>
                        )}
                    </>
                ) : (
                    <div>
                        <textarea
                            value={logic.textInput}
                            onChange={(e) => logic.handleTextInputChange(e.target.value)}
                            placeholder="Paste your CSV data here..."
                            className="w-full h-32 px-3 py-2 border border-input rounded bg-background text-foreground focus:ring-2 focus:ring-ring focus:border-input font-mono text-sm"
                        />
                        {logic.textInput && (
                            <p className="mt-2 text-sm text-muted-foreground">
                Characters: {logic.textInput.length}
                            </p>
                        )}
                    </div>
                )}
            </div>

            {(logic.csvContent || logic.textInput) && (
                <>
                    <div className="mb-6 p-4 border border-border rounded-lg bg-card">
                        <h2 className="text-xl font-semibold mb-4">2. Select Separator</h2>
                        <div className="flex gap-2 items-center flex-wrap">
                            {logic.SEPARATORS.map((sep) => (
                                <button
                                    key={sep.value}
                                    onClick={() => logic.handleSeparatorChange(sep.value)}
                                    className={`px-3 py-2 rounded border text-sm transition-colors ${logic.separator === sep.value
                                        ? "bg-primary text-primary-foreground border-primary"
                                        : "bg-background text-foreground border-border hover:bg-accent hover:text-accent-foreground"
                                    }`}
                                >
                                    {sep.label}
                                </button>
                            ))}
                            <button
                                onClick={() => logic.handleSeparatorChange("custom")}
                                className={`px-3 py-2 rounded border text-sm transition-colors ${logic.separator === "custom"
                                    ? "bg-primary text-primary-foreground border-primary"
                                    : "bg-background text-foreground border-border hover:bg-accent hover:text-accent-foreground"
                                }`}
                            >
                Custom
                            </button>
                            {logic.separator === "custom" && (
                                <input
                                    type="text"
                                    value={logic.customSeparator}
                                    onChange={(e) => logic.handleCustomSeparatorChange(e.target.value)}
                                    placeholder="Enter separator"
                                    className="px-3 py-2 border border-input rounded bg-background text-foreground focus:ring-2 focus:ring-ring focus:border-input w-32"
                                />
                            )}
                        </div>
                    </div>

                    <div className="mb-6 p-4 border border-border rounded-lg bg-card">
                        <h2 className="text-xl font-semibold mb-4">3. Configure Headers</h2>

                        <div className="mb-4">
                            <label className="flex items-center space-x-2">
                                <input
                                    type="checkbox"
                                    checked={logic.hasHeaders}
                                    onChange={(e) => logic.handleHasHeadersChange(e.target.checked)}
                                    className="rounded"
                                />
                                <span>First row contains headers</span>
                            </label>
                        </div>

                        <div className="mb-4">
                            <label className="flex items-center space-x-2">
                                <input
                                    type="checkbox"
                                    checked={logic.useCustomHeaders}
                                    onChange={(e) => logic.setUseCustomHeaders(e.target.checked)}
                                    className="rounded"
                                />
                                <span>Use custom column names</span>
                            </label>
                        </div>

                        {logic.parsedData && (
                            <div>
                                <h3 className="font-medium mb-3">
                  Detected Columns ({logic.parsedData.headers.length}):
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                    {logic.parsedData.headers.map((header, index) => (
                                        <div key={index} className="flex flex-col">
                                            <label className="text-sm text-muted-foreground mb-1">
                        Column {index + 1}
                                            </label>
                                            {logic.useCustomHeaders ? (
                                                <input
                                                    type="text"
                                                    value={logic.customHeaders[index] || ""}
                                                    onChange={(e) => logic.handleHeaderChange(index, e.target.value)}
                                                    className="px-3 py-2 border border-input rounded bg-background text-foreground focus:ring-2 focus:ring-ring focus:border-input"
                                                    placeholder={`Column ${index + 1}`}
                                                />
                                            ) : (
                                                <div className="px-3 py-2 bg-muted border border-border rounded text-muted-foreground">
                                                    {header || `Column ${index + 1}`}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {logic.parsedData && (
                        <div className="mb-6 p-4 border border-border rounded-lg bg-card">
                            <div className="flex justify-between items-center mb-4">
                                <div>
                                    <h2 className="text-xl font-semibold">4. Data Preview (Editable)</h2>
                                    <div className="flex items-center gap-4 mt-2">
                                        <span className="text-sm text-muted-foreground">
                                            {logic.selectedRows.size} of {logic.parsedData.rows.length} rows selected
                                        </span>
                                        <button
                                            onClick={logic.selectAllRows}
                                            className="text-xs px-2 py-1 bg-accent text-accent-foreground rounded hover:bg-accent/80 transition-colors"
                                        >
                      Select All
                                        </button>
                                        <button
                                            onClick={logic.deselectAllRows}
                                            className="text-xs px-2 py-1 bg-accent text-accent-foreground rounded hover:bg-accent/80 transition-colors"
                                        >
                      Deselect All
                                        </button>
                                    </div>
                                </div>
                                {logic.editedCells.size > 0 && (
                                    <div className="flex items-center gap-2">
                                        <Menu as="div" className="relative inline-block text-left">
                                            <div className="flex">
                                                <Menu.Button className="inline-flex w-full justify-center gap-x-1.5 rounded-l-md bg-muted px-3 py-1 text-sm font-medium text-foreground hover:bg-muted/80 transition-colors">
                          Reset Changes ({logic.editedCells.size})
                                                    <ChevronDown className="-mr-1 h-4 w-4" aria-hidden="true" />
                                                </Menu.Button>
                                                <button
                                                    onClick={logic.handleResetData}
                                                    className="inline-flex items-center justify-center rounded-r-md bg-muted px-2 py-1 text-sm hover:bg-muted/80 transition-colors border-l border-border"
                                                    title="Reset All Changes"
                                                >
                                                    <X className="h-4 w-4" aria-hidden="true" />
                                                </button>
                                            </div>

                                            <Transition
                                                as={Fragment}
                                                enter="transition ease-out duration-100"
                                                enterFrom="transform opacity-0 scale-95"
                                                enterTo="transform opacity-100 scale-100"
                                                leave="transition ease-in duration-75"
                                                leaveFrom="transform opacity-100 scale-100"
                                                leaveTo="transform opacity-0 scale-95"
                                            >
                                                <Menu.Items className="absolute right-0 z-10 mt-2 w-80 origin-top-right rounded-md bg-card border border-border shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                                                    <div className="p-2">
                                                        <div className="px-3 py-2 text-xs font-medium text-muted-foreground border-b border-border">
                              Changed Cells
                                                        </div>
                                                        <div className="max-h-48 overflow-y-auto">
                                                            {Array.from(logic.editedCells).map((cellKey) => {
                                                                const info = logic.getCellDisplayInfo(cellKey);
                                                                return (
                                                                    <Menu.Item key={cellKey}>
                                                                        {({ active }) => (
                                                                            <div
                                                                                className={`${active ? "bg-accent" : ""
                                                                                } flex items-center justify-between px-3 py-2 text-sm transition-colors`}
                                                                            >
                                                                                <div className="flex-1 min-w-0">
                                                                                    <div className="font-medium text-foreground">
                                            Row {info.rowNumber} - {info.columnName}
                                                                                    </div>
                                                                                    <div className="text-xs text-muted-foreground truncate">
                                                                                        <span className="text-red-500">
                                              &quot;{info.originalValue}&quot;
                                                                                        </span>
                                                                                        {" → "}
                                                                                        <span className="text-green-600">
                                              &quot;{info.currentValue}&quot;
                                                                                        </span>
                                                                                    </div>
                                                                                </div>
                                                                                <button
                                                                                    onClick={(e) => {
                                                                                        e.stopPropagation();
                                                                                        logic.handleResetCell(info.rowIndex, info.cellIndex);
                                                                                    }}
                                                                                    className="ml-2 p-1 rounded hover:bg-accent/50 transition-colors"
                                                                                    title="Reset this cell"
                                                                                >
                                                                                    <X className="h-3 w-3 text-muted-foreground hover:text-foreground" />
                                                                                </button>
                                                                            </div>
                                                                        )}
                                                                    </Menu.Item>
                                                                );
                                                            })}
                                                        </div>
                                                    </div>
                                                </Menu.Items>
                                            </Transition>
                                        </Menu>
                                    </div>
                                )}
                            </div>
                            <div className="mb-4 text-sm text-muted-foreground">
                Found {logic.parsedData.rows.length} rows and {logic.parsedData.headers.length}{" "}
                columns
                            </div>

                            <div className="overflow-x-auto rounded-lg border border-border">
                                <table className="min-w-full">
                                    <thead className="bg-muted">
                                        <tr>
                                            <th className="px-4 py-3 border-b border-muted/30 text-left text-sm font-semibold text-foreground">
                        Row #
                                            </th>
                                            {(logic.useCustomHeaders
                                                ? logic.customHeaders
                                                : logic.parsedData.headers
                                            ).map((header, index) => (
                                                <th
                                                    key={index}
                                                    className="px-4 py-3 border-b border-muted/30 text-left text-sm font-semibold text-foreground"
                                                >
                                                    {header || `Column ${index + 1}`}
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {logic.parsedData.rows.slice(0, 10).map((row, rowIndex) => (
                                            <tr
                                                key={rowIndex}
                                                className={`hover:bg-accent/30 transition-colors border-b border-muted/30 ${logic.selectedRows.has(rowIndex) ? "bg-primary/10 border-primary/20" : ""
                                                }`}
                                            >
                                                <td
                                                    className="px-4 py-3 text-sm font-medium cursor-pointer hover:bg-accent/50 transition-colors"
                                                    onClick={() => logic.toggleRowSelection(rowIndex)}
                                                    title="Click to toggle row selection"
                                                >
                                                    <div
                                                        className={`flex items-center justify-center w-6 h-6 rounded border transition-colors ${logic.selectedRows.has(rowIndex)
                                                            ? "bg-primary text-primary-foreground border-primary"
                                                            : "text-muted-foreground border-border hover:border-primary/50"
                                                        }`}
                                                    >
                                                        {rowIndex + 1}
                                                    </div>
                                                </td>
                                                {row.map((cell, cellIndex) => {
                                                    const cellKey = `${rowIndex}-${cellIndex}`;
                                                    const isEdited = logic.editedCells.has(cellKey);
                                                    return (
                                                        <td key={cellIndex} className="px-2 py-3">
                                                            <input
                                                                type="text"
                                                                value={cell}
                                                                onChange={(e) =>
                                                                    logic.handleCellChange(rowIndex, cellIndex, e.target.value)
                                                                }
                                                                className={`w-full px-2 py-1 text-sm bg-transparent border rounded focus:outline-none focus:ring-2 focus:ring-ring transition-colors ${isEdited
                                                                    ? "border-orange-500 bg-orange-50 dark:bg-orange-950/20"
                                                                    : "border-transparent hover:border-border focus:border-input"
                                                                }`}
                                                            />
                                                        </td>
                                                    );
                                                })}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            {logic.parsedData.rows.length > 10 && (
                                <p className="mt-3 text-sm text-muted-foreground">
                  Showing first 10 rows of {logic.parsedData.rows.length} total rows (editable)
                                </p>
                            )}
                        </div>
                    )}

                    <div className="flex justify-center">
                        <button
                            onClick={logic.handleSubmit}
                            className="px-8 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 focus:ring-2 focus:ring-ring focus:ring-offset-2 font-semibold transition-colors"
                        >
              Import CSV Data (Check Console)
                        </button>
                    </div>
                </>
            )}
        </div>
    );
}

