import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import Grid from "@mui/material/Grid";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import TextField from "@mui/material/TextField";

// Import the address data
import addressData from "../../utils/crAddressData.json";

function CRAddressSelector({
  provincia,
  setProvincia,
  canton,
  setCanton,
  distrito,
  setDistrito,
  vertical = false,
  customStyle = {},
  icon = null,
}) {
  const [provincesList, setProvincesList] = useState([]);
  const [cantonesList, setCantonesList] = useState([]);
  const [distritosList, setDistritosList] = useState([]);

  // On mount, load provinces
  useEffect(() => {
    const provs = Object.values(addressData).map((p) => ({
      id: p.id,
      name: p.name,
    }));
    setProvincesList(provs);
  }, []);

  // When provincia changes, load cantones
  useEffect(() => {
    if (provincia) {
      const selectedProv = Object.values(addressData).find(
        (p) => p.name === provincia,
      );
      if (selectedProv && selectedProv.cantones) {
        const cants = Object.values(selectedProv.cantones).map((c) => ({
          id: c.id,
          name: c.name,
        }));
        setCantonesList(cants);
      } else {
        setCantonesList([]);
      }
    } else {
      setCantonesList([]);
    }
  }, [provincia]);

  // When canton changes, load distritos
  useEffect(() => {
    if (provincia && canton) {
      const selectedProv = Object.values(addressData).find(
        (p) => p.name === provincia,
      );
      if (selectedProv && selectedProv.cantones) {
        const selectedCanton = Object.values(selectedProv.cantones).find(
          (c) => c.name === canton,
        );
        if (selectedCanton && selectedCanton.distritos) {
          const dists = Object.values(selectedCanton.distritos).map((d) => ({
            id: d, // In the API, distritos are just k:v pairs
            name: d,
          }));
          setDistritosList(dists);
        } else {
          setDistritosList([]);
        }
      }
    } else {
      setDistritosList([]);
    }
  }, [provincia, canton]);

  const handleProvinciaChange = (e) => {
    setProvincia(e.target.value);
    setCanton("");
    setDistrito("");
  };

  const handleCantonChange = (e) => {
    setCanton(e.target.value);
    setDistrito("");
  };

  const handleDistritoChange = (e) => {
    setDistrito(e.target.value);
  };

  const itemCols = vertical ? 12 : 4;

  return (
    <Grid container spacing={2}>
      <Grid item xs={12} md={itemCols}>
        <FormControl fullWidth variant="outlined" required sx={customStyle}>
          <InputLabel id="provincia-label">Provincia</InputLabel>
          <Select
            labelId="provincia-label"
            id="provincia"
            name="provincia"
            value={provincia}
            onChange={handleProvinciaChange}
            label="Provincia"
            startAdornment={icon}
          >
            <MenuItem value="">
              <em>Seleccione una Provincia</em>
            </MenuItem>
            {provincesList.map((p) => (
              <MenuItem key={p.id} value={p.name}>
                {p.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Grid>

      <Grid item xs={12} md={itemCols}>
        <FormControl
          fullWidth
          variant="outlined"
          required
          disabled={!provincia}
          sx={customStyle}
        >
          <InputLabel id="canton-label">Cantón</InputLabel>
          <Select
            labelId="canton-label"
            id="canton"
            name="canton"
            value={canton}
            onChange={handleCantonChange}
            label="Cantón"
            startAdornment={icon}
          >
            <MenuItem value="">
              <em>Seleccione un Cantón</em>
            </MenuItem>
            {cantonesList.map((c) => (
              <MenuItem key={c.id} value={c.name}>
                {c.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Grid>

      <Grid item xs={12} md={itemCols}>
        <FormControl
          fullWidth
          variant="outlined"
          required
          disabled={!canton}
          sx={customStyle}
        >
          <InputLabel id="distrito-label">Distrito</InputLabel>
          <Select
            labelId="distrito-label"
            id="distrito"
            name="distrito"
            value={distrito}
            onChange={handleDistritoChange}
            label="Distrito"
            startAdornment={icon}
          >
            <MenuItem value="">
              <em>Seleccione un Distrito</em>
            </MenuItem>
            {distritosList.map((d, idx) => (
              <MenuItem key={idx} value={d.name}>
                {d.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Grid>
    </Grid>
  );
}

CRAddressSelector.propTypes = {
  provincia: PropTypes.string.isRequired,
  setProvincia: PropTypes.func.isRequired,
  canton: PropTypes.string.isRequired,
  setCanton: PropTypes.func.isRequired,
  distrito: PropTypes.string.isRequired,
  setDistrito: PropTypes.func.isRequired,
  vertical: PropTypes.bool,
  customStyle: PropTypes.object,
};

export default CRAddressSelector;
