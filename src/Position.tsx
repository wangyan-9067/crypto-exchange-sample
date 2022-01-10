import React, { FC } from "react";
import styled from 'styled-components';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import { SectionTitle } from './styled/Common';
import { IPositionType, IPosition, useCrypto } from "./CryptoContext";
import { useEffect } from "react";
import { useState } from "react";

type IPositionPerInstrument = IPosition & {totalSize: number, totalPrice: number};

const PositionContainer = styled.div`
    & .head {
        color: gray;
    }

    & .buy {
        color: ${params => params.theme.colors.greenText};
    }

    & .sell {
        color: ${params => params.theme.colors.redText};
    }
`;

export const Position: FC = () => {
    const { positions } = useCrypto();
    const [positionPerInstruments, setPositionPerInstruments] = useState<IPositionPerInstrument[]>([]);

    useEffect(() => {
        let map: {[key: string]: IPositionPerInstrument} = {};

        for (let i = 0; i < positions.length; i++) {
            let key = `${positions[i].instrument}-${positions[i].side}`;
            let positionPerInstrument = map[key] || {
                totalSize: 0,
                totalPrice: 0,
                instrument: positions[i].instrument,
                side: positions[i].side
            };

            positionPerInstrument.totalSize += parseFloat(positions[i].size);
            positionPerInstrument.totalPrice += parseFloat(positions[i].size) * parseFloat(positions[i].price);
            map[key] = positionPerInstrument;
        }
        // let mapValues = Object.values(map);
        setPositionPerInstruments(Object.values(map));
        console.log('positions', map);
    }, [positions]);

    return (
        <PositionContainer>
            <SectionTitle style={{padding: '0 1rem'}}>Positions({positionPerInstruments.length})</SectionTitle>
            <Table>
                <TableHead>
                    <TableRow>
                        <TableCell className="head">Market</TableCell>
                        <TableCell className="head">Side</TableCell>
                        <TableCell className="head">Position Size</TableCell>
                        <TableCell className="head">Avg open price</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {positionPerInstruments.length > 0 ? positionPerInstruments.map((mapValue) => {
                        return (
                            <TableRow key={`${mapValue.instrument}-${mapValue.side}`}>
                                <TableCell >{mapValue.instrument}</TableCell>
                                <TableCell className={mapValue.side}>{mapValue.side === 'buy' ? 'Long' : 'Short'}</TableCell>
                                <TableCell>{mapValue.totalSize}</TableCell>
                                <TableCell>{(mapValue.totalPrice / mapValue.totalSize).toFixed(4)}</TableCell>
                            </TableRow>
                        )
                    }) : (<></>)}
                </TableBody>
            </Table>
        </PositionContainer>
    )
};