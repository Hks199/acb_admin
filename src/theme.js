import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: { main: '#167568', dark: '#105b50', light: '#e5f3ef' },
    background: { default: '#f6f7f9', paper: '#ffffff' },
    text: { primary: '#202f39', secondary: '#6c7a86' },
    divider: '#e6ebee',
  },
  typography: { fontFamily: '"Segoe UI", system-ui, sans-serif', fontSize: 14, button: { textTransform: 'none', fontWeight: 600 } },
  shape: { borderRadius: 10 },
  components: {
    MuiButton: { defaultProps: { disableElevation: true }, styleOverrides: { root: { borderRadius: 10, padding: '10px 20px' } } },
    MuiOutlinedInput: { styleOverrides: { root: { backgroundColor: '#fff', '& fieldset': { borderColor: '#dce3e6' } } } },
    MuiDialog: { styleOverrides: { paper: { borderRadius: 20, boxShadow: '0 24px 80px #152e3330' } } },
    MuiDialogTitle: { styleOverrides: { root: { fontWeight: 700, padding: '24px 24px 16px' } } },
    MuiDialogContent: { styleOverrides: { root: { padding: 24 } } },
    MuiIconButton: { styleOverrides: { root: { color: '#6c7a86', borderRadius: 8, '&:hover': { color: '#167568', backgroundColor: '#e5f3ef' } } } },
    MuiPaginationItem: { styleOverrides: { root: { borderColor: '#e1e7e9', '&.Mui-selected': { color: '#167568', backgroundColor: '#e5f3ef', borderColor: '#b7dcd3' } } } },
  },
});

export default theme;
