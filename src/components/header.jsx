import { Paper, Typography } from '@mui/material';

function Header() {
  return (
    <Paper elevation={0} style={{ height: 45, margin: -8, display: 'flex', border: '0px solid #F35627', background: '#F35627' }}>
      <Typography style={{ 'text-align': 'center', flexGrow: 1 }} color="#FFE8D9" variant="h4">
        Welcome to your todo.txt list!
      </Typography>
    </Paper>
  );
}

export { Header };
