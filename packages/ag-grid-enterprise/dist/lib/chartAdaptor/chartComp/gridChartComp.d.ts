// ag-grid-enterprise v21.0.0
import { CellRange, ChartType, Component } from "ag-grid-community";
export interface GridChartParams {
    cellRange: CellRange;
    chartType: ChartType;
    insideDialog: boolean;
    suppressChartRanges: boolean;
    aggregate: boolean;
    height: number;
    width: number;
}
export declare class GridChartComp extends Component {
    private static TEMPLATE;
    private resizeObserverService;
    private gridOptionsWrapper;
    private environment;
    private eChart;
    private chartMenu;
    private chartDialog;
    private model;
    private chartController;
    private currentChartType;
    private chartProxy;
    private readonly params;
    constructor(params: GridChartParams);
    init(): void;
    private createChart;
    private getSelectedPalette;
    private createChartProxy;
    private addDialog;
    private addMenu;
    private refresh;
    getCurrentChartType(): ChartType;
    updateChart(): void;
    private downloadChart;
    private addResizeListener;
    private setActiveChartCellRange;
    destroy(): void;
}
