// import logo from './logo.svg';
import './App.css';
import React from 'react';
import { Paper, ThemeProvider } from '@mui/material';
import { darkTheme, lightTheme } from './themes';
import { NavFrame, Router } from './components';
import { LightModeContext } from './contexts';

function App() {
	const [lightMode, setLightMode] = React.useState(true);

	const toggleColorMode = React.useCallback(() => {
		setLightMode(!lightMode);
	}, [lightMode]);

	const colorMode = React.useMemo(
		() => ({
			isLightMode: lightMode,
			toggleLightMode: toggleColorMode,
		}),
		[lightMode, toggleColorMode]
	);

	return (
		<LightModeContext.Provider value={colorMode}>
			<ThemeProvider theme={lightMode ? lightTheme : darkTheme}>
				<NavFrame>
					<Paper elevation={5} sx={{ flexGrow: 1, p: 2 }}>
						<Router />
					</Paper>
				</NavFrame>
			</ThemeProvider>
		</LightModeContext.Provider>
	);
}

export default App;
