import type { RowSnapshot } from '../row-snapshot-test-utils';

export function simpleHierarchyRowSnapshot(): RowSnapshot[] {
    return [
        {
            allChildrenCount: 1,
            allLeafChildren: ['B'],
            childIndex: 0,
            childrenAfterFilter: ['B'],
            childrenAfterGroup: ['B'],
            childrenAfterSort: ['B'],
            detail: undefined,
            displayed: true,
            expanded: true,
            firstChild: true,
            footer: undefined,
            group: true,
            groupData: { 'ag-Grid-AutoColumn': 'A' },
            id: '0',
            key: 'A',
            lastChild: false,
            leafGroup: undefined,
            level: 1,
            master: false,
            parentKey: null,
            rowGroupIndex: undefined,
            rowPinned: undefined,
            selectable: true,
            siblingKey: undefined,
            uiLevel: 0,
            rowIndex: 0,
        },
        {
            allChildrenCount: null,
            allLeafChildren: [],
            childIndex: 0,
            childrenAfterFilter: [],
            childrenAfterGroup: [],
            childrenAfterSort: [],
            detail: undefined,
            displayed: true,
            expanded: true,
            firstChild: true,
            footer: undefined,
            group: false,
            groupData: { 'ag-Grid-AutoColumn': 'B' },
            id: '1',
            key: 'B',
            lastChild: true,
            leafGroup: undefined,
            level: 2,
            master: false,
            parentKey: 'A',
            rowGroupIndex: undefined,
            rowPinned: undefined,
            selectable: true,
            siblingKey: undefined,
            uiLevel: 1,
            rowIndex: 1,
        },
        {
            allChildrenCount: 1,
            allLeafChildren: ['D'],
            childIndex: 1,
            childrenAfterFilter: ['D'],
            childrenAfterGroup: ['D'],
            childrenAfterSort: ['D'],
            detail: undefined,
            displayed: true,
            expanded: true,
            firstChild: false,
            footer: undefined,
            group: true,
            groupData: { 'ag-Grid-AutoColumn': 'C' },
            id: 'row-group-0-C',
            key: 'C',
            lastChild: false,
            leafGroup: false,
            level: 0,
            master: undefined,
            parentKey: null,
            rowGroupIndex: null,
            rowPinned: undefined,
            selectable: true,
            siblingKey: undefined,
            uiLevel: 0,
            rowIndex: 2,
        },
        {
            allChildrenCount: null,
            allLeafChildren: [],
            childIndex: 0,
            childrenAfterFilter: [],
            childrenAfterGroup: [],
            childrenAfterSort: [],
            detail: undefined,
            displayed: true,
            expanded: true,
            firstChild: true,
            footer: undefined,
            group: false,
            groupData: { 'ag-Grid-AutoColumn': 'D' },
            id: '2',
            key: 'D',
            lastChild: true,
            leafGroup: undefined,
            level: 2,
            master: false,
            parentKey: 'C',
            rowGroupIndex: undefined,
            rowPinned: undefined,
            selectable: true,
            siblingKey: undefined,
            uiLevel: 1,
            rowIndex: 3,
        },
        {
            allChildrenCount: 3,
            allLeafChildren: ['H'],
            childIndex: 2,
            childrenAfterFilter: ['F'],
            childrenAfterGroup: ['F'],
            childrenAfterSort: ['F'],
            detail: undefined,
            displayed: true,
            expanded: true,
            firstChild: false,
            footer: undefined,
            group: true,
            groupData: { 'ag-Grid-AutoColumn': 'E' },
            id: 'row-group-0-E',
            key: 'E',
            lastChild: true,
            leafGroup: false,
            level: 0,
            master: undefined,
            parentKey: null,
            rowGroupIndex: null,
            rowPinned: undefined,
            selectable: true,
            siblingKey: undefined,
            uiLevel: 0,
            rowIndex: 4,
        },
        {
            allChildrenCount: 2,
            allLeafChildren: ['H'],
            childIndex: 0,
            childrenAfterFilter: ['G'],
            childrenAfterGroup: ['G'],
            childrenAfterSort: ['G'],
            detail: undefined,
            displayed: true,
            expanded: true,
            firstChild: true,
            footer: undefined,
            group: true,
            groupData: { 'ag-Grid-AutoColumn': 'F' },
            id: 'row-group-0-E-1-F',
            key: 'F',
            lastChild: true,
            leafGroup: false,
            level: 1,
            master: undefined,
            parentKey: 'E',
            rowGroupIndex: null,
            rowPinned: undefined,
            selectable: true,
            siblingKey: undefined,
            uiLevel: 1,
            rowIndex: 5,
        },
        {
            allChildrenCount: 1,
            allLeafChildren: ['H'],
            childIndex: 0,
            childrenAfterFilter: ['H'],
            childrenAfterGroup: ['H'],
            childrenAfterSort: ['H'],
            detail: undefined,
            displayed: true,
            expanded: true,
            firstChild: true,
            footer: undefined,
            group: true,
            groupData: { 'ag-Grid-AutoColumn': 'G' },
            id: 'row-group-0-E-1-F-2-G',
            key: 'G',
            lastChild: true,
            leafGroup: false,
            level: 2,
            master: undefined,
            parentKey: 'F',
            rowGroupIndex: null,
            rowPinned: undefined,
            selectable: true,
            siblingKey: undefined,
            uiLevel: 2,
            rowIndex: 6,
        },
        {
            allChildrenCount: null,
            allLeafChildren: [],
            childIndex: 0,
            childrenAfterFilter: [],
            childrenAfterGroup: [],
            childrenAfterSort: [],
            detail: undefined,
            displayed: true,
            expanded: true,
            firstChild: true,
            footer: undefined,
            group: false,
            groupData: { 'ag-Grid-AutoColumn': 'H' },
            id: '3',
            key: 'H',
            lastChild: true,
            leafGroup: undefined,
            level: 4,
            master: false,
            parentKey: 'G',
            rowGroupIndex: undefined,
            rowPinned: undefined,
            selectable: true,
            siblingKey: undefined,
            uiLevel: 3,
            rowIndex: 7,
        },
    ];
}
