import { useState } from 'react';
import { Button, TextField } from '@mui/material';

function FileImport(props) {
    const { todosModel, setTodosModel } = props;
    const [selectedFile, setSelectedFile] = useState(null);

    const handleFileChange = (event) => {
        const file = event.target.files[0];
        setSelectedFile(file);
    }

    function onImportTodos(e) {
        if (selectedFile !== null) {
            const file = selectedFile;
            const reader = new FileReader();
            reader.onload = (e) => {
            const contents = e.target.result;
            const newTodos = todosModel.importTodos(contents);
            setTodosModel(newTodos);
            };
            reader.readAsText(file);
            setSelectedFile(null);
        }
    }

    return (
        <>
            <TextField type="file" accept=".txt" onChange={handleFileChange} helperText="import your todo.txt file" inputProps={{ multiple: false }} />
            {selectedFile !== null ? <Button variant="contained" color="primary" onClick={onImportTodos}>Import</Button> : null}
        </>
    );
}

export { FileImport };
