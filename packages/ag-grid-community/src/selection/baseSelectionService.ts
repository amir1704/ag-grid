import { BeanStub } from '../context/beanStub';
import type { BeanCollection } from '../context/context';
import type { AgColumn } from '../entities/agColumn';
import type { IsRowSelectable } from '../entities/gridOptions';
import type { SelectionEventSourceType } from '../events';
import { _getIsRowSelectable } from '../gridOptionsUtils';
import type { IRowModel } from '../interfaces/iRowModel';
import type { ISetNodesSelectedParams } from '../interfaces/iSelectionService';
import type { ChangedPath } from '../utils/changedPath';
import { CheckboxSelectionComponent } from './checkboxSelectionComponent';
import { SelectAllFeature } from './selectAllFeature';

export abstract class BaseSelectionService extends BeanStub {
    protected rowModel: IRowModel;

    protected isRowSelectable?: IsRowSelectable;

    public wireBeans(beans: BeanCollection) {
        this.rowModel = beans.rowModel;
    }

    public postConstruct(): void {
        this.addManagedPropertyListeners(['isRowSelectable', 'rowSelection'], () => {
            const callback = _getIsRowSelectable(this.gos);
            if (callback !== this.isRowSelectable) {
                this.isRowSelectable = callback;
                this.updateSelectable(false);
            }
        });

        this.isRowSelectable = _getIsRowSelectable(this.gos);
    }

    public createCheckboxSelectionComponent(): CheckboxSelectionComponent {
        return new CheckboxSelectionComponent();
    }

    public createSelectAllFeature(column: AgColumn): SelectAllFeature {
        return new SelectAllFeature(column);
    }

    protected dispatchSelectionChanged(source: SelectionEventSourceType): void {
        this.eventService.dispatchEvent({
            type: 'selectionChanged',
            source,
        });
    }

    // should only be called if groupSelectsChildren=true
    public updateGroupsFromChildrenSelections?(source: SelectionEventSourceType, changedPath?: ChangedPath): boolean;

    public abstract setNodesSelected(params: ISetNodesSelectedParams): number;

    public abstract updateSelectable(skipLeafNodes: boolean): void;
}
