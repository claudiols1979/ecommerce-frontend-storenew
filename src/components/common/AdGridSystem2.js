import React, { Fragment, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    Box,
    Grid,
    Typography,
    Button,
    Fade,
    useTheme,
    useMediaQuery,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import { useAdGrid2 } from "../../contexts/AdGrid2Context";

const PictureGridContainer = styled(Box)(({ theme }) => ({
    width: "100%",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    margin: theme.spacing(6, 0),
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
        gridTemplateColumns: "1fr 1fr",
    },
}));

const ImageContainer = styled(Box)(({ theme }) => ({
    position: "relative",
    overflow: "hidden",
    borderRadius: "12px",
    height: "100%",
    minHeight: "300px",
    cursor: "pointer",
    boxShadow: theme.shadows[4],
    transition: "transform 0.3s ease, box-shadow 0.3s ease",
    aspectRatio: "2 / 1", // Wider aspect ratio for 2 items
    "&:hover": {
        transform: "translateY(-4px)",
        boxShadow: theme.shadows[8],
        "& .image-overlay": {
            opacity: 1,
            backgroundColor: "rgba(0, 0, 0, 0.5)",
        },
        "& img": {
            transform: "scale(1.05)",
        },
    },
    [theme.breakpoints.down("md")]: {
        minHeight: "250px",
    },
    [theme.breakpoints.down("sm")]: {
        minHeight: "200px",
        borderRadius: 0,
    },
}));

const StyledImage = styled("img")({
    width: "100%",
    height: "100%",
    objectFit: "cover",
    transition: "transform 0.5s ease",
});

const StyledVideo = styled("video")({
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
    backgroundColor: "rgba(0, 0, 0, 0.3)",
    opacity: 0,
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    padding: theme.spacing(2),
    transition: "opacity 0.3s ease, background-color 0.3s ease",
    color: "white",
    textAlign: "center",
}));

const ActionButton = styled(Button)(({ theme }) => ({
    marginTop: theme.spacing(2),
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

const AdGridSystem2 = () => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
    const { gridItems, loading, processCloudinaryUrl, defaultItems } = useAdGrid2();
    const navigate = useNavigate();

    const isValidImage = (url) => url && typeof url === "string" && url.trim() !== "" && url.length > 50;

    const processedGridItems = gridItems.map((item, index) => ({
        ...item,
        image: isValidImage(item.image)
            ? processCloudinaryUrl(item.image)
            : (defaultItems && defaultItems[index] ? defaultItems[index].image : ""),
    }));

    const handleActionClick = (link) => {
        if (link) {
            navigate(link);
        }
    };

    if (loading) {
        return (
            <PictureGridContainer>
                <CSSGridContainer sx={{
                    gridTemplateColumns: processedGridItems.length === 1 ? "1fr" : { md: "1fr 1fr" }
                }}>
                    {[...Array(1)].map((_, index) => (
                        <ImageContainer key={index} sx={{ width: "100%" }}>
                            <Box
                                sx={{
                                    width: "100%",
                                    height: "100%",
                                    backgroundColor: "grey.300",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                }}
                            >
                                <Typography variant="body2" color="textSecondary">
                                    Cargando...
                                </Typography>
                            </Box>
                        </ImageContainer>
                    ))}
                </CSSGridContainer>
            </PictureGridContainer>
        );
    }

    return (
        <PictureGridContainer>
            <CSSGridContainer sx={{
                gridTemplateColumns: processedGridItems.length === 1 ? "1fr" : { md: "1fr 1fr" }
            }}>
                {processedGridItems.map((item, index) => (
                    <Fade in={true} timeout={800} key={item._id || index}>
                        <ImageContainer sx={{ width: "100%" }}>
                            {item.image.includes("/video/upload/") || item.image.match(/\.(mp4|webm|ogg|mov|avi|flv|wmv|mpg|mpeg)$/i) ? (
                                <StyledVideo
                                    src={item.image}
                                    autoPlay
                                    loop
                                    muted
                                    playsInline
                                    onClick={() => handleActionClick(item.buttonLink)}
                                />
                            ) : (
                                <StyledImage
                                    src={item.image}
                                    alt={item.alt || item.title}
                                    onClick={() => handleActionClick(item.buttonLink)}
                                />
                            )}
                            <Overlay
                                className="image-overlay"
                                sx={{
                                    opacity: 1,
                                    backgroundColor: "rgba(0,0,0,0.1)",
                                    "&:hover": {
                                        opacity: 1,
                                        backgroundColor: "rgba(0, 0, 0, 0.4)",
                                    },
                                }}
                                onClick={() => handleActionClick(item.buttonLink)}
                            >
                                <ActionButton
                                    variant="outlined"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleActionClick(item.buttonLink);
                                    }}
                                >
                                    {item.buttonText}
                                </ActionButton>
                            </Overlay>
                        </ImageContainer>
                    </Fade>
                ))}
            </CSSGridContainer>
        </PictureGridContainer>
    );
};

export default AdGridSystem2;
