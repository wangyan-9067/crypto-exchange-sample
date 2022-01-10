import React, { FC } from "react";
import Grid from '@mui/material/Grid';
import { Chart } from './Chart';
import { OrderBook } from './OrderBook';
import { TradeForm } from './TradeForm';
import { Position } from './Position';
import { Ticker } from './Ticker';

export const App: FC = () => {
    return (
        <Grid container spacing={2}>
            <Grid item xs={12}><Ticker /></Grid>
            <Grid item xs={12} md={6}><Chart /></Grid>
            <Grid item xs={12} md={3}><OrderBook /></Grid>
            <Grid item xs={12} md={3}><TradeForm /></Grid>
            <Grid item xs={12}><Position /></Grid>
        </Grid>
    )
};