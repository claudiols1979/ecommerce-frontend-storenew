import React, { Fragment, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    Box,
    Typography,
    Button,
    Fade,
    useTheme,
    useMediaQuery,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import { useAdGrid3 } from "../../contexts/AdGrid3Context";

const Wrapper = styled(Box)(({ theme }) => ({
    width: "100%",
    display: "flex",
    justifyContent: "center",
    margin: theme.spacing(6, 0),
    padding: theme.spacing(0, 2),
    boxSizing: "border-box",
}));

const CSSGridContainer = styled(Box)(({ theme }) => ({
    display: "grid",
    gridTemplateColumns: "1fr",
    gap: theme.spacing(3),
    maxWidth: "1400px",
    width: "100%",
    [theme.breakpoints.up("md")]: {
        gridTemplateColumns: "minmax(0, 2fr) minmax(0, 1fr)",
        gridTemplateRows: "1fr 1fr",
    },
}));

const ImageContainer = styled(Box)(({ theme, isLarge }) => ({
    position: "relative",
    overflow: "hidden",
    borderRadius: "12px",
    cursor: "pointer",
    boxShadow: theme.shadows[4],
    transition: "transform 0.3s ease, box-shadow 0.3s ease",
    width: "100%",
    height: "100%",
    minHeight: "250px",
    backgroundColor: theme.palette.grey[200],
    ...(isLarge && {
        [theme.breakpoints.up("md")]: {
            gridRow: "span 2",
        },
    }),
    "&:hover": {
        transform: "translateY(-4px)",
        boxShadow: theme.shadows[8],
        "& .image-overlay": {
            opacity: 1,
            backgroundColor: "rgba(0, 0, 0, 0.4)",
        },
        "& img": {
            transform: "scale(1.05)",
        },
    },
}));

const StyledImage = styled("img")({
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    objectFit: "cover",
    transition: "transform 0.5s ease",
});

const Overlay = styled(Box)(({ theme }) => ({
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.1)",
    opacity: 1, // Visible initially
    display: "flex",
    flexDirection: "column",
    justifyContent: "center", // Center vertically 
    alignItems: "center", // Center horizontally
    padding: theme.spacing(2),
    transition: "opacity 0.3s ease, background-color 0.3s ease",
}));

const ActionButton = styled(Button)(({ theme }) => ({
    background: "linear-gradient(90deg, rgba(176, 70, 233, 0.7) 0%, rgba(246, 41, 133, 0.7) 100%)",
    color: "white",
    fontWeight: "bold",
    borderRadius: "50px",
    padding: theme.spacing(1, 4),
    textTransform: "none",
    boxShadow: theme.shadows[2],
    "&:hover": {
        transform: "translateY(-2px)",
        boxShadow: theme.shadows[6],
    },
    transition: "all 0.3s ease",
}));

const AdGridSystem3 = () => {
    const theme = useTheme();
    const { gridItems, loading, processCloudinaryUrl, defaultItems } = useAdGrid3();
    const navigate = useNavigate();

    const handleActionClick = (link) => {
        if (link) {
            navigate(link);
        }
    };

    if (loading) {
        return (
            <Wrapper>
                <CSSGridContainer>
                    <Box sx={{ gridRow: { md: "span 2" }, minHeight: "500px", borderRadius: "12px", bgcolor: "grey.300", display: "flex", alignItems: "center", justifyContent: "center" }}><Typography color="textSecondary">Cargando...</Typography></Box>
                    <Box sx={{ minHeight: "240px", borderRadius: "12px", bgcolor: "grey.300", display: "flex", alignItems: "center", justifyContent: "center" }}><Typography color="textSecondary">Cargando...</Typography></Box>
                    <Box sx={{ minHeight: "240px", borderRadius: "12px", bgcolor: "grey.300", display: "flex", alignItems: "center", justifyContent: "center" }}><Typography color="textSecondary">Cargando...</Typography></Box>
                </CSSGridContainer>
            </Wrapper>
        );
    }

    // Ensure we have exactly 3 items padded with nulls if necessary
    const items = [...gridItems.slice(0, 3)];

    return (
        <Wrapper>
            <CSSGridContainer>
                {items.map((item, index) => {
                    const currentItem = item || (defaultItems && defaultItems[index]);
                    if (!currentItem) return null;

                    const isLarge = index === 0;
                    const isValidImage = (url) => url && typeof url === "string" && url.trim() !== "" && url.length > 50;

                    const processedImageUrl = isValidImage(currentItem.image)
                        ? processCloudinaryUrl(currentItem.image, isLarge)
                        : (defaultItems && defaultItems[index] ? defaultItems[index].image : "");

                    return (
                        <Fade in={true} timeout={800} key={currentItem._id || index}>
                            <ImageContainer isLarge={isLarge} onClick={() => handleActionClick(currentItem.buttonLink)}>
                                <StyledImage
                                    src={processedImageUrl}
                                    alt={currentItem.alt || currentItem.title || ""}
                                />
                                <Overlay className="image-overlay">
                                    {currentItem.buttonText && (
                                        <ActionButton
                                            variant="contained"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleActionClick(currentItem.buttonLink);
                                            }}
                                        >
                                            {currentItem.buttonText}
                                        </ActionButton>
                                    )}
                                </Overlay>
                            </ImageContainer>
                        </Fade>
                    );
                })}
            </CSSGridContainer>
        </Wrapper>
    );
};

export default AdGridSystem3;
