import type { RowNode } from 'ag-grid-community';

export interface IDetailService {
    /** Called by CSRM to initialize a node as master */
    setMasterForRow<TData = any>(
        rowNode: RowNode<TData>,
        data: TData,
        shouldSetExpanded: boolean,
        master?: boolean
    ): void;
}
