import type { ClientSideRowModelStep } from '../../interfaces/iClientSideRowModel';
import type { Column } from '../../interfaces/iColumn';
import type { ModuleName } from '../../interfaces/iModule';
import { getErrorLink } from '../logging';

const missingModule = ({
    reason,
    moduleName,
    gridScoped,
    gridId,
    isEnterprise,
}: {
    reason: string;
    moduleName: ModuleName;
    gridScoped: boolean;
    gridId: string;
    isEnterprise?: boolean;
}) =>
    `Unable to use ${reason} as ${moduleName} is not registered${gridScoped ? ' for gridId: ' + gridId : ''}. Check if you have registered the module:
import { ModuleRegistry } from 'ag-grid-community';
import { ${moduleName} } from '${isEnterprise ? 'ag-grid-enterprise' : 'ag-grid-community'}';

ModuleRegistry.registerModules([ ${moduleName} ]);

For more info see: https://www.ag-grid.com/javascript-grid/modules/`;

/**
 * NOTES on setting console messages:
 * 1. The message is a function that returns either a string or an array of any type.
 * 2. Returning an array enables the console to log actual objects / numbers / booleans nicely as this will be spread to the underlying console call instead of being cast to a string.
 * 3. Each entry should be followed by as const so that the IDE hover shows the actual message to aid devs
 * 4. The number should add an ErrorType to errorCodeTypes.ts and this type must be used from the call location.
 *    This enables easy finding references of errors and also makes it clearer what the error is when reading the code.
 *    However, as it is just a type it does not add any bundle size.
 */
export const AG_GRID_ERRORS = {
    1: () => '`rowData` must be an array' as const,
    2: ({ nodeId }: { nodeId: string | undefined }) =>
        `Duplicate node id '${nodeId}' detected from getRowId callback, this could cause issues in your grid.` as const,
    3: () => 'Calling gridApi.resetRowHeights() makes no sense when using Auto Row Height.' as const,
    4: ({ id }: { id: string }) => `Could not find row id=${id}, data item was not found for this id` as const,
    5: ({ data }: { data: any }) =>
        [
            `Could not find data item as object was not found.`,
            data,
            ' Consider using getRowId to help the Grid find matching row data',
        ] as const,
    6: () => `'groupHideOpenParents' only works when specifying specific columns for 'colDef.showRowGroup'` as const,
    7: () => 'Pivoting is not supported with aligned grids as it may produce different columns in each grid.' as const,
    8: ({ key }: { key: string }) => `Unknown key for navigation ${key}` as const,
    9: ({ variable }: { variable: { cssName: string; defaultValue: number } }) =>
        `No value for ${variable.cssName}. This usually means that the grid has been initialised before styles have been loaded. The default value of ${variable.defaultValue} will be used and updated when styles load.` as const,
    10: ({ step, stepsMapped }: { step: ClientSideRowModelStep | undefined; stepsMapped: string[] }) =>
        `Invalid step ${step}, available steps are ${Object.keys(stepsMapped).join(', ')}` as const,
    11: () => 'No gridOptions provided to createGrid' as const,
    12: ({ colKey }: { colKey: string | Column }) => ['column ', colKey, ' not found'] as const,
    13: () =>
        'Could not find rowIndex, this means tasks are being executed on a rowNode that has been removed from the grid.' as const,
    14: ({ groupPrefix }: { groupPrefix: string }) =>
        `Row IDs cannot start with ${groupPrefix}, this is a reserved prefix for AG Grid's row grouping feature.` as const,
    15: ({ expression }: { expression: any }) => ['value should be either a string or a function', expression] as const,
    16: ({ expression, params, e }: { expression: string; params: any; e: any }) =>
        [
            'Processing of the expression failed',
            'Expression = ',
            expression,
            'Params = ',
            params,
            'Exception = ',
            e,
        ] as const,

    200: missingModule,
    201: ({ rowModelType }: { rowModelType: string }) => `Could not find row model for rowModelType = ${rowModelType}`,
} as const;

export type ErrorMap = typeof AG_GRID_ERRORS;
export type ErrorId = keyof ErrorMap;

type ErrorValue<TId extends ErrorId | null> = TId extends ErrorId ? ErrorMap[TId] : never;
export type GetErrorParams<TId extends ErrorId | null> =
    ErrorValue<TId> extends (params: infer P) => any ? P : Record<string, never>;

export function getError<TId extends ErrorId, TParams extends GetErrorParams<TId>>(errorId: TId, args: TParams): any[] {
    const msgOrFunc: ErrorMap[TId] = AG_GRID_ERRORS[errorId];

    if (!msgOrFunc) {
        return [`Missing error text for error id ${errorId}!`];
    }

    const errorBody = msgOrFunc(args as any);
    const errorLink = getErrorLink(errorId, args);
    const errorSuffix = `\nSee ${errorLink}`;
    return Array.isArray(errorBody) ? (errorBody.concat(errorSuffix) as string[]) : [errorBody, errorSuffix];
}
