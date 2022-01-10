import styled from 'styled-components';
import { Button } from '@mui/material';

export const SelectableButton = styled(Button)`
    &.selected {
        background-color: rgb(144, 202, 249);
        color: #000;
    }
`;


export const TradeButton = styled(Button)`
    color: #fff;
    width: 100%;

    &.buy {
        background-color: ${params => params.theme.colors.greenText};
    }

    &.sell {
        background-color: ${params => params.theme.colors.redText};
    }
`;