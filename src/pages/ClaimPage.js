import React, { useState, useEffect } from "react";
import {
    Container,
    Box,
    Typography,
    Button,
    Grid,
    TextField,
    Card,
    CardContent,
    CircularProgress,
    Alert,
    MenuItem,
    alpha,
} from "@mui/material";
import { useAuth } from "../contexts/AuthContext";
import { useOrders } from "../contexts/OrderContext";
import axios from "axios";
import { formatPrice } from "../utils/formatters";

const mainGradient =
    "linear-gradient(135deg, rgba(49, 0, 138, 0.85) 0%, rgba(49, 0, 138, 0.85) 35%, rgba(168, 85, 247, 0.85) 65%, rgba(247, 37, 133, 0.85) 100%) !important";

const glassStyle = {
    background: "rgba(255, 255, 255, 0.1)",
    backdropFilter: "blur(20px)",
    WebkitBackdropFilter: "blur(20px)",
    border: "1px solid rgba(255, 255, 255, 0.2)",
    borderRadius: "24px",
    color: "white",
    boxShadow: "0 8px 32px 0 rgba(0, 0, 0, 0.37)",
};

const ClaimPage = () => {
    const { user, api } = useAuth();
    const [orders, setOrders] = useState([]);
    const [formData, setFormData] = useState({
        orderId: "",
        subject: "",
        message: "",
    });
    const [loading, setLoading] = useState(false);
    const [fetchingOrders, setFetchingOrders] = useState(true);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const response = await api.get("/api/orders/my-orders");
                setOrders(response.data.orders || []);
            } catch (err) {
                console.error("Error fetching orders:", err);
            } finally {
                setFetchingOrders(false);
            }
        };
        if (user) fetchOrders();
    }, [user, api]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        try {
            await api.post("/api/claims", formData);
            setSuccess(true);
            setFormData({ orderId: "", subject: "", message: "" });
        } catch (err) {
            setError(err.response?.data?.message || "Error al registrar el reclamo.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box sx={{ minHeight: "80vh", py: 8, background: mainGradient, borderRadius: 4 }}>
            <Container maxWidth="sm">
                <Card sx={glassStyle}>
                    <CardContent sx={{ p: 4 }}>
                        <Typography variant="h4" sx={{ fontWeight: 800, mb: 4, textAlign: "center" }}>
                            Registrar Reclamo
                        </Typography>

                        {success && (
                            <Alert severity="success" sx={{ mb: 3, borderRadius: "12px" }}>
                                Reclamo registrado exitosamente. Un administrador revisará su caso pronto.
                            </Alert>
                        )}

                        {error && (
                            <Alert severity="error" sx={{ mb: 3, borderRadius: "12px" }}>
                                {error}
                            </Alert>
                        )}

                        <form onSubmit={handleSubmit}>
                            <TextField
                                select
                                fullWidth
                                label="Seleccionar Orden"
                                name="orderId"
                                value={formData.orderId}
                                onChange={handleChange}
                                sx={{ mb: 3, "& .MuiInputBase-root": { color: "white" }, "& .MuiInputLabel-root": { color: alpha("#fff", 0.7) } }}
                            >
                                <MenuItem value="">Sin orden específica</MenuItem>
                                {orders.map((order) => (
                                    <MenuItem key={order._id} value={order._id}>
                                        Orden #{order._id.slice(-6)} - {formatPrice(order.totalPrice)} ({new Date(order.createdAt).toLocaleDateString()})
                                    </MenuItem>
                                ))}
                            </TextField>

                            <TextField
                                fullWidth
                                label="Asunto del Reclamo"
                                name="subject"
                                value={formData.subject}
                                onChange={handleChange}
                                required
                                sx={{ mb: 3, "& .MuiInputBase-root": { color: "white" }, "& .MuiInputLabel-root": { color: alpha("#fff", 0.7) } }}
                            />

                            <TextField
                                fullWidth
                                label="Descripción del Problema"
                                name="message"
                                multiline
                                rows={6}
                                value={formData.message}
                                onChange={handleChange}
                                required
                                sx={{ mb: 4, "& .MuiInputBase-root": { color: "white" }, "& .MuiInputLabel-root": { color: alpha("#fff", 0.7) } }}
                            />

                            <Button
                                fullWidth
                                variant="contained"
                                type="submit"
                                disabled={loading || fetchingOrders}
                                sx={{
                                    py: 2,
                                    fontWeight: "bold",
                                    borderRadius: "16px",
                                    background: "#F72585",
                                    "&:hover": { background: "#D91B6F" },
                                }}
                            >
                                {loading ? <CircularProgress size={24} color="inherit" /> : "Enviar Reclamo"}
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </Container>
        </Box>
    );
};

export default ClaimPage;
