import React, { FC } from 'react';
import ReactDOM from 'react-dom';
import { ThemeProvider } from 'styled-components';
import { theme } from './styled/theme';
import { StyledEngineProvider, useTheme } from '@mui/material/styles';
import { CryptoProvider } from './CryptoContext';
import { App } from './App';

import './index.css';

const Root: FC = () => {
    return (
        <React.StrictMode>
            <StyledEngineProvider injectFirst>
                <ThemeProvider theme={{ ...useTheme(), ...theme }}>
                    <CryptoProvider>
                        <App />
                    </CryptoProvider>
                </ThemeProvider>
            </StyledEngineProvider>
        </React.StrictMode>
    )
};

ReactDOM.render(
    <Root />,
    document.getElementById('root')
);

