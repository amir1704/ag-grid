import type { ColumnModel } from '../../columns/columnModel';
import type { UserCompDetails, UserComponentFactory } from '../../components/framework/userComponentFactory';
import type { NamedBean } from '../../context/bean';
import { BeanStub } from '../../context/beanStub';
import type { BeanCollection } from '../../context/context';
import type { GridOptions } from '../../entities/gridOptions';
import type { WithoutGridCommon } from '../../interfaces/iCommon';
import type { IRowModel } from '../../interfaces/iRowModel';
import { _warnOnce } from '../../utils/function';
import type { ILoadingOverlayParams } from './loadingOverlayComponent';
import type { INoRowsOverlayParams } from './noRowsOverlayComponent';
import type { OverlayWrapperComponent } from './overlayWrapperComponent';

export class OverlayService extends BeanStub implements NamedBean {
    beanName = 'overlayService' as const;

    private userComponentFactory: UserComponentFactory;
    private rowModel: IRowModel;
    private columnModel: ColumnModel;

    public wireBeans(beans: BeanCollection): void {
        this.userComponentFactory = beans.userComponentFactory;
        this.rowModel = beans.rowModel;
        this.columnModel = beans.columnModel;
    }

    private overlayWrapperComp: OverlayWrapperComponent;
    private manuallyDisplayed: boolean = false;

    public postConstruct(): void {
        this.addManagedEventListeners({
            rowDataUpdated: () => this.onRowDataUpdated(),
            newColumnsLoaded: () => this.onNewColumnsLoaded(),
        });
        this.addManagedPropertyListener('loading', () => this.onLoadingChanged());
    }

    public registerOverlayWrapperComp(overlayWrapperComp: OverlayWrapperComponent): void {
        this.overlayWrapperComp = overlayWrapperComp;
        this.onLoadingChanged();
    }

    public showLoadingOverlay(): void {
        if (this.gos.get('suppressLoadingOverlay')) {
            return;
        }
        const loading = this.gos.get('loading');
        if (loading !== undefined && !loading) {
            _warnOnce('AG Grid: showLoadingOverlay has no effect when loading=false');
            return;
        }

        const params: WithoutGridCommon<ILoadingOverlayParams> = {};

        const compDetails = this.userComponentFactory.getLoadingOverlayCompDetails(params);
        this.showOverlay(compDetails, 'ag-overlay-loading-wrapper', 'loadingOverlayComponentParams');
    }

    public showNoRowsOverlay(): void {
        if (this.gos.get('suppressNoRowsOverlay')) {
            return;
        }
        if (this.gos.get('loading')) {
            return; // loading property is true, we cannot show the no-rows overlay
        }

        const params: WithoutGridCommon<INoRowsOverlayParams> = {};

        const compDetails = this.userComponentFactory.getNoRowsOverlayCompDetails(params);
        this.showOverlay(compDetails, 'ag-overlay-no-rows-wrapper', 'noRowsOverlayComponentParams');
    }

    private showOverlay(compDetails: UserCompDetails, wrapperCssClass: string, gridOption: keyof GridOptions): void {
        const promise = compDetails.newAgStackInstance();
        const listenerDestroyFunc = this.addManagedPropertyListener(gridOption, ({ currentValue }) => {
            promise.then((comp) => {
                if (comp!.refresh) {
                    comp.refresh(
                        this.gos.addGridCommonParams({
                            ...(currentValue ?? {}),
                        })
                    );
                }
            });
        });

        this.manuallyDisplayed = this.columnModel.isReady() && !this.rowModel.isEmpty();
        this.overlayWrapperComp.showOverlay(promise, wrapperCssClass, listenerDestroyFunc);
    }

    public hideOverlay(): void {
        if (this.gos.get('loading')) {
            return; // loading property is true, we cannot hide the overlay
        }
        this.manuallyDisplayed = false;
        this.overlayWrapperComp.hideOverlay();
    }

    private showOrHideOverlay(): void {
        const isEmpty = this.rowModel.isEmpty();
        const isSuppressNoRowsOverlay = this.gos.get('suppressNoRowsOverlay');
        if (isEmpty && !isSuppressNoRowsOverlay) {
            this.showNoRowsOverlay();
        } else {
            this.hideOverlay();
        }
    }

    private onLoadingChanged(): void {
        const loading = this.gos.get('loading');
        if (loading === undefined) {
            if (!this.gos.get('columnDefs') || (this.gos.isRowModelType('clientSide') && !this.gos.get('rowData'))) {
                if (this.gos.get('suppressLoadingOverlay')) {
                    this.hideOverlay();
                } else {
                    this.showLoadingOverlay();
                }
            } else {
                this.showOrHideOverlay();
            }
        } else if (loading) {
            if (this.gos.get('suppressLoadingOverlay')) {
                _warnOnce('AG Grid: setting loading to true has no effect when suppressLoadingOverlay is true');
            }
            this.showLoadingOverlay();
        } else {
            this.showOrHideOverlay();
        }
    }

    private onRowDataUpdated(): void {
        this.showOrHideOverlay();
    }

    private onNewColumnsLoaded(): void {
        // hide overlay if columns and rows exist, this can happen if columns are loaded after data.
        // this problem exists before of the race condition between the services (column controller in this case)
        // and the view (grid panel). if the model beans were all initialised first, and then the view beans second,
        // this race condition would not happen.
        if (this.columnModel.isReady() && !this.rowModel.isEmpty() && !this.manuallyDisplayed) {
            this.hideOverlay();
        }
    }
}
