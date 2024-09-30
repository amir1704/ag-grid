import { ColumnMoveModule, DragAndDropModule, ModuleNames, PopupModule } from 'ag-grid-community';

import { EnterpriseCoreModule } from '../agGridEnterpriseModule';
import { defineEnterpriseModule } from '../moduleUtils';
import { RowGroupingModule } from '../rowGrouping/rowGroupingModule';
import { SideBarModule } from '../sideBar/sideBarModule';
import { AgMenuItemRenderer } from '../widgets/agMenuItemRenderer';
import { ColumnToolPanel } from './columnToolPanel';
import { ColumnToolPanelFactory } from './columnToolPanelFactory';
import { ModelItemUtils } from './modelItemUtils';

export const ColumnsToolPanelCoreModule = defineEnterpriseModule('ColumnsToolPanelCoreModule', {
    beans: [ModelItemUtils],
    userComponents: [
        { name: 'agColumnsToolPanel', classImp: ColumnToolPanel },
        {
            name: 'agMenuItem',
            classImp: AgMenuItemRenderer,
        },
    ],
    dependsOn: [EnterpriseCoreModule, SideBarModule, ColumnMoveModule, DragAndDropModule, PopupModule],
});

export const ColumnsToolPanelRowGroupingModule = defineEnterpriseModule('ColumnsToolPanelRowGroupingModule', {
    beans: [ColumnToolPanelFactory],
    dependsOn: [ColumnsToolPanelCoreModule, RowGroupingModule],
});

export const ColumnsToolPanelModule = defineEnterpriseModule(ModuleNames.ColumnsToolPanelModule, {
    dependsOn: [ColumnsToolPanelCoreModule, ColumnsToolPanelRowGroupingModule],
});
