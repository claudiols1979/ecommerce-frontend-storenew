import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import axios from "axios";
import PropTypes from "prop-types";
import { useAuth } from "./AuthContext";
import API_URL from "../config";

const ConfigContext = createContext();

export const useConfig = () => useContext(ConfigContext);

export const ConfigProvider = ({ children }) => {
    const [configs, setConfigs] = useState({});
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();
    const token = user?.token;

    const fetchConfigs = useCallback(async () => {
        if (!token) {
            setLoading(false);
            return;
        }
        try {
            setLoading(true);
            const res = await axios.get(`${API_URL}/api/config`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setConfigs(res.data);
        } catch (error) {
            console.error("Error fetching configs:", error);
        } finally {
            setLoading(false);
        }
    }, [token]);

    useEffect(() => {
        fetchConfigs();
    }, [fetchConfigs]);

    const value = {
        configs,
        taxRegime: configs.TAX_REGIME || "traditional",
        promotionBannerMessage: configs.PROMOTION_BANNER_MESSAGE || "Aprovecha todas nuestras ofertas de apertura",
        loading,
        refreshConfigs: fetchConfigs,
    };

    return <ConfigContext.Provider value={value}>{children}</ConfigContext.Provider>;
};

ConfigProvider.propTypes = {
    children: PropTypes.node.isRequired,
};
