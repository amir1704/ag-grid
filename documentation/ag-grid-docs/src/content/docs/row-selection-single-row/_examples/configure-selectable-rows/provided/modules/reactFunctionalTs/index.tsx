import React, { StrictMode, useMemo, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';

import { ClientSideRowModelModule } from 'ag-grid-community';
import { ModuleRegistry } from 'ag-grid-community';
import type { ColDef, RowSelectionOptions } from 'ag-grid-community';
import { AgGridReact } from 'ag-grid-react';

import './styles.css';

ModuleRegistry.registerModules([ClientSideRowModelModule]);

const GridExample = () => {
    const grid = useRef<AgGridReact>(null);
    const defaultColDef = useMemo(
        () => ({
            flex: 1,
            minWidth: 100,
        }),
        []
    );

    const columnDefs = useMemo<ColDef[]>(
        () => [{ field: 'athlete' }, { field: 'sport' }, { field: 'year', maxWidth: 120 }],
        []
    );

    const rowSelection = useMemo<RowSelectionOptions>(
        () => ({
            mode: 'singleRow',
            hideDisabledCheckboxes: true,
            isRowSelectable: (node) => (node.data ? node.data.year <= 2007 : false),
        }),
        []
    );
    const [rowData, setRowData] = useState();

    const onGridReady = () => {
        fetch('https://www.ag-grid.com/example-assets/olympic-winners.json')
            .then((resp) => resp.json())
            .then((data) => setRowData(data));
    };

    function toggleHideCheckbox() {
        grid.current?.api.setGridOption('rowSelection', {
            mode: 'singleRow',
            isRowSelectable: (node) => (node.data ? node.data.year <= 2007 : false),
            hideDisabledCheckboxes: getCheckboxValue('#toggle-hide-checkbox'),
        });
    }

    return (
        <div className="example-wrapper">
            <div className="example-header">
                <label>
                    <span>Hide disabled checkboxes:</span>
                    <input id="toggle-hide-checkbox" type="checkbox" defaultChecked onChange={toggleHideCheckbox} />
                </label>
            </div>
            <div
                id="myGrid"
                className={
                    'grid ' +
                    /** DARK MODE START **/ (document.documentElement.dataset.defaultTheme ||
                        'ag-theme-quartz') /** DARK MODE END **/
                }
            >
                <AgGridReact
                    ref={grid}
                    rowData={rowData}
                    defaultColDef={defaultColDef}
                    columnDefs={columnDefs}
                    rowSelection={rowSelection}
                    onGridReady={onGridReady}
                />
            </div>
        </div>
    );
};

const root = createRoot(document.getElementById('root')!);
root.render(
    <StrictMode>
        <GridExample />
    </StrictMode>
);

function getCheckboxValue(id: string): boolean {
    return document.querySelector<HTMLInputElement>(id)?.checked ?? false;
}
