import { useState } from 'react';
import { Button, TextField } from '@mui/material';
import { useAtom } from 'jotai';
import { todosModelAtom } from '../atoms';

function FileImport() {
  const [todosModel, setTodosModel] = useAtom(todosModelAtom);
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
      <TextField type="file" onChange={handleFileChange} helperText="import your todo.txt file" inputProps={{ accept: "text/plain", multiple: false }} />
      {selectedFile !== null ? <Button variant="contained" style={{ backgroundColor: '#F9703E', color: '#F5F7FA' }} onClick={onImportTodos}>Import</Button> : null}
    </>
  );
}

export { FileImport };
