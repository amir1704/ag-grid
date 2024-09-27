import { createApp, ref } from 'vue';

import { ClientSideRowModelModule, CommunityFeaturesModule } from 'ag-grid-community';
import { ModuleRegistry } from 'ag-grid-community';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-quartz.css';
import { AgGridVue } from 'ag-grid-vue3';

import MedalCellRenderer from './medalCellRendererVue.js';
import TotalValueRenderer from './totalValueRendererVue.js';

ModuleRegistry.registerModules([ClientSideRowModelModule, CommunityFeaturesModule]);

const VueExample = {
    template: `
        <div style="height: 100%">
            <ag-grid-vue
                    style="width: 100%; height: 100%;"
                    :class="themeClass"
                    id="myGrid"
                    :columnDefs="columnDefs"
                    @grid-ready="onGridReady"
                    :defaultColDef="defaultColDef"
                    :rowData="rowData">
            </ag-grid-vue>
        </div>
    `,
    components: {
        'ag-grid-vue': AgGridVue,
        medalCellRenderer: MedalCellRenderer,
        totalValueRenderer: TotalValueRenderer,
    },
    setup(props) {
        const rowData = ref(null);

        return {
            columnDefs: [
                { field: 'athlete' },
                { field: 'year', minWidth: 60 },
                {
                    field: 'gold',
                    cellRenderer: 'medalCellRenderer',
                },
                {
                    field: 'silver',
                    cellRenderer: 'medalCellRenderer',
                },
                {
                    field: 'bronze',
                    cellRenderer: 'medalCellRenderer',
                },
                {
                    field: 'total',
                    minWidth: 190,
                    editable: false,
                    valueGetter: (params) => params.data.gold + params.data.silver + params.data.bronze,
                    cellRenderer: 'totalValueRenderer',
                },
            ],
            defaultColDef: {
                editable: true,
                flex: 1,
                minWidth: 100,
                filter: true,
            },
            rowData,
            themeClass:
                /** DARK MODE START **/ document.documentElement.dataset.defaultTheme ||
                'ag-theme-quartz' /** DARK MODE END **/,
        };
    },
    methods: {
        onGridReady(params) {
            fetch('https://www.ag-grid.com/example-assets/olympic-winners.json')
                .then((resp) => resp.json())
                .then((data) => (this.rowData = data));
        },
    },
};

createApp(VueExample).mount('#app');
