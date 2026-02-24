import React, { createContext, useContext, useState } from 'react';
import axios from 'axios';
import API_URL from '../config';
import { useAuth } from './AuthContext'; // Importa el AuthContext

const UpdateInfoContext = createContext();

export const useUpdateInfo = () => {
  const context = useContext(UpdateInfoContext);
  if (!context) {
    throw new Error('useUpdateInfo must be used within an UpdateInfoProvider');
  }
  return context;
};

export const UpdateInfoProvider = ({ children }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const { updateUser } = useAuth(); // Obtén la función de actualización del AuthContext

  const clearMessages = () => {
    setError(null);
    setSuccess(false);
  };

  const updateResellerProfile = async (id, updatedData) => {
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      // Obtener el token del objeto user en localStorage
      const storedUser = localStorage.getItem("user");
      let token = null;

      if (storedUser) {
        try {
          const userData = JSON.parse(storedUser);
          token = userData.token;
        } catch (parseError) {
          console.error("Error parsing user data from localStorage:", parseError);
          throw new Error('Error al obtener información de usuario');
        }
      }

      if (!token) {
        throw new Error('No se encontró token de autenticación. Por favor, inicie sesión nuevamente.');
      }

      const config = {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      };

      const response = await axios.put(
        `${API_URL}/api/auth/resellers/selfupdate/${id}`,
        updatedData,
        config
      );

      console.log('✅ Backend response data:', response.data);
      console.log('✅ Campos nuevos en response:', {
        tipoIdentificacion: response.data.tipoIdentificacion,
        cedula: response.data.cedula,
        codigoActividadReceptor: response.data.codigoActividadReceptor
      });

      if (response.status === 200) {
        setSuccess(true);

        if (updateUser) {
          updateUser({
            firstName: response.data.firstName,
            lastName: response.data.lastName,
            email: response.data.email,
            phoneNumber: response.data.phoneNumber,
            address: response.data.address,
            city: response.data.city,
            province: response.data.province,
            provincia: response.data.provincia,
            canton: response.data.canton,
            distrito: response.data.distrito,
            resellerCategory: response.data.resellerCategory,
            // ✅ AGREGAR ESTOS 3 CAMPOS NUEVOS
            tipoIdentificacion: response.data.tipoIdentificacion,
            cedula: response.data.cedula,
            codigoActividadReceptor: response.data.codigoActividadReceptor
          });
        }

        return response.data;
      }
    } catch (err) {
      let errorMessage = 'Error al actualizar el perfil';

      if (err.response) {
        errorMessage = err.response.data?.message || errorMessage;

        switch (err.response.status) {
          case 400:
            errorMessage = err.response.data?.message || 'Datos inválidos';
            break;
          case 404:
            errorMessage = 'Revendedor no encontrado';
            break;
          case 500:
            errorMessage = 'Error del servidor. Intente nuevamente más tarde.';
            break;
          default:
            errorMessage = err.response.data?.message || `Error ${err.response.status}`;
        }
      } else if (err.request) {
        errorMessage = 'No se pudo conectar al servidor. Verifique su conexión.';
      } else {
        errorMessage = err.message;
      }

      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const value = {
    loading,
    error,
    success,
    updateResellerProfile,
    clearMessages,
  };

  return (
    <UpdateInfoContext.Provider value={value}>
      {children}
    </UpdateInfoContext.Provider>
  );
};

export default UpdateInfoContext;