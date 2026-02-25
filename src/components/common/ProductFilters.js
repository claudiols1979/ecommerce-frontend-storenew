import React, { useState } from 'react';
import {
  Grid, Paper, TextField, FormControl, InputLabel, Select, MenuItem, Button, Box
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';

// Este componente es ahora "controlado": recibe valores iniciales y notifica cambios a través de una función prop.
const ProductFilters = ({ initialFilters = {}, onFilterSubmit }) => {
  const [searchTerm, setSearchTerm] = useState(initialFilters.search || '');
  const [selectedGender, setSelectedGender] = useState(initialFilters.gender || '');
  const [sortOrder, setSortOrder] = useState(initialFilters.sort || 'updatedAt_desc');

  const availableGenders = [
    { value: 'men', label: 'Hombre' }, { value: 'women', label: 'Mujer' },
    { value: 'unisex', label: 'Unisex' }, { value: 'children', label: 'Niños' },
    { value: 'elderly', label: 'Ancianos' }, { value: 'other', label: 'Otro' },
  ];

  const handleSubmit = (event) => {
    event.preventDefault();
    // Llama a la función que le pasó el padre con los valores actuales de los filtros
    onFilterSubmit({
      search: searchTerm,
      gender: selectedGender,
      sort: sortOrder,
    });
  };

  return (
    <Paper
      elevation={8}
      component="form" // Lo convertimos en un formulario para manejar el submit
      onSubmit={handleSubmit}
      sx={{
        p: { xs: 2, sm: 3 },
        mb: 4,
        borderRadius: 4,
        background: 'linear-gradient(135deg, rgba(38,60,92,0.95) 60%, rgba(233, 229, 209, 0.6) 100%)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255, 215, 0, 0.2)',
        boxShadow: '0px 15px 35px rgba(0, 0, 0, 0.5)',
      }}
    >
      <Grid container spacing={3} alignItems="center" justifyContent="center">
        {/* Campo de Búsqueda */}
        <Grid item xs={12} md={4}>
          <TextField
            label="Buscar producto"
            variant="outlined"
            fullWidth
            size="small"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: '8px', color: 'white',
                '& fieldset': { borderColor: 'rgba(238, 234, 219, 0.3)' },
                '&:hover fieldset': { borderColor: '#efe9c8ff' },
                '&.Mui-focused fieldset': { borderColor: '#eae8daff' },
              },
              '& .MuiInputLabel-root': { color: 'rgba(255, 255, 255, 0.7)' },
              '& .MuiInputLabel-root.Mui-focused': { color: '#f2f0e6ff' },
            }}
          />
        </Grid>

        {/* Botón de Búsqueda */}
        <Grid item xs={12} md={4} lg={4}>
          <Button
            type="submit"
            variant="contained"
            fullWidth
            sx={{
              height: '40px', borderRadius: '8px', color: '#faf8f8ff',
              backgroundColor: '#bb4343ff', '&:hover': { backgroundColor: '#ff0000ff' },
              fontWeight: 'bold'
            }}
            startIcon={<SearchIcon />}
          >
            Buscar
          </Button>
        </Grid>
      </Grid>
    </Paper>
  );
};

export default ProductFilters;