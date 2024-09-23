import type { AgBubbleSeriesOptions, AgCartesianAxisOptions, AgScatterSeriesOptions } from 'ag-charts-community';

import { ChartDataModel } from '../../model/chartDataModel';
import type { ChartProxyParams, FieldDefinition, UpdateParams } from '../chartProxy';
import { CartesianChartProxy } from './cartesianChartProxy';

interface SeriesDefinition {
    xField: FieldDefinition;
    yField: FieldDefinition;
    sizeField?: FieldDefinition;
}

export class ScatterChartProxy extends CartesianChartProxy<'scatter' | 'bubble'> {
    public constructor(params: ChartProxyParams) {
        super(params);
    }

    protected override getAxes(_params: UpdateParams): AgCartesianAxisOptions[] {
        return [
            {
                type: 'number',
                position: 'bottom',
            },
            {
                type: 'number',
                position: 'left',
            },
        ];
    }

    protected override getSeries(params: UpdateParams): (AgScatterSeriesOptions | AgBubbleSeriesOptions)[] {
        const [category] = params.categories;
        const paired = this.isPaired();
        const seriesDefinitions = this.getSeriesDefinitions(params.fields, paired);
        const labelFieldDefinition = category.id === ChartDataModel.DEFAULT_CATEGORY ? undefined : category;

        const series = seriesDefinitions.map((seriesDefinition) => {
            const sharedOptions = {
                xKey: seriesDefinition!.xField.colId,
                xName: seriesDefinition!.xField.displayName ?? undefined,
                yKey: seriesDefinition!.yField.colId,
                yName: seriesDefinition!.yField.displayName ?? undefined,
                title: `${seriesDefinition!.yField.displayName} vs ${seriesDefinition!.xField.displayName}`,
                labelKey: labelFieldDefinition?.id ?? seriesDefinition!.yField.colId,
                labelName: labelFieldDefinition?.name,
            };

            if (seriesDefinition?.sizeField) {
                const opts: AgBubbleSeriesOptions = {
                    type: 'bubble',
                    sizeKey: seriesDefinition!.sizeField.colId,
                    sizeName: seriesDefinition!.sizeField.displayName ?? '',
                    ...sharedOptions,
                };
                return opts;
            }

            const opts: AgScatterSeriesOptions = {
                type: 'scatter',
                ...sharedOptions,
            };
            return opts;
        });

        return this.crossFiltering ? this.extractCrossFilterSeries(series, params) : series;
    }

    private extractCrossFilterSeries(
        series: (AgScatterSeriesOptions | AgBubbleSeriesOptions)[],
        params: UpdateParams
    ): (AgScatterSeriesOptions | AgBubbleSeriesOptions)[] {
        const { data } = params;
        const palette = this.getChartPalette();

        const filteredOutKey = (key: string) => `${key}Filter`;

        const calcMarkerDomain = (data: any, sizeKey?: string) => {
            const markerDomain: [number, number] = [Infinity, -Infinity];
            if (sizeKey != null) {
                for (const datum of data) {
                    const value = datum[sizeKey] ?? datum[filteredOutKey(sizeKey)];
                    if (value < markerDomain[0]) {
                        markerDomain[0] = value;
                    }
                    if (value > markerDomain[1]) {
                        markerDomain[1] = value;
                    }
                }
            }
            if (markerDomain[0] <= markerDomain[1]) {
                return markerDomain;
            }
            return undefined;
        };

        const updatePrimarySeries = <T extends AgScatterSeriesOptions | AgBubbleSeriesOptions>(
            series: T,
            idx: number
        ): T => {
            const fill = palette?.fills?.[idx];
            const stroke = palette?.strokes?.[idx];

            let markerDomain: [number, number] | undefined = undefined;
            if (series.type === 'bubble') {
                const { sizeKey } = series;
                markerDomain = calcMarkerDomain(data, sizeKey);
            }

            return {
                ...series,
                fill,
                stroke,
                domain: markerDomain,
                xKey: filteredOutKey(series.xKey),
                yKey: filteredOutKey(series.yKey),
                highlightStyle: { item: { fill: 'yellow' } },
                // listeners: {
                //     ...series.listeners,
                //     nodeClick: this.crossFilterCallback,
                // },
            };
        };

        const updatedSeries = series.map(updatePrimarySeries);
        return [...updatedSeries];
    }

    private getSeriesDefinitions(fields: FieldDefinition[], paired: boolean): (SeriesDefinition | null)[] {
        if (fields.length < 2) {
            return [];
        }

        const isBubbleChart = this.chartType === 'bubble';

        if (paired) {
            if (isBubbleChart) {
                return fields
                    .map((currentXField, i) =>
                        i % 3 === 0
                            ? {
                                  xField: currentXField,
                                  yField: fields[i + 1],
                                  sizeField: fields[i + 2],
                              }
                            : null
                    )
                    .filter((x) => x && x.yField && x.sizeField);
            }
            return fields
                .map((currentXField, i) =>
                    i % 2 === 0
                        ? {
                              xField: currentXField,
                              yField: fields[i + 1],
                          }
                        : null
                )
                .filter((x) => x && x.yField);
        }

        const xField = fields[0];

        if (isBubbleChart) {
            return fields
                .map((yField, i) =>
                    i % 2 === 1
                        ? {
                              xField,
                              yField,
                              sizeField: fields[i + 1],
                          }
                        : null
                )
                .filter((x) => x && x.sizeField);
        }

        return fields.filter((value, i) => i > 0).map((yField) => ({ xField, yField }));
    }
}
