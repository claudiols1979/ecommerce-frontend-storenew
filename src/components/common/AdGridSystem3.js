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
    margin: 0,
    padding: theme.spacing(0, 2),
    boxSizing: "border-box",
    [theme.breakpoints.down("sm")]: {
        padding: 0,
    },
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

const ImageContainer = styled(Box, {
    shouldForwardProp: (prop) => prop !== 'isLarge',
})(({ theme, isLarge }) => ({
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
    [theme.breakpoints.down("sm")]: {
        borderRadius: 0,
    },
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

const StyledVideo = styled("video")({
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
    variant: "outlined",
    borderColor: "rgba(255, 255, 255, 0.8)",
    borderWidth: "1.5px",
    borderStyle: "solid",
    backgroundColor: "transparent",
    color: "white",
    fontWeight: 600,
    borderRadius: "50px",
    padding: theme.spacing(1, 4),
    textTransform: "none",
    "&:hover": {
        transform: "translateY(-2px)",
        borderColor: "white",
        backgroundColor: "rgba(255, 255, 255, 0.1)",
        boxShadow: "0 4px 12px rgba(255, 255, 255, 0.1)",
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
                <CSSGridContainer sx={{ gridTemplateColumns: "1fr" }}>
                    <Box sx={{ minHeight: "400px", borderRadius: "12px", bgcolor: "grey.300", display: "flex", alignItems: "center", justifyContent: "center" }}><Typography color="textSecondary">Cargando...</Typography></Box>
                </CSSGridContainer>
            </Wrapper>
        );
    }

    const items = gridItems;

    return (
        <Wrapper>
            <CSSGridContainer sx={items.length < 3 ? {
                gridTemplateColumns: items.length === 1 ? "1fr" : { md: "1fr 1fr" },
                gridTemplateRows: "auto"
            } : {}}>
                {items.map((item, index) => {
                    const currentItem = item || (defaultItems && defaultItems[index]);
                    if (!currentItem) return null;

                    const isLarge = index === 0 && items.length >= 3;
                    const isValidImage = (url) => url && typeof url === "string" && url.trim() !== "" && url.length > 50;

                    const processedImageUrl = isValidImage(currentItem.image)
                        ? processCloudinaryUrl(currentItem.image, isLarge)
                        : (defaultItems && defaultItems[index] ? defaultItems[index].image : "");

                    const isVideo = processedImageUrl.includes("/video/upload/") || processedImageUrl.match(/\.(mp4|webm|ogg|mov|avi|flv|wmv|mpg|mpeg)$/i);

                    return (
                        <Fade in={true} timeout={800} key={currentItem._id || index}>
                            <ImageContainer isLarge={isLarge} onClick={() => handleActionClick(currentItem.buttonLink)}>
                                {isVideo ? (
                                    <StyledVideo
                                        src={processedImageUrl}
                                        autoPlay
                                        loop
                                        muted
                                        playsInline
                                    />
                                ) : (
                                    <StyledImage
                                        src={processedImageUrl}
                                        alt={currentItem.alt || currentItem.title || ""}
                                    />
                                )}
                                <Overlay className="image-overlay">
                                    {currentItem.buttonText && (
                                        <ActionButton
                                            variant="outlined"
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
