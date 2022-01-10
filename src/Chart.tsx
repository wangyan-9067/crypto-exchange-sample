import React, { FC, useEffect } from "react";
import styled from 'styled-components';
import { createChart, IChartApi, ISeriesApi, LogicalRange, BarData } from 'lightweight-charts';
import { useCrypto, throttle } from "./CryptoContext";

let chart: IChartApi;
let candlestickSeries: ISeriesApi<"Candlestick">;

const ChartContainer = styled.div`
    width: 100%;
    height: 500px;
    ${props => props.theme.breakpoints.down('md')} {
        height: 400px;
    };
`;



export const Chart: FC = () => {
    const { candlesticks, newStick, getPage, instrument, interval, reset } = useCrypto();
    useEffect(() => {
        chart = createChart('chartContainer', {
            timeScale: {
                timeVisible: true
            }
        });
        candlestickSeries = chart.addCandlestickSeries();

        const resizeHandler = () => {
            const container = document.getElementById('chartContainer');

            if (container) {
                chart.applyOptions({
                    width: container.offsetWidth,
                    height: container.offsetHeight
                });
            }
        };

        window.addEventListener('resize', resizeHandler);
        return () => {
            window.removeEventListener('resize', resizeHandler);
        }
    }, []);

    useEffect(() => {
        if (!chart) {
            return;
        }

        const onVisibleLogicalRangeChanged = (newVisibleLogicalRange: LogicalRange | null) => {
            if (newVisibleLogicalRange) {
                const barsInfo = candlestickSeries.barsInLogicalRange(newVisibleLogicalRange);

                if (barsInfo && barsInfo.barsBefore < 5) {
                    throttle(() => getPage())();
                }
            }
        };

        chart.timeScale().subscribeVisibleLogicalRangeChange(onVisibleLogicalRangeChanged);

        return () => {
            chart.timeScale().unsubscribeVisibleLogicalRangeChange(onVisibleLogicalRangeChanged);
        }
    }, [chart, getPage]);

    useEffect(() => {
        if (!candlesticks) {
            return;
        }

        let sticks: BarData[] = Object.values(candlesticks).sort((a: BarData, b: BarData) => {
            return a.time < b.time ? -1 : 1;
        });

        candlestickSeries.setData(sticks);
        return;

    }, [candlesticks]);

    useEffect(() => {
        if (!newStick) {
            return;
        }

        candlestickSeries.update(newStick);
    }, [newStick]);



    return (
        <ChartContainer id="chartContainer" />
    )
};