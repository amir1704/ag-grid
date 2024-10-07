import type {
    AgColumn,
    AgColumnGroup,
    BeanCollection,
    CellStyleService,
    ColumnModel,
    ColumnNameService,
    ExcelExportMultipleSheetParams,
    ExcelExportParams,
    ExcelFactoryMode,
    ExcelRow,
    ExcelStyle,
    FuncColsService,
    GridSerializer,
    IExcelCreator,
    NamedBean,
    ValueService,
} from 'ag-grid-community';
import { _getHeaderClassesFromColDef, _warnOnce } from 'ag-grid-community';
import { BaseCreator, RowType, _downloadFile } from 'ag-grid-community';

import type { ExcelGridSerializingParams, StyleLinkerInterface } from './excelSerializingSession';
import { ExcelSerializingSession } from './excelSerializingSession';
import { ExcelXlsxFactory } from './excelXlsxFactory';
import { _normaliseImageExtension } from './files/ooxml/contentTypes';
import { ZipContainer } from './zipContainer/zipContainer';

const createExcelXMLCoreFolderStructure = (zipContainer: ZipContainer): void => {
    zipContainer.addFolders(['_rels/', 'docProps/', 'xl/', 'xl/theme/', 'xl/_rels/', 'xl/worksheets/']);

    const { images } = ExcelXlsxFactory;

    if (!images.size) {
        return;
    }

    zipContainer.addFolders(['xl/worksheets/_rels', 'xl/drawings/', 'xl/drawings/_rels', 'xl/media/']);

    let imgCounter = 0;

    images.forEach((value) => {
        const firstImage = value[0].image[0];
        const { base64, imageType } = firstImage;

        zipContainer.addFile(`xl/media/image${++imgCounter}.${_normaliseImageExtension(imageType)}`, base64, true);
    });
};

const createExcelXmlWorksheets = (zipContainer: ZipContainer, data: string[]): void => {
    let imageRelationCounter = 0;
    let headerFooterImageCounter = 0;
    let tableRelationCounter = 0;

    const { images, worksheetDataTables, worksheetImages, worksheetHeaderFooterImages } = ExcelXlsxFactory;

    for (let i = 0; i < data.length; i++) {
        const value = data[i];
        zipContainer.addFile(`xl/worksheets/sheet${i + 1}.xml`, value, false);

        const hasImages = images.size > 0 && worksheetImages.has(i);
        const hasTables = worksheetDataTables.size > 0 && worksheetDataTables.has(i);
        const hasHeaderFooterImages = images.size && worksheetHeaderFooterImages.has(i);

        if (!hasImages && !hasTables && !hasHeaderFooterImages) {
            continue;
        }

        let tableIndex: number | undefined;
        let drawingIndex: number | undefined;
        let vmlDrawingIndex: number | undefined;

        if (hasImages) {
            createExcelXmlDrawings(zipContainer, i, imageRelationCounter);
            drawingIndex = imageRelationCounter;
            imageRelationCounter++;
        }

        if (hasHeaderFooterImages) {
            createExcelVmlDrawings(zipContainer, i, headerFooterImageCounter);
            vmlDrawingIndex = headerFooterImageCounter;
            headerFooterImageCounter++;
        }

        if (hasTables) {
            tableIndex = tableRelationCounter++;
        }

        const worksheetRelFile = `xl/worksheets/_rels/sheet${i + 1}.xml.rels`;

        zipContainer.addFile(
            worksheetRelFile,
            ExcelXlsxFactory.createRelationships({
                tableIndex,
                drawingIndex,
                vmlDrawingIndex,
            })
        );
    }
};

const createExcelXmlDrawings = (zipContainer: ZipContainer, sheetIndex: number, drawingIndex: number): void => {
    const drawingFolder = 'xl/drawings';
    const drawingFileName = `${drawingFolder}/drawing${drawingIndex + 1}.xml`;
    const relFileName = `${drawingFolder}/_rels/drawing${drawingIndex + 1}.xml.rels`;

    zipContainer.addFile(relFileName, ExcelXlsxFactory.createDrawingRel(sheetIndex));
    zipContainer.addFile(drawingFileName, ExcelXlsxFactory.createDrawing(sheetIndex));
};

const createExcelVmlDrawings = (zipContainer: ZipContainer, sheetIndex: number, drawingIndex: number): void => {
    const drawingFolder = 'xl/drawings';
    const drawingFileName = `${drawingFolder}/vmlDrawing${drawingIndex + 1}.vml`;
    const relFileName = `${drawingFolder}/_rels/vmlDrawing${drawingIndex + 1}.vml.rels`;

    zipContainer.addFile(drawingFileName, ExcelXlsxFactory.createVmlDrawing(sheetIndex));
    zipContainer.addFile(relFileName, ExcelXlsxFactory.createVmlDrawingRel(sheetIndex));
};

const createExcelXmlTables = (zipContainer: ZipContainer): void => {
    const { worksheetDataTables } = ExcelXlsxFactory;

    const tablesDataByWorksheet = worksheetDataTables;
    const worksheetKeys = Array.from(tablesDataByWorksheet.keys());

    for (let i = 0; i < worksheetKeys.length; i++) {
        const sheetIndex = worksheetKeys[i];
        const dataTable = tablesDataByWorksheet.get(sheetIndex);

        if (!dataTable) {
            continue;
        }

        zipContainer.addFile(`xl/tables/${dataTable.name}.xml`, ExcelXlsxFactory.createTable(dataTable, i));
    }
};

const createExcelXmlCoreSheets = (
    zipContainer: ZipContainer,
    fontSize: number,
    author: string,
    sheetLen: number,
    activeTab: number
): void => {
    zipContainer.addFile('xl/workbook.xml', ExcelXlsxFactory.createWorkbook(activeTab));
    zipContainer.addFile('xl/styles.xml', ExcelXlsxFactory.createStylesheet(fontSize));
    zipContainer.addFile('xl/sharedStrings.xml', ExcelXlsxFactory.createSharedStrings());
    zipContainer.addFile('xl/theme/theme1.xml', ExcelXlsxFactory.createTheme());
    zipContainer.addFile('xl/_rels/workbook.xml.rels', ExcelXlsxFactory.createWorkbookRels(sheetLen));
    zipContainer.addFile('docProps/core.xml', ExcelXlsxFactory.createCore(author));
    zipContainer.addFile('[Content_Types].xml', ExcelXlsxFactory.createContentTypes(sheetLen));
    zipContainer.addFile('_rels/.rels', ExcelXlsxFactory.createRels());
};

const createExcelFileForExcel = (
    zipContainer: ZipContainer,
    data: string[],
    options: {
        columns?: string[];
        rowCount?: number;
        fontSize?: number;
        author?: string;
        activeTab?: number;
    } = {}
): boolean => {
    if (!data || data.length === 0) {
        _warnOnce('Invalid params supplied to createExcelFileForExcel() - `ExcelExportParams.data` is empty.');
        ExcelXlsxFactory.resetFactory();
        return false;
    }

    const { fontSize = 11, author = 'AG Grid', activeTab = 0 } = options;

    const len = data.length;
    const activeTabWithinBounds = Math.max(Math.min(activeTab, len - 1), 0);

    createExcelXMLCoreFolderStructure(zipContainer);
    createExcelXmlTables(zipContainer);
    createExcelXmlWorksheets(zipContainer, data);
    createExcelXmlCoreSheets(zipContainer, fontSize, author, len, activeTabWithinBounds);

    ExcelXlsxFactory.resetFactory();

    return true;
};

const getMultipleSheetsAsExcelCompressed = (params: ExcelExportMultipleSheetParams): Promise<Blob | undefined> => {
    const { data, fontSize, author, activeSheetIndex } = params;
    const mimeType = params.mimeType || 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
    const zipContainer = new ZipContainer();

    if (
        !createExcelFileForExcel(zipContainer, data, {
            author,
            fontSize,
            activeTab: activeSheetIndex,
        })
    ) {
        return Promise.resolve(undefined);
    }

    return zipContainer.getZipFile(mimeType);
};

export const getMultipleSheetsAsExcel = (params: ExcelExportMultipleSheetParams): Blob | undefined => {
    const { data, fontSize, author, activeSheetIndex } = params;
    const mimeType = params.mimeType || 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
    const zipContainer = new ZipContainer();

    if (
        !createExcelFileForExcel(zipContainer, data, {
            author,
            fontSize,
            activeTab: activeSheetIndex,
        })
    ) {
        return;
    }

    return zipContainer.getUncompressedZipFile(mimeType);
};

export const exportMultipleSheetsAsExcel = (params: ExcelExportMultipleSheetParams) => {
    const { fileName = 'export.xlsx' } = params;

    getMultipleSheetsAsExcelCompressed(params).then((contents) => {
        if (contents) {
            const downloadFileName = typeof fileName === 'function' ? fileName() : fileName;

            _downloadFile(downloadFileName, contents);
        }
    });
};

export class ExcelCreator
    extends BaseCreator<ExcelRow[], ExcelSerializingSession, ExcelExportParams>
    implements NamedBean, IExcelCreator
{
    beanName = 'excelCreator' as const;

    private columnModel: ColumnModel;
    private columnNameService: ColumnNameService;
    private funcColsService: FuncColsService;
    private valueService: ValueService;
    private cellStyleService?: CellStyleService;

    private gridSerializer: GridSerializer;

    public wireBeans(beans: BeanCollection) {
        this.columnModel = beans.columnModel;
        this.columnNameService = beans.columnNameService;
        this.funcColsService = beans.funcColsService;
        this.valueService = beans.valueService;
        this.cellStyleService = beans.cellStyleService;
        this.gridSerializer = beans.gridSerializer as GridSerializer;
        this.gos = beans.gos;
    }

    public postConstruct(): void {
        this.setBeans({
            gridSerializer: this.gridSerializer,
            gos: this.gos,
        });
    }

    protected getMergedParams(params?: ExcelExportParams): ExcelExportParams {
        const baseParams = this.gos.get('defaultExcelExportParams');
        return Object.assign({}, baseParams, params);
    }

    protected export(userParams?: ExcelExportParams): void {
        if (this.isExportSuppressed()) {
            _warnOnce(`Export cancelled. Export is not allowed as per your configuration.`);
            return;
        }

        const mergedParams = this.getMergedParams(userParams);
        const data = this.getData(mergedParams);

        const exportParams: ExcelExportMultipleSheetParams = {
            data: [data],
            fontSize: mergedParams.fontSize,
            author: mergedParams.author,
            mimeType: mergedParams.mimeType,
        };

        this.packageCompressedFile(exportParams).then((packageFile) => {
            if (packageFile) {
                const { fileName } = mergedParams;
                const providedFileName =
                    typeof fileName === 'function' ? fileName(this.gos.getGridCommonParams()) : fileName;

                _downloadFile(this.getFileName(providedFileName), packageFile);
            }
        });
    }

    public exportDataAsExcel(params?: ExcelExportParams): void {
        this.export(params);
    }

    public getDataAsExcel(params?: ExcelExportParams): Blob | string | undefined {
        const mergedParams = this.getMergedParams(params);
        const data = this.getData(mergedParams);

        const exportParams: ExcelExportMultipleSheetParams = {
            data: [data],
            fontSize: mergedParams.fontSize,
            author: mergedParams.author,
            mimeType: mergedParams.mimeType,
        };

        return this.packageFile(exportParams);
    }

    public setFactoryMode(factoryMode: ExcelFactoryMode): void {
        ExcelXlsxFactory.factoryMode = factoryMode;
    }

    public getFactoryMode(): ExcelFactoryMode {
        return ExcelXlsxFactory.factoryMode;
    }

    public getSheetDataForExcel(params: ExcelExportParams): string {
        const mergedParams = this.getMergedParams(params);
        return this.getData(mergedParams);
    }

    public getMultipleSheetsAsExcel(params: ExcelExportMultipleSheetParams): Blob | undefined {
        return getMultipleSheetsAsExcel(params);
    }

    public exportMultipleSheetsAsExcel(params: ExcelExportMultipleSheetParams): void {
        exportMultipleSheetsAsExcel(params);
    }

    public getDefaultFileExtension(): 'xlsx' {
        return 'xlsx';
    }

    public createSerializingSession(params: ExcelExportParams): ExcelSerializingSession {
        const { columnModel, columnNameService, funcColsService, valueService, gos } = this;

        const config: ExcelGridSerializingParams = {
            ...params,
            columnModel,
            columnNameService,
            funcColsService,
            valueService,
            gos,
            suppressRowOutline: params.suppressRowOutline || params.skipRowGroups,
            headerRowHeight: params.headerRowHeight || params.rowHeight,
            baseExcelStyles: this.gos.get('excelStyles') || [],
            rightToLeft: params.rightToLeft ?? this.gos.get('enableRtl'),
            styleLinker: this.styleLinker.bind(this),
        };

        return new ExcelSerializingSession(config);
    }

    private styleLinker(params: StyleLinkerInterface): string[] {
        const { rowType, rowIndex, value, column, columnGroup, node } = params;
        const isHeader = rowType === RowType.HEADER;
        const isGroupHeader = rowType === RowType.HEADER_GROUPING;
        const col = (isHeader ? column : columnGroup) as AgColumn | AgColumnGroup | null;
        let headerClasses: string[] = [];

        if (isHeader || isGroupHeader) {
            headerClasses.push('header');
            if (isGroupHeader) {
                headerClasses.push('headerGroup');
            }

            if (col) {
                headerClasses = headerClasses.concat(
                    _getHeaderClassesFromColDef(
                        col.getDefinition(),
                        this.gos,
                        (column as AgColumn) || null,
                        (columnGroup as AgColumnGroup) || null
                    )
                );
            }

            return headerClasses;
        }

        const styles = this.gos.get('excelStyles');

        const applicableStyles: string[] = ['cell'];

        if (!styles || !styles.length) {
            return applicableStyles;
        }

        const styleIds: string[] = styles.map((it: ExcelStyle) => {
            return it.id;
        });

        const colDef = (column as AgColumn).getDefinition();
        this.cellStyleService?.processAllCellClasses(
            colDef,
            this.gos.addGridCommonParams({
                value,
                data: node!.data,
                node: node!,
                colDef,
                column: column!,
                rowIndex: rowIndex,
            }),
            (className: string) => {
                if (styleIds.indexOf(className) > -1) {
                    applicableStyles.push(className);
                }
            }
        );

        return applicableStyles.sort((left: string, right: string): number => {
            return styleIds.indexOf(left) < styleIds.indexOf(right) ? -1 : 1;
        });
    }

    public isExportSuppressed(): boolean {
        return this.gos.get('suppressExcelExport');
    }

    private packageCompressedFile(params: ExcelExportMultipleSheetParams): Promise<Blob | undefined> {
        return getMultipleSheetsAsExcelCompressed(params);
    }

    private packageFile(params: ExcelExportMultipleSheetParams): Blob | undefined {
        return getMultipleSheetsAsExcel(params);
    }
}
