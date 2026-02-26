import React, { useState, useEffect, useCallback } from "react";
import DOMPurify from "dompurify";
import {
  Container,
  Box,
  Typography,
  Button,
  Grid,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  TextField,
  Link as MuiLink,
  IconButton,
  useTheme,
  Divider,
  Paper,
  Chip,
  useMediaQuery,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Rating,
  List,
  ListItem,
  Avatar,
  ListItemText,
  ToggleButtonGroup,
  ToggleButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
} from "@mui/material";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import RemoveCircleOutlineIcon from "@mui/icons-material/RemoveCircleOutline";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { Helmet } from "react-helmet-async";
import { useParams, useNavigate } from "react-router-dom";
import { useProducts } from "../contexts/ProductContext";
import { useDepartmental } from "../contexts/DepartmentalContext";
import { useOrders } from "../contexts/OrderContext";
import { useAuth } from "../contexts/AuthContext";
import { useReviews } from "../contexts/ReviewContext";
import { toast } from "react-toastify";
import ProductImageCarousel from "../components/product/ProductImageCarousel";
import ProductCard from "../components/product/ProductCard";
import axios from "axios";
import API_URL from "../config";
import { formatPrice } from "../utils/formatters";
import { calculatePriceWithTax } from "../utils/taxCalculations";
import { useConfig } from "../contexts/ConfigContext";
import { useLocation } from "react-router-dom";

const HTMLContent = ({
  html,
  fallback = "No description available.",
  ...typographyProps
}) => {
  const createMarkup = (htmlContent) => {
    return { __html: DOMPurify.sanitize(htmlContent || "") };
  };

  if (!html || html.trim() === "") {
    return <Typography {...typographyProps}>{fallback}</Typography>;
  }

  return (
    <Typography
      {...typographyProps}
      dangerouslySetInnerHTML={createMarkup(html)}
    />
  );
};

// Helper function to extract base product name from code
const extractBaseProductName = (name, code) => {
  if (!code || !code.includes("_")) return name;

  // Contar número de atributos en el código
  const attributeCount = (code.match(/_/g) || []).length;
  if (attributeCount === 0) return name;

  // Dividir el nombre en palabras y remover la cantidad de atributos
  const words = name.split(" ");
  if (words.length > attributeCount) {
    return words.slice(0, words.length - attributeCount).join(" ");
  }

  return name;
};

// Helper function to extract all variant attributes from product code
const extractVariantAttributes = (code) => {
  const firstUnderscoreIndex = code.indexOf("_");
  if (firstUnderscoreIndex === -1) {
    return { baseCode: code, attributes: [] };
  }

  const baseCode = code.substring(0, firstUnderscoreIndex);
  const attributesPart = code.substring(firstUnderscoreIndex + 1);
  const attributes = attributesPart.split("_");

  return { baseCode, attributes };
};

// Helper function to get attribute type based on position (generic approach)
const getAttributeType = (index) => {
  const attributeTypes = ["color", "size", "model", "type", "material"];
  return attributeTypes[index] || `attribute_${index + 1}`;
};

const ProductDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const isExtraSmallMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const { products: defaultProducts } = useProducts();
  const { departmentalProducts, currentFilters } = useDepartmental();
  const { addItemToCart, loading: cartLoading, myOrders } = useOrders();
  const { user } = useAuth();
  const { taxRegime } = useConfig();

  const {
    reviews,
    loading: reviewsLoading,
    fetchReviews,
    createReview,
  } = useReviews();

  const [product, setProduct] = useState(null);
  const [loadingSpecificProduct, setLoadingSpecificProduct] = useState(true);
  const [errorSpecificProduct, setErrorSpecificProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [addingProductId, setAddingProductId] = useState(null);
  const [customerQuestion, setCustomerQuestion] = useState("");
  const [newRating, setNewRating] = useState(0);
  const [newComment, setNewComment] = useState("");
  const [canReview, setCanReview] = useState(false);
  const [reviewDisabledMessage, setReviewDisabledMessage] = useState("");
  const [productVariants, setProductVariants] = useState([]);
  const [selectedAttributes, setSelectedAttributes] = useState({});
  const [availableOptions, setAvailableOptions] = useState({});
  const [attributeOptions, setAttributeOptions] = useState([]);
  const [currentProductId, setCurrentProductId] = useState(null);
  const [productsLoaded, setProductsLoaded] = useState(false);
  const [loadingAttributes, setLoadingAttributes] = useState(false);
  const [allAttributesLoaded, setAllAttributesLoaded] = useState(false);

  const getProductsToUse = () => {
    // ✅ PRIMERO intentar determinar hasActiveFilters desde el cache
    if (product) {
      const currentVariantAttributes = extractVariantAttributes(product.code);
      const cacheKey = `attributeOptions_${currentVariantAttributes.baseCode}`;
      const cachedData = localStorage.getItem(cacheKey);

      if (cachedData) {
        try {
          const parsedData = JSON.parse(cachedData);
          const savedHasActiveFilters = parsedData.hasActiveFilters;

          console.log(
            "🔍 Usando estado de filtros desde cache:",
            savedHasActiveFilters,
          );
          return savedHasActiveFilters ? departmentalProducts : defaultProducts;
        } catch (error) {
          console.error("Error reading cache for filters:", error);
        }
      }
    }

    // ✅ FALLBACK: lógica original si no hay cache
    const hasActiveFilters =
      currentFilters && Object.keys(currentFilters).length > 0;
    console.log("🔍 Usando estado de filtros actual:", hasActiveFilters);
    return hasActiveFilters ? departmentalProducts : defaultProducts;
  };

  console.log("attributeOptions: ", attributeOptions);

  const areAllAttributesSelected = () => {
    // Si los atributos no han terminado de cargar, retornar false
    if (!allAttributesLoaded) return false;

    if (!attributeOptions || attributeOptions.length === 0) return true;

    return attributeOptions.every(
      (attribute) =>
        selectedAttributes[attribute.type] &&
        selectedAttributes[attribute.type] !== "",
    );
  };

  const WHATSAPP_AGENT_NUMBER = "50672317420";

  const getPriceAtSale = useCallback(
    (productData) => {
      if (!productData) return 0;
      let calculatedPrice = 0;
      if (
        user &&
        user.role === "Revendedor" &&
        user.resellerCategory &&
        productData.resellerPrices
      ) {
        const resellerCategory = user.resellerCategory;
        const priceForCategory = productData.resellerPrices[resellerCategory];
        if (typeof priceForCategory === "number" && priceForCategory > 0) {
          calculatedPrice = priceForCategory;
        }
      }
      if (
        calculatedPrice <= 0 &&
        productData.resellerPrices &&
        typeof productData.resellerPrices.cat1 === "number" &&
        productData.resellerPrices.cat1 > 0
      ) {
        calculatedPrice = productData.resellerPrices.cat1;
      }
      return isNaN(calculatedPrice) || calculatedPrice <= 0
        ? 0
        : calculatedPrice;
    },
    [user],
  );

  // Helper functions para el agrupamiento de productos relacionados
  const groupProductsByBase = (products) => {
    const groups = {};

    products.forEach((product) => {
      const baseCode = getBaseCodeFromProductCode(product.code);

      if (!groups[baseCode]) {
        groups[baseCode] = [];
      }

      groups[baseCode].push(product);
    });

    return groups;
  };

  const getBaseCodeFromProductCode = (code) => {
    const firstUnderscoreIndex = code.indexOf("_");
    return firstUnderscoreIndex === -1
      ? code
      : code.substring(0, firstUnderscoreIndex);
  };

  const selectRandomVariantFromEachGroup = (groupedProducts) => {
    const displayProducts = [];

    for (const baseCode in groupedProducts) {
      const variants = groupedProducts[baseCode];

      if (variants.length === 1) {
        const baseName = extractBaseNameFromProduct(
          variants[0].name,
          variants[0].code,
        );
        displayProducts.push({
          ...variants[0],
          baseCode: baseCode,
          baseName: baseName,
          variantCount: 1,
        });
      } else {
        const randomIndex = Math.floor(Math.random() * variants.length);
        const selectedVariant = variants[randomIndex];

        const baseName = extractBaseNameFromProduct(
          selectedVariant.name,
          selectedVariant.code,
        );

        displayProducts.push({
          ...selectedVariant,
          baseCode: baseCode,
          baseName: baseName,
          variantCount: variants.length,
        });
      }
    }

    return displayProducts;
  };

  const extractBaseNameFromProduct = (productName, productCode) => {
    // Contar número de atributos en el código
    const attributeCount = (productCode.match(/_/g) || []).length;

    if (attributeCount === 0) {
      return productName;
    }

    // Dividir el nombre en palabras
    const words = productName.split(" ");

    // Remover la cantidad de palabras igual al número de atributos
    if (words.length > attributeCount) {
      return words.slice(0, words.length - attributeCount).join(" ");
    }

    return productName;
  };

  useEffect(() => {
    // Store the current path when component mounts
    const originalPath = location.pathname;

    return () => {
      // When component unmounts, check the new path
      setTimeout(() => {
        const currentPath = window.location.pathname;
        const isStillOnProductPage = currentPath.includes("/products/");

        // Only clear cache if we're not on any product page anymore
        if (!isStillOnProductPage) {
          const keysToRemove = [];
          for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith("attributeOptions_")) {
              keysToRemove.push(key);
            }
          }
          keysToRemove.forEach((key) => localStorage.removeItem(key));
          console.log("Cache cleared - left product pages");
        }
      }, 100); // Small delay to ensure navigation completed
    };
  }, [location.pathname]);

  useEffect(() => {
    return () => {
      // Limpiar estado cuando el componente se desmonta
      setAttributeOptions([]);
      setAvailableOptions(new Map());
      setSelectedAttributes({});
      setProductsLoaded(false);
    };
  }, []);

  // Add this useEffect to clear localStorage when navigating to a different product
  useEffect(() => {
    // Clear previous product's attribute state when switching to a new product
    if (id && id !== currentProductId) {
      // Remove the specific key for the previous product only if currentProductId exists
      if (currentProductId) {
        localStorage.removeItem(`attributeOptions_${currentProductId}`);
      }
      setCurrentProductId(id);
    }
  }, [id, currentProductId]);

  const buildAttributeOptionsFromScratch = async (
    productData,
    currentVariantAttributes,
  ) => {
    console.log("=== 🔍 INICIO CONSTRUCCIÓN ATRIBUTOS (NUEVA API) ===");
    console.log("Producto:", productData.code);
    console.log("BaseCode:", currentVariantAttributes.baseCode);

    // VERIFICAR SI ES PRODUCTO SIMPLE
    // Se elimina el early return para que los productos base
    // puedan consultar también si tienen variantes asociadas.

    setLoadingAttributes(true);
    setAllAttributesLoaded(false);

    try {
      // ✅ NUEVA LLAMADA A LA API - OBTENER TODAS LAS VARIANTES
      console.log("🔍 Buscando variantes via nuevo endpoint...");

      const token = user?.token;
      const config = token
        ? { headers: { Authorization: `Bearer ${token}` } }
        : {};

      console.log(
        "currentVariantAttributes.baseCode: ",
        currentVariantAttributes.baseCode,
      );
      const response = await axios.get(
        `${API_URL}/api/products/variants/${currentVariantAttributes.baseCode}`,
        config,
      );

      const allVariants = response.data.variants || [];
      console.log("📊 Variantes encontradas via API:", allVariants.length);

      // ✅ FILTRAR SOLO VARIANTES DE LA MISMA ESTRUCTURA (IGNORANDO STOCK)
      const validVariants = allVariants.filter((variant) => {
        const variantAttributes = extractVariantAttributes(variant.code);
        return variantAttributes.baseCode === currentVariantAttributes.baseCode;
      });

      console.log(
        "📊 Variantes válidas (con stock y misma estructura):",
        validVariants.length,
      );

      // ✅ PROCESAR LAS VARIANTES
      if (validVariants.length > 0) {
        console.log("🎯 Procesando variantes con nueva API");
        await processVariants(validVariants, currentVariantAttributes);
      } else {
        console.log("ℹ️ No hay variantes válidas con stock");
        setAttributeOptions([]);
        setAvailableOptions(new Map());
        setSelectedAttributes({});
      }

      setAllAttributesLoaded(true);
    } catch (error) {
      console.error("❌ Error con nueva API, usando fallback local:", error);

      // ✅ FALLBACK A LÓGICA ORIGINAL (por si la API falla)
      try {
        const hasActiveFilters =
          currentFilters && Object.keys(currentFilters).length > 0;
        const productsToUse = hasActiveFilters
          ? departmentalProducts
          : defaultProducts;

        if (productsToUse && productsToUse.length > 0) {
          const localVariants = productsToUse.filter((p) => {
            const attr = extractVariantAttributes(p.code);
            return (
              attr.baseCode === currentVariantAttributes.baseCode &&
              attr.attributes.length ===
                currentVariantAttributes.attributes.length
            );
          });

          if (localVariants.length > 0) {
            await processVariants(localVariants, currentVariantAttributes);
          } else {
            setAttributeOptions([]);
            setAvailableOptions(new Map());
            setSelectedAttributes({});
          }
        }
      } catch (fallbackError) {
        console.error("❌ Fallback también falló:", fallbackError);
        setAttributeOptions([]);
        setAvailableOptions(new Map());
        setSelectedAttributes({});
      }

      setAllAttributesLoaded(true);
    } finally {
      setLoadingAttributes(false);
    }
  };

  // ✅ FUNCIÓN AUXILIAR ACTUALIZADA - AGREGAR GUARDADO EN LOCALSTORAGE
  // ✅ FUNCIÓN AUXILIAR ACTUALIZADA - MANEJAR DIFERENTES NÚMEROS DE ATRIBUTOS
  const processVariants = async (variants, currentVariantAttributes) => {
    console.log("🔄 Procesando variantes:", variants.length);

    variants.sort((a, b) => a.code.localeCompare(b.code));

    const optionsMap = new Map();
    const attributeOptionsList = [];

    // Encontrar el máximo número de atributos entre todas las variantes
    const maxAttributes = Math.max(
      ...variants.map(
        (v) => extractVariantAttributes(v.code).attributes.length,
      ),
    );

    // Inicializar estructura de atributos basada en el máximo
    for (let i = 0; i < maxAttributes; i++) {
      attributeOptionsList.push({
        type: getAttributeType(i),
        values: new Set(),
      });
    }

    // Procesar cada variante
    variants.forEach((variant) => {
      const attr = extractVariantAttributes(variant.code);

      attr.attributes.forEach((value, index) => {
        if (index < attributeOptionsList.length) {
          attributeOptionsList[index].values.add(value);
        }
      });

      const optionKey = attr.attributes.join("|");
      optionsMap.set(optionKey, variant);
    });

    // Filtrar atributos que realmente tienen valores
    const finalAttributeOptions = attributeOptionsList
      .filter((opt) => opt.values.size > 0)
      .map((opt) => ({
        type: opt.type,
        values: Array.from(opt.values).sort(),
      }));

    setAttributeOptions(finalAttributeOptions);
    setAvailableOptions(optionsMap);

    // Establecer selecciones iniciales basadas en la variante actual
    const initialSelections = {};

    finalAttributeOptions.forEach((attribute, index) => {
      const currentValue = currentVariantAttributes.attributes[index];

      // Verificar si el valor actual existe en los valores disponibles
      if (currentValue && attribute.values.includes(currentValue)) {
        initialSelections[attribute.type] = currentValue;
      } else {
        // Si no existe, usar el primer valor disponible
        initialSelections[attribute.type] = attribute.values[0];
      }
    });

    setSelectedAttributes(initialSelections);

    // ✅ GUARDAR EN LOCALSTORAGE
    const cacheKey = `attributeOptions_${currentVariantAttributes.baseCode}`;
    const cacheData = {
      finalAttributeOptions,
      optionsMap: Array.from(optionsMap.entries()),
      initialSelections,
      timestamp: Date.now(),
    };

    localStorage.setItem(cacheKey, JSON.stringify(cacheData));
    console.log("✅ Atributos guardados en localStorage");
  };

  useEffect(() => {
    if (id && id !== currentProductId) {
      // Clear previous product's attribute state when switching to a new product
      if (currentProductId) {
        setAttributeOptions([]);
        setAvailableOptions(new Map());
        setSelectedAttributes({});
        setProductVariants([]);
      }
      setCurrentProductId(id);
    }
  }, [id, currentProductId]);

  useEffect(() => {
    window.scrollTo(0, 0);

    const fetchProductDetails = async () => {
      setLoadingSpecificProduct(true);
      setErrorSpecificProduct(null);
      setAllAttributesLoaded(false);

      try {
        const token = user?.token;
        const config = token
          ? { headers: { Authorization: `Bearer ${token}` } }
          : {};
        const { data } = await axios.get(
          `${API_URL}/api/products/${id}`,
          config,
        );
        setProduct(data);

        const currentVariantAttributes = extractVariantAttributes(data.code);

        // SOLO PROCESAR SI TIENE ATRIBUTOS (es variante)
        const cacheKey = `attributeOptions_${currentVariantAttributes.baseCode}`;
        const cachedData = localStorage.getItem(cacheKey);

        if (cachedData) {
          try {
            const parsedData = JSON.parse(cachedData);

            // ✅ LEER EL ESTADO DE FILTROS GUARDADO
            const savedHasActiveFilters = parsedData.hasActiveFilters;
            console.log(
              "✅ Estado de filtros cargado desde cache:",
              savedHasActiveFilters,
            );

            setAttributeOptions(parsedData.finalAttributeOptions);
            setAvailableOptions(new Map(parsedData.optionsMap));
            setSelectedAttributes(parsedData.initialSelections || {});
            setAllAttributesLoaded(true);
          } catch (error) {
            console.error("Error parsing cached data:", error);
            localStorage.removeItem(cacheKey);
            buildAttributeOptionsFromScratch(data, currentVariantAttributes);
          }
        } else {
          buildAttributeOptionsFromScratch(data, currentVariantAttributes);
        }

        // ✅ FALTABA ESTA PARTE: Cargar reviews y related products
        fetchReviews(id);

        const productsToUse = getProductsToUse();
        if (productsToUse.length > 1) {
          const filtered = productsToUse.filter((p) => p._id !== id);
          const groupedRelated = groupProductsByBase(filtered);
          const displayRelatedProducts =
            selectRandomVariantFromEachGroup(groupedRelated);
          const shuffled = [...displayRelatedProducts].sort(
            () => 0.5 - Math.random(),
          );
          setRelatedProducts(shuffled.slice(0, 3));
        }
      } catch (err) {
        setErrorSpecificProduct(
          err.response?.data?.message ||
            "Producto no encontrado o error al cargar.",
        );
        setAllAttributesLoaded(true);
      } finally {
        setLoadingSpecificProduct(false);
      }
    };

    if (id) {
      fetchProductDetails();
    }
    setQuantity(1);
  }, [id, user?.token, fetchReviews, productsLoaded]);

  // 3. Agrega un useEffect ESPECÍFICO para manejar filtros
  useEffect(() => {
    const productsToUse = getProductsToUse();
    // Si los productos cambian (por filtros) y ya teníamos un producto cargado
    if (product && productsToUse.length > 0 && productsLoaded) {
      const currentVariantAttributes = extractVariantAttributes(product.code);

      if (currentVariantAttributes.attributes.length > 0) {
        // Reconstruir las opciones con los nuevos productos filtrados
        buildAttributeOptionsFromScratch(product, currentVariantAttributes);
      }
    }
  }, [currentFilters, departmentalProducts, defaultProducts]); // Se ejecuta cuando allProductsFromContext cambia

  // Handle attribute selection change
  const handleAttributeChange = (attributeType, value) => {
    setSelectedAttributes((prev) => {
      const newSelections = { ...prev };

      // Encontrar el índice del atributo que se está cambiando
      const attributeIndex = attributeOptions.findIndex(
        (opt) => opt.type === attributeType,
      );

      // Resetear todos los atributos posteriores al que se está cambiando
      if (attributeIndex !== -1) {
        for (let i = attributeIndex + 1; i < attributeOptions.length; i++) {
          newSelections[attributeOptions[i].type] = "";
        }
      }

      // Establecer el nuevo valor para el atributo seleccionado
      newSelections[attributeType] = value;

      return newSelections;
    });
  };

  const getAvailableOptionsForAttribute = (attributeIndex) => {
    const allValues = attributeOptions[attributeIndex]?.values || [];

    // Si es el primer atributo, todas las opciones están disponibles
    if (attributeIndex === 0) {
      return allValues.map((value) => ({ value, isAvailable: true }));
    }

    // Verificar si TODOS los atributos anteriores están seleccionados
    const allPreviousSelected = attributeOptions
      .slice(0, attributeIndex)
      .every(
        (attr) =>
          selectedAttributes[attr.type] && selectedAttributes[attr.type] !== "",
      );

    // Si no todos los anteriores están seleccionados, mostrar todas como no disponibles
    if (!allPreviousSelected) {
      return allValues.map((value) => ({ value, isAvailable: false }));
    }

    // Si todos los anteriores están seleccionados, filtrar correctamente
    const availableValues = new Set();
    const currentSelections = attributeOptions.map(
      (opt) => selectedAttributes[opt.type] || "",
    );

    Array.from(availableOptions.keys()).forEach((optionKey) => {
      const values = optionKey.split("|");

      // Verificar coincidencia EXACTA con selecciones anteriores
      let matchesExactly = true;
      for (let i = 0; i < attributeIndex; i++) {
        if (currentSelections[i] !== values[i]) {
          matchesExactly = false;
          break;
        }
      }

      if (matchesExactly) {
        availableValues.add(values[attributeIndex]);
      }
    });

    return allValues.map((value) => ({
      value,
      isAvailable: availableValues.has(value),
    }));
  };

  // --- useEffect para determinar si el usuario puede dejar una reseña ---
  useEffect(() => {
    if (!user) {
      setCanReview(false);
      setReviewDisabledMessage("Inicia sesión para dejar una reseña.");
      return;
    }

    const hasReviewed = reviews.some((review) => review.user._id === user._id);
    if (hasReviewed) {
      setCanReview(false);
      setReviewDisabledMessage("Ya has dejado una reseña para este producto.");
      return;
    }

    const hasPurchased = myOrders.some((order) =>
      order.items.some((item) => item.product && item.product._id === id),
    );

    if (!hasPurchased) {
      setCanReview(false);
      setReviewDisabledMessage(
        "Debes haber comprado este producto para dejar una reseña.",
      );
      return;
    }

    setCanReview(true);
    setReviewDisabledMessage("Tu comentario (opcional)");
  }, [user, reviews, myOrders, id]);

  const getSelectedVariantFunction = () => {
    if (attributeOptions.length === 0 || !product) return product;

    const selectedValues = attributeOptions.map(
      (opt) => selectedAttributes[opt.type] || "",
    );

    // Verificar que todas las selecciones estén completas
    const allSelected = selectedValues.every((value) => value !== "");
    if (!allSelected) return product;

    const optionKey = selectedValues.join("|");
    const variant = availableOptions.get(optionKey);

    return variant || product; // Fallback al producto original si no se encuentra
  };

  const getSelectedVariant = getSelectedVariantFunction();

  const displayPrice = getPriceAtSale(getSelectedVariantFunction());
  const priceWithTax =
    getSelectedVariant && displayPrice !== null
      ? taxRegime === "simplified"
        ? Math.round(displayPrice)
        : calculatePriceWithTax(displayPrice, getSelectedVariant.iva)
      : null;

  // Update handleAddToCart to use the selected variant
  const handleAddToCart = async () => {
    if (!user) {
      navigate("/login");
      return;
    }

    const selectedVariant = getSelectedVariantFunction();

    if (!selectedVariant) {
      return;
    }
    if (quantity <= 0) {
      return;
    }

    if (quantity > selectedVariant.countInStock) {
      toast.error(`Solo ${selectedVariant.countInStock} disponibles en stock`);
      return;
    }

    const priceToPass = getPriceAtSale(selectedVariant);
    if (priceToPass <= 0) {
      return;
    }

    await addItemToCart(selectedVariant._id, quantity, priceToPass);
  };

  const handleRelatedProductAddToCart = useCallback(
    async (relatedProduct, qty) => {
      if (typeof addItemToCart !== "function") {
        return;
      }
      setAddingProductId(relatedProduct._id);
      const priceToPass = getPriceAtSale(relatedProduct);
      if (priceToPass <= 0) {
        setAddingProductId(null);
        return;
      }
      try {
        await addItemToCart(relatedProduct._id, qty, priceToPass);
      } catch (err) {
        console.log(err.message);
      } finally {
        setAddingProductId(null);
      }
    },
    [addItemToCart, getPriceAtSale],
  );

  const handleWhatsAppInquiry = () => {
    if (!product) {
      toast.error(
        "No se puede enviar la consulta, los detalles del producto no están disponibles.",
      );
      return;
    }

    let message = `¡Hola! 👋\n\nQuisiera hacer una consulta sobre el siguiente producto:\n\n`;
    message += `*Producto:* ${extractBaseProductName(product.name, product.code)}\n`;
    message += `*Código:* ${product.code}\n`;
    message += `*Precio:* ${formatPrice(displayPrice)}\n\n`;
    message += `*Mi consulta es:*\n${customerQuestion || "(Por favor, escribe tu pregunta aquí)"}\n\n`;
    message += `¡Gracias!`;

    const encodedMessage = encodeURIComponent(message);
    const whatsappLink = `https://wa.me/${WHATSAPP_AGENT_NUMBER}?text=${encodedMessage}`;

    window.open(whatsappLink, "_blank");
    setCustomerQuestion("");
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!canReview) {
      toast.info("No cumples los requisitos para dejar una reseña.");
      return;
    }
    if (newRating === 0) {
      toast.error("Por favor, selecciona una calificación de estrellas.");
      return;
    }
    try {
      await createReview({
        productId: id,
        rating: newRating,
        comment: newComment,
      });
      setNewRating(0);
      setNewComment("");
    } catch (err) {
      console.error("Fallo al enviar la reseña:", err);
    }
  };

  // FAQ Data (unchanged)
  const WHATSAPP_AGENT_NUMBER_ = "50672317420";
  const wholesaleMessage =
    "Hola, estoy interesado/a en sus precios de mayoreo y me gustaría recibir más información. Gracias.";
  const whatsappUrl = `https://wa.me/${WHATSAPP_AGENT_NUMBER_}?text=${encodeURIComponent(wholesaleMessage)}`;

  const faqData = [
    {
      question: "1. ¿Cuáles son los métodos de pago aceptados?",
      answer:
        "Aceptamos pagos a través de tarjeta de crédito o débito. Los pagos se procesan através de TiloPay una pasarela de pago establecida en Costa Rica.",
    },
    {
      question: "2. ¿Cuál es el tiempo de entrega estimado?",
      answer:
        "Para envíos dentro de la GAM, trabajamos con Mensajería Fonseca para garantizar una entrega rápida, usualmente en las siguientes 24 a 48 horas. Dependiendo de la demanda, el plazo puede extenderse. Tu entrega es nuestra prioridad y está 100% garantizada.",
    },
    {
      question: "3. ¿Son productos originales?",
      answer:
        "Absolutamente. Garantizamos que todos nuestros productos son 100% originales, nuevos y se entregan sellados en su empaque de fábrica. La autenticidad es el pilar de nuestra marca.",
    },
    {
      question: "4. ¿Realizan envíos fuera de la GAM?",
      answer:
        "Sí. Los envíos se gestionan a través de Correos de Costa Rica a todo el territorio nacional. El costo se calcula automáticamente según el peso de su pedido y su ubicación exacta.",
    },
  ];

  if (loadingSpecificProduct) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
        <Box
          sx={{
            position: "relative",
            display: "inline-flex",
            filter: "drop-shadow(0 0 6px rgba(255, 215, 0, 0.7))",
          }}
        >
          <CircularProgress
            variant="determinate"
            sx={{
              color: "rgba(255, 215, 0, 0.25)",
            }}
            size={40}
            thickness={4}
            value={100}
          />
          <CircularProgress
            variant="indeterminate"
            disableShrink
            sx={{
              color: "#FFD700",
              animationDuration: "600ms",
              position: "absolute",
              left: 0,
              "& .MuiCircularProgress-circle": {
                strokeLinecap: "round",
              },
            }}
            size={40}
            thickness={4}
          />
        </Box>
      </Box>
    );
  }

  if (errorSpecificProduct) {
    return (
      <Container maxWidth="lg" sx={{ my: 4, flexGrow: 1 }}>
        <Alert severity="error">{errorSpecificProduct}</Alert>
        <Button onClick={() => navigate("/products")} sx={{ mt: 2 }}>
          Volver a Productos
        </Button>
      </Container>
    );
  }

  if (!product) {
    return (
      <Container maxWidth="lg" sx={{ my: 4, flexGrow: 1 }}>
        <Alert severity="warning">Producto no encontrado.</Alert>
        <Button onClick={() => navigate("/products")} sx={{ mt: 2 }}>
          Volver a Productos
        </Button>
      </Container>
    );
  }

  // const selectedVariant = getSelectedVariant();
  const isOutOfStock = getSelectedVariantFunction().countInStock <= 0;
  const baseProductName = extractBaseProductName(product.name, product.code);

  const contentSectionStyle = {
    my: 5,
    p: { xs: 3, sm: 5 },
    bgcolor: "#ffffff",
    borderRadius: "32px",
    border: "1px solid rgba(0, 0, 0, 0.05)",
    boxShadow: "0 4px 20px rgba(0, 0, 0, 0.02)",
    transition: "all 0.3s ease",
    "&:hover": { boxShadow: "0 8px 30px rgba(0, 0, 0, 0.04)" },
  };

  const sectionTitleStyle = {
    fontWeight: 800,
    color: "#1A1A1A",
    mb: 4,
    fontSize: "1.5rem",
    letterSpacing: "-0.02em",
  };

  const genderMap = {
    men: "Hombre",
    women: "Mujer",
    unisex: "Unisex",
    children: "Niños",
    elderly: "Ancianos",
    other: "Otro",
  };
  const getTranslatedGender = (gender) =>
    genderMap[gender.toLowerCase()] || gender;

  const formatProductNameMultiLine = (name, maxLength) => {
    if (name.length <= maxLength) {
      return name;
    }

    const lines = [];
    let remainingText = name;

    while (remainingText.length > maxLength) {
      let breakPoint = remainingText.substring(0, maxLength).lastIndexOf(" ");
      let splitIndex = breakPoint === -1 ? maxLength : breakPoint;

      lines.push(remainingText.substring(0, splitIndex));
      remainingText = remainingText.substring(splitIndex).trim();
    }

    lines.push(remainingText);
    return lines.join("\n");
  };

  const formatDimensions = (dimensions) => {
    if (!dimensions) return "N/A";

    // Si es un objeto, convertirlo a string
    if (typeof dimensions === "object") {
      const { width, height, depth } = dimensions;
      return `${width || ""} × ${height || ""} × ${depth || ""}`.trim();
    }

    // Si ya es un string, devolverlo tal cual
    return dimensions;
  };

  // Función para formatear valores de array
  const formatArrayValue = (value) => {
    if (!value || !Array.isArray(value) || value.length === 0) return "N/A";

    return (
      <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
        {value.map((feature, index) => (
          <Box key={index} sx={{ display: "flex", alignItems: "flex-start" }}>
            <Box component="span" sx={{ mr: 1 }}>
              •
            </Box>
            <Box component="span">{feature}</Box>
          </Box>
        ))}
      </Box>
    );
  };

  const doesSelectedVariantExist = () => {
    // Si los atributos no han terminado de cargar, retornar false
    if (!allAttributesLoaded) return false;

    if (attributeOptions.length === 0) return true;

    const selectedValues = attributeOptions.map(
      (opt) => selectedAttributes[opt.type] || "",
    );

    // Verificar que todas las selecciones estén completas
    const allSelected = selectedValues.every((value) => value !== "");
    if (!allSelected) return false;

    const optionKey = selectedValues.join("|");
    return availableOptions.has(optionKey);
  };

  const getCleanText = (html) => {
    if (!html) return "";
    const clean = DOMPurify.sanitize(html, { ALLOWED_TAGS: [] }); // Remove all tags
    return clean.replace(/\s+/g, " ").trim();
  };

  return (
    <>
      <Helmet>
        <title>
          {product
            ? `${baseProductName} - Software Factory ERP`
            : "Detalle de Producto"}
        </title>
        <meta
          name="description"
          content={
            product
              ? `Compra ${baseProductName}, perfumería fina en Costa Rica. ${getCleanText(product.description).substring(0, 120)}...`
              : "Descubre nuestra colección de perfumes y cosméticos."
          }
        />
        <meta
          property="og:title"
          content={product ? baseProductName : "Look & Smell"}
        />
        <meta
          property="og:description"
          content={
            product
              ? getCleanText(product.description).substring(0, 120)
              : "Tu tienda de confianza."
          }
        />
        <meta
          property="og:image"
          content={product?.imageUrls?.[0]?.secure_url}
        />
      </Helmet>

      <Container
        maxWidth="lg"
        sx={{
          position: "relative",
          minHeight: "100vh",
          pb: 8,
          bgcolor: "#ffffff",
        }}
      >
        <Box sx={{ mb: 3 }}>
          {/* <Button
            variant="contained" startIcon={<ArrowBackIcon />}
            onClick={() => navigate('/products')}
            sx={{
              borderRadius: 8,
              px: 5,
              py: 1.5,
              transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
              background: '#263C5C',
              '&:hover': {
                transform: 'translateY(-3px)',
                backgroundColor: '#0a2650ff',
              },
              '&:active': {
                transform: 'translateY(0)',
              },
              fontWeight: 700,
              fontSize: { xs: '1rem', sm: '1.1rem' }
            }}
          >
            Volver a Productos
          </Button> */}
        </Box>

        <Grid
          container
          spacing={{ xs: 3, sm: 6, md: 8 }}
          sx={{ alignItems: "flex-start" }}
        >
          <Grid item xs={12} sm={6}>
            <ProductImageCarousel
              imageUrls={getSelectedVariantFunction().imageUrls}
              productName={baseProductName}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <Box sx={{ p: { xs: 0, md: 2 } }}>
              <Typography
                variant="h3"
                component="h1"
                gutterBottom
                sx={{
                  fontWeight: 900,
                  color: "#1A1A1A",
                  fontSize: { xs: "2.2rem", md: "3rem" },
                  lineHeight: 1.1,
                  letterSpacing: "-0.04em",
                  mb: 1,
                }}
              >
                {baseProductName}
              </Typography>
              <Typography
                variant="h6"
                sx={{
                  mb: 3,
                  color: "#666",
                  fontWeight: 500,
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  fontSize: "0.9rem",
                }}
              >
                {product.brand || "Premium Collection"}
              </Typography>
              <Divider sx={{ my: 2 }} />

              {!loadingAttributes &&
              attributeOptions &&
              attributeOptions.length > 0 ? (
                attributeOptions.map((attribute, index) => {
                  // MOSTRAR LOADING SI LOS ATRIBUTOS NO HAN TERMINADO DE CARGAR
                  if (!allAttributesLoaded) {
                    return (
                      <Box key={index} sx={{ mb: 3 }}>
                        <Typography variant="body2" sx={{ mb: 2 }}>
                          Cargando...
                        </Typography>
                        <CircularProgress size={20} />
                      </Box>
                    );
                  }

                  const options = getAvailableOptionsForAttribute(index) || [];
                  const isLastAttribute = index === attributeOptions.length - 1;

                  return (
                    <Box key={index} sx={{ mb: 3 }}>
                      <Typography
                        variant="body2"
                        sx={{
                          display: "block",
                          fontWeight: "bold",
                          color: "grey.800",
                          mb: 2,
                          textTransform: "uppercase",
                          letterSpacing: "0.05em",
                        }}
                      ></Typography>
                      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                        {options.map((option, optionIndex) => {
                          const isSelected =
                            selectedAttributes[attribute.type] === option.value;
                          const isAvailable = option.isAvailable;
                          return (
                            <Button
                              key={optionIndex}
                              variant="outlined"
                              onClick={() =>
                                handleAttributeChange(
                                  attribute.type,
                                  option.value,
                                )
                              }
                              disabled={!isAvailable || !allAttributesLoaded}
                              sx={{
                                px: 3,
                                py: 1.5,
                                borderRadius: 2,
                                fontSize: "0.875rem",
                                fontWeight: "bold",
                                minWidth: "60px",
                                transition: "all 0.3s ease",
                                transform: "scale(1)",
                                "&:hover": {
                                  transform: "scale(1.05)",
                                  ...(!isSelected && {
                                    bgcolor: "primary.50",
                                    color: "primary.700",
                                    borderColor: "primary.300",
                                  }),
                                },
                                "&:active": {
                                  transform: "scale(0.95)",
                                },
                                ...(isSelected && {
                                  background:
                                    "linear-gradient(90deg, #A855F7 0%, #F72585 100%) !important",
                                  color: "white",
                                  border: "none",
                                  boxShadow:
                                    "0 8px 20px rgba(168, 85, 247, 0.3)",
                                  fontWeight: "900",
                                  "&:hover": {
                                    opacity: 0.9,
                                    transform: "scale(1.05)",
                                  },
                                }),
                                ...(!isSelected && {
                                  bgcolor: "white",
                                  color: "#000000",
                                  borderColor: "rgba(0,0,0,0.1)",
                                  fontWeight: "400",
                                }),
                                ...(isLastAttribute &&
                                  !option.isAvailable && {
                                    bgcolor: "grey.100",
                                    color: "grey.500",
                                    borderColor: "grey.300",
                                    cursor: "not-allowed",
                                    opacity: 0.7,
                                  }),
                                // ESTILO ADICIONAL MIENTRAS LOS ATRIBUTOS SE CARGAN
                                ...(!allAttributesLoaded && {
                                  opacity: 0.6,
                                  cursor: "not-allowed",
                                }),
                              }}
                            >
                              {option.value.replace(/-/g, " ")}
                            </Button>
                          );
                        })}
                      </Box>
                    </Box>
                  );
                })
              ) : loadingAttributes ? (
                // MOSTRAR LOADING SOLO SI ESTÁ CARGANDO Y ES VARIANTE
                <Box sx={{ mb: 3 }}>
                  <Typography variant="body2" sx={{ mb: 2 }}>
                    Cargando...
                  </Typography>
                  <CircularProgress size={20} />
                </Box>
              ) : null}

              <Box sx={{ mb: 4 }}>
                <Typography
                  variant="h4"
                  sx={{ mb: 1, fontWeight: 900, color: "#263C5C" }}
                >
                  {priceWithTax !== null
                    ? formatPrice(priceWithTax)
                    : "Precio no disponible"}
                </Typography>
                {taxRegime !== "simplified" && (
                  <Typography
                    variant="body2"
                    sx={{ color: "#999", fontWeight: 500 }}
                  >
                    IVA INCLUIDO
                  </Typography>
                )}
              </Box>

              <Typography
                variant="body1"
                sx={{
                  mb: 4,
                  fontWeight: 600,
                  color: isOutOfStock ? "#ef4444" : "#22c55e",
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                }}
              >
                <Box
                  sx={{
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    bgcolor: isOutOfStock ? "#ef4444" : "#22c55e",
                  }}
                />
                {isOutOfStock
                  ? "Agotado"
                  : `${getSelectedVariantFunction().countInStock} unidades disponibles`}
              </Typography>

              <Box display="flex" alignItems="center" gap={2}>
                <Box
                  display="flex"
                  alignItems="center"
                  sx={{
                    bgcolor: "#f8f8f8",
                    borderRadius: "12px",
                    p: 0.5,
                    border: "1px solid rgba(0,0,0,0.05)",
                  }}
                >
                  <IconButton
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    disabled={quantity <= 1 || cartLoading || isOutOfStock}
                    size="small"
                  >
                    <RemoveCircleOutlineIcon fontSize="small" />
                  </IconButton>
                  <Typography
                    sx={{ width: "3ch", textAlign: "center", fontWeight: 700 }}
                  >
                    {quantity}
                  </Typography>
                  <IconButton
                    onClick={() =>
                      setQuantity((q) => Math.min(product.countInStock, q + 1))
                    }
                    disabled={
                      quantity >= product.countInStock ||
                      cartLoading ||
                      isOutOfStock
                    }
                    size="small"
                  >
                    <AddCircleOutlineIcon fontSize="small" />
                  </IconButton>
                </Box>
                <Button
                  variant="contained"
                  fullWidth
                  startIcon={
                    cartLoading ? (
                      <CircularProgress size={20} color="inherit" />
                    ) : (
                      <ShoppingCartIcon />
                    )
                  }
                  onClick={handleAddToCart}
                  disabled={
                    cartLoading ||
                    isOutOfStock ||
                    quantity > product.countInStock ||
                    displayPrice <= 0 ||
                    !areAllAttributesSelected() ||
                    !doesSelectedVariantExist()
                  }
                  sx={{
                    borderRadius: "16px",
                    textTransform: "none",
                    py: 2,
                    fontSize: "1rem",
                    fontWeight: 800,
                    background: "#F9C908",
                    color: "#ffffff",
                    boxShadow: "0 8px 20px rgba(249, 201, 8, 0.3)",
                    "&:hover": {
                      background: "#E5B807",
                      boxShadow: "0 12px 25px rgba(249, 201, 8, 0.4)",
                      transform: "translateY(-2px)",
                    },
                    "&:disabled": {
                      background: "#f0f0f0",
                      color: "#bbb",
                    },
                    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                  }}
                >
                  {isExtraSmallMobile ? "" : "Añadir al Carrito"}
                </Button>
              </Box>
            </Box>
          </Grid>
        </Grid>

        <Box sx={contentSectionStyle}>
          <Typography
            variant="h5"
            component="h2"
            gutterBottom
            sx={sectionTitleStyle}
          >
            Descripción del Producto
          </Typography>
          {/* <Typography variant="body1" color="text.primary" sx={{ lineHeight: 1.7 }}>{product.description || 'No hay descripción detallada disponible para este producto.'}</Typography> */}
          <HTMLContent
            html={getSelectedVariantFunction().description}
            fallback="No hay descripción detallada disponible para este producto."
            variant="body1"
            color="text.primary"
            sx={{ lineHeight: 1.7 }}
          />

          {/* --- 4. NUEVA SECCIÓN DE CONSULTA POR WHATSAPP --- */}
          <Card sx={{ ...contentSectionStyle, mt: 5 }}>
            <CardContent>
              <Typography
                variant="h5"
                component="h2"
                gutterBottom
                sx={sectionTitleStyle}
              >
                ¿Tienes alguna consulta?
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                Escríbenos directamente a WhatsApp y te ayudaremos con gusto.
              </Typography>
              <TextField
                label="Escribe tu pregunta aquí..."
                multiline
                rows={3}
                fullWidth
                variant="outlined"
                value={customerQuestion}
                onChange={(e) => setCustomerQuestion(e.target.value)}
                sx={{ mb: 2 }}
              />
              <Button
                variant="contained"
                color="success"
                startIcon={<WhatsAppIcon />}
                onClick={handleWhatsAppInquiry}
                sx={{
                  py: 1.5,
                  fontWeight: "bold",
                  borderRadius: "8px",
                  bgcolor: "#25D366",
                  "&:hover": {
                    bgcolor: "#1EBE57",
                  },
                }}
              >
                Consultar por WhatsApp
              </Button>
            </CardContent>
          </Card>
        </Box>

        <Box sx={contentSectionStyle}>
          <Typography variant="h5" sx={sectionTitleStyle}>
            Especificaciones
          </Typography>
          <Box
            sx={{
              mt: 3,
              border: "1px solid rgba(0,0,0,0.06)",
              borderRadius: "24px",
              overflow: "hidden",
            }}
          >
            {[
              { label: "Código", value: getSelectedVariantFunction().code },
              { label: "Volumen", value: getSelectedVariantFunction().volume },
              { label: "Género", value: getSelectedVariantFunction().gender },
              {
                label: "Colores",
                value: getSelectedVariantFunction().colors,
                isArray: true,
              },
              {
                label: "Tamaños",
                value: getSelectedVariantFunction().sizes,
                isArray: true,
              },
              {
                label: "Materiales",
                value: getSelectedVariantFunction().materials,
                isArray: true,
              },
              {
                label: "Rango de edad",
                value: getSelectedVariantFunction().ageRange,
              },
              {
                label: "Características",
                value: getSelectedVariantFunction().features,
                isArray: true,
              },
              { label: "Voltaje", value: getSelectedVariantFunction().voltage },
              {
                label: "Garantía",
                value: getSelectedVariantFunction().warranty,
              },
              {
                label: "Incluye baterías",
                value:
                  getSelectedVariantFunction().includesBatteries !== undefined
                    ? getSelectedVariantFunction().includesBatteries
                      ? "Sí"
                      : "No"
                    : null,
              },
              {
                label: "Tipo de batería",
                value: getSelectedVariantFunction().batteryType,
              },
              {
                label: "Dimensiones",
                value: formatDimensions(
                  getSelectedVariantFunction().dimensions,
                ),
              },
              { label: "Peso", value: getSelectedVariantFunction().weight },
              {
                label: "Ubicación",
                value: getSelectedVariantFunction().recommendedLocation,
              },
              {
                label: "Categoría",
                value: getSelectedVariantFunction().category,
              },
              { label: "Marca", value: getSelectedVariantFunction().brand },
            ]
              .filter((spec) => spec.value)
              .map((spec, idx) => (
                <Box
                  key={idx}
                  sx={{
                    display: "flex",
                    flexDirection: { xs: "column", sm: "row" },
                    bgcolor: idx % 2 === 0 ? "#ffffff" : "#fcfcfc",
                    borderBottom:
                      idx === 16 ? "none" : "1px solid rgba(0,0,0,0.04)",
                    "&:last-child": { borderBottom: "none" },
                  }}
                >
                  <Box
                    sx={{
                      flex: { xs: "none", sm: "0 0 30%" },
                      p: 2.5,
                      bgcolor: {
                        xs: idx % 2 === 0 ? "#f9f9f9" : "#f4f4f4",
                        sm: "transparent",
                      },
                      borderRight: { sm: "1px solid rgba(0,0,0,0.04)" },
                      display: "flex",
                      alignItems: "center",
                    }}
                  >
                    <Typography
                      variant="subtitle2"
                      sx={{
                        fontWeight: 800,
                        color: "#666",
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                        fontSize: "0.7rem",
                      }}
                    >
                      {spec.label}
                    </Typography>
                  </Box>
                  <Box
                    sx={{
                      flex: 1,
                      p: 2.5,
                      display: "flex",
                      alignItems: "center",
                    }}
                  >
                    <Typography
                      variant="body1"
                      sx={{
                        color: "#1A1A1A",
                        fontWeight: 500,
                        lineHeight: 1.5,
                      }}
                    >
                      {spec.isArray ? formatArrayValue(spec.value) : spec.value}
                    </Typography>
                  </Box>
                </Box>
              ))}
          </Box>
        </Box>

        {getSelectedVariantFunction().tags &&
          getSelectedVariantFunction().tags.length > 0 && (
            <Box sx={contentSectionStyle}>
              <Typography variant="h5" sx={sectionTitleStyle}>
                Notas Aromáticas
              </Typography>
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1.5 }}>
                {product.tags.map((tagItem, tagIndex) => (
                  <Box
                    key={tagIndex}
                    sx={{
                      px: 3,
                      py: 1,
                      borderRadius: "50px",
                      bgcolor: "#f0f4f8",
                      color: "#263C5C",
                      fontWeight: 700,
                      fontSize: "0.85rem",
                      border: "1px solid rgba(38, 60, 92, 0.1)",
                    }}
                  >
                    {tagItem}
                  </Box>
                ))}
              </Box>
            </Box>
          )}

        {/* --- 4. NUEVA SECCIÓN DE PREGUNTAS FRECUENTES (FAQ) --- */}
        <Box sx={contentSectionStyle}>
          <Typography variant="h5" sx={sectionTitleStyle}>
            Preguntas Frecuentes
          </Typography>
          <Box sx={{ mt: 2 }}>
            {faqData.map((faq, index) => (
              <Accordion
                key={index}
                sx={{
                  backgroundColor: "transparent",
                  boxShadow: "none",
                  borderBottom: "1px solid rgba(0,0,0,0.05)",
                  "&:before": { display: "none" },
                  "&.Mui-expanded": { margin: 0 },
                  py: 1,
                }}
              >
                <AccordionSummary
                  expandIcon={<ExpandMoreIcon sx={{ color: "#263C5C" }} />}
                  sx={{ px: 0, "& .MuiAccordionSummary-content": { my: 2 } }}
                >
                  <Typography
                    sx={{
                      fontWeight: 700,
                      color: "#1A1A1A",
                      fontSize: "1.05rem",
                    }}
                  >
                    {faq.question}
                  </Typography>
                </AccordionSummary>
                <AccordionDetails sx={{ px: 0, pb: 3 }}>
                  <Typography
                    variant="body1"
                    sx={{ color: "#666", lineHeight: 1.8 }}
                  >
                    {faq.answer}
                  </Typography>
                </AccordionDetails>
              </Accordion>
            ))}
          </Box>
        </Box>

        {/* --- SECCIÓN DE CALIFICACIONES Y RESEÑAS ACTUALIZADA --- */}
        <Box sx={contentSectionStyle}>
          <Typography variant="h5" sx={sectionTitleStyle}>
            Calificaciones y Reseñas
          </Typography>
          {reviews.length > 0 && (
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                mb: 6,
                p: 4,
                bgcolor: "#f8f8f8",
                borderRadius: "24px",
                border: "1px solid rgba(0,0,0,0.03)",
              }}
            >
              <Typography
                variant="h2"
                sx={{
                  mr: 3,
                  fontWeight: 900,
                  color: "#1A1A1A",
                  letterSpacing: "-0.04em",
                }}
              >
                {product.averageRating.toFixed(1)}
              </Typography>
              <Box>
                <Rating
                  value={product.averageRating}
                  precision={0.5}
                  readOnly
                  sx={{ mb: 0.5, color: "#F9C908" }}
                />
                <Typography
                  variant="body2"
                  sx={{ color: "#666", fontWeight: 500 }}
                >
                  Basado en {product.numReviews} reseñas de clientes
                </Typography>
              </Box>
            </Box>
          )}

          {reviewsLoading ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
              <CircularProgress size={30} />
            </Box>
          ) : reviews.length === 0 ? (
            <Typography
              variant="body1"
              sx={{ color: "#999", py: 4, textAlign: "center" }}
            >
              Aún no hay reseñas para este producto.
            </Typography>
          ) : (
            <List disablePadding>
              {reviews.map((review, index) => (
                <React.Fragment key={review._id}>
                  <ListItem
                    disableGutters
                    alignItems="flex-start"
                    sx={{ py: 4 }}
                  >
                    <Avatar
                      sx={{
                        bgcolor: "#263C5C",
                        width: 48,
                        height: 48,
                        mr: 2,
                        fontWeight: 700,
                      }}
                    >
                      {review.user.firstName
                        ? review.user.firstName.charAt(0)
                        : "?"}
                    </Avatar>
                    <ListItemText
                      primary={
                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            mb: 1,
                          }}
                        >
                          <Typography
                            variant="subtitle1"
                            sx={{ fontWeight: 800, color: "#1A1A1A" }}
                          >
                            {review.user.firstName || "Usuario"}{" "}
                            {review.user.lastName || ""}
                          </Typography>
                          <Typography
                            variant="caption"
                            sx={{ color: "#999", fontWeight: 500 }}
                          >
                            {new Date(review.createdAt).toLocaleDateString(
                              "es-CR",
                              {
                                day: "numeric",
                                month: "long",
                                year: "numeric",
                              },
                            )}
                          </Typography>
                        </Box>
                      }
                      secondary={
                        <Box>
                          <Rating
                            value={review.rating}
                            readOnly
                            size="small"
                            sx={{ mb: 1.5, color: "#F9C908" }}
                          />
                          <Typography
                            variant="body1"
                            sx={{
                              color: "#444",
                              lineHeight: 1.8,
                              fontSize: "1rem",
                            }}
                          >
                            {review.comment}
                          </Typography>
                        </Box>
                      }
                    />
                  </ListItem>
                  {index < reviews.length - 1 && (
                    <Divider sx={{ borderColor: "rgba(0,0,0,0.05)" }} />
                  )}
                </React.Fragment>
              ))}
            </List>
          )}

          {user && (
            <Box
              component="form"
              onSubmit={handleReviewSubmit}
              sx={{
                mt: 8,
                p: 4,
                bgcolor: "#fdfdfd",
                borderRadius: "24px",
                border: "1px solid rgba(0,0,0,0.02)",
              }}
            >
              <Typography variant="h6" sx={{ mb: 3, fontWeight: 800 }}>
                Comparte tu experiencia
              </Typography>
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle2" sx={{ mb: 1, color: "#666" }}>
                  Tu calificación
                </Typography>
                <Rating
                  name="new-rating"
                  value={newRating}
                  onChange={(event, newValue) => {
                    setNewRating(newValue);
                  }}
                  readOnly={!canReview}
                  size="large"
                  sx={{ color: "#F9C908" }}
                />
              </Box>
              <TextField
                placeholder={reviewDisabledMessage}
                multiline
                rows={4}
                fullWidth
                variant="outlined"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                disabled={!canReview}
                sx={{
                  mb: 3,
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "16px",
                    bgcolor: "#ffffff",
                  },
                }}
              />
              <Button
                type="submit"
                variant="contained"
                disabled={!canReview || reviewsLoading}
                sx={{
                  backgroundColor: "#263C5C",
                  py: 1.5,
                  px: 4,
                  borderRadius: "12px",
                  textTransform: "none",
                  fontWeight: 700,
                  "&:hover": {
                    backgroundColor: "#1E2F4A",
                    transform: "translateY(-2px)",
                  },
                }}
              >
                {reviewsLoading ? "Enviando..." : "Publicar Reseña"}
              </Button>
            </Box>
          )}
        </Box>

        {relatedProducts.length > 0 && (
          <Box sx={{ ...contentSectionStyle, textAlign: "center" }}>
            <Typography
              variant="h5"
              sx={{ ...sectionTitleStyle, textAlign: "center", mb: 6 }}
            >
              Productos Relacionados
            </Typography>
            <Grid container spacing={4} justifyContent="center">
              {relatedProducts.map((p) => (
                <Grid item key={p._id} xs={12} sm={6} md={3}>
                  <ProductCard
                    product={{
                      ...p,
                      name: p.baseName || p.name,
                      variantCount: p.variantCount,
                    }}
                    onAddToCart={() => handleRelatedProductAddToCart(p, 1)}
                    isAdding={addingProductId === p._id}
                  />
                </Grid>
              ))}
            </Grid>
          </Box>
        )}
        {relatedProducts.length === 0 && !loadingSpecificProduct && (
          <Box sx={{ ...contentSectionStyle, textAlign: "center", py: 8 }}>
            <Typography variant="body1" sx={{ color: "#999" }}>
              No se encontraron productos relacionados.
            </Typography>
          </Box>
        )}
      </Container>
    </>
  );
};

export default ProductDetailsPage;
