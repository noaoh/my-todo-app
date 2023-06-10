import { useState } from 'react';
import { IconButton, Menu, MenuItem, Checkbox, FormControlLabel } from '@mui/material';
import SettingsIcon from '@mui/icons-material/Settings';
import { useAtom } from 'jotai';
import { addCompletionDateAtom, addCreationDateAtom } from '../atoms';

function Settings() {
    const [addCreationDate, setAddCreationDate] = useAtom(addCreationDateAtom);
    const [addCompletionDate, setAddCompletionDate] = useAtom(addCompletionDateAtom);
    const [anchorEl, setAnchorEl] = useState(null);

    const handleMenuClick = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    return (
        <>
            <IconButton onClick={handleMenuClick} edge='start' color='inherit' aria-label='menu' >
                <SettingsIcon />
            </IconButton>
            <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleClose}>
                <MenuItem>
                    <FormControlLabel control={<Checkbox checked={addCreationDate} onChange={(e) => setAddCreationDate(e.target.checked)} />} label="Add creation date upon todo creation" />
                </MenuItem>
                <MenuItem>
                    <FormControlLabel control={<Checkbox checked={addCompletionDate} onChange={(e) => setAddCompletionDate(e.target.checked)} />} label="Add completion date upon todo completion" />
                </MenuItem>
            </Menu>
        </>
    );
}

export { Settings };
