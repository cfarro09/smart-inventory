import { createMuiTheme } from '@material-ui/core/styles';
import { red } from '@material-ui/core/colors';

// Create a theme instance.
const theme = (primary, secondary) => createMuiTheme({
  palette: {
    primary: {
      main: primary || "#da042e",
    },
    secondary: {
      main: secondary || "#010025",
    },
    error: {
      main: red.A400,
    },
    background: {
      default: '#fff',
    },
  },
  typography: {
    fontFamily: 'dm-sans',
  },
  overrides: {
    MuiSvgIcon: {
      root: { color: "#8F92A1", width: 22, height: 22, minWidth: 0 },
    },
    MuiListItemIcon: {
      root: { minWidth: 38 },
    },
    MuiListItem: {
      gutters: { paddingLeft: 25 }
    },
    MuiTypography: {
      body1: { fontSize: 14 }
    },
    // MuiButtonBase: {
    // 	root: { minHeight: 48 },
    // },
    MuiButton: {
      root: {
        minHeight: 40, minWidth: 100, height: 40, textTransform: 'initial', fontSize: '14px', padding: 12,
        fontWeight: 500,
      },
      label: { fontWeight: 600, fontSize: 14, fontStyle: 'normal' },
    },
    MuiTabs: {
      fixed: {
        flexWrap: 'inherit',
      },
      flexContainer: {
        flexWrap: 'inherit',
      }
    },
    MuiDivider: {
      root: {
        backgroundColor: '#EBEAED',
      },
    },
  }
});

export default theme;
