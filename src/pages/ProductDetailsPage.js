import React, { useState, useEffect, useCallback } from 'react';
import DOMPurify from 'dompurify';
import {
  Container, Box, Typography, Button, Grid, CircularProgress, Alert, Card, CardContent,
  TextField, Link as MuiLink, IconButton, useTheme, Divider, Paper, Chip, useMediaQuery,
  Accordion, AccordionSummary, AccordionDetails, Rating, List, ListItem, Avatar, ListItemText,
  ToggleButtonGroup, ToggleButton, Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
} from '@mui/material';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { Helmet } from 'react-helmet-async';
import { useParams, useNavigate } from 'react-router-dom';
import { useProducts } from '../contexts/ProductContext';
import { useDepartmental } from '../contexts/DepartmentalContext';
import { useOrders } from '../contexts/OrderContext';
import { useAuth } from '../contexts/AuthContext';
import { useReviews } from '../contexts/ReviewContext';
import { toast } from 'react-toastify';
import ProductImageCarousel from '../components/product/ProductImageCarousel';
import ProductCard from '../components/product/ProductCard';
import axios from 'axios';
import API_URL from '../config';
import { formatPrice } from '../utils/formatters';
import { calculatePriceWithTax } from '../utils/taxCalculations';
import { useConfig } from '../contexts/ConfigContext';
import { useLocation } from 'react-router-dom';


const HTMLContent = ({
  html,
  fallback = 'No description available.',
  ...typographyProps
}) => {
  const createMarkup = (htmlContent) => {
    return { __html: DOMPurify.sanitize(htmlContent || '') };
  };

  if (!html || html.trim() === '') {
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
  if (!code || !code.includes('_')) return name;

  // Contar número de atributos en el código
  const attributeCount = (code.match(/_/g) || []).length;
  if (attributeCount === 0) return name;

  // Dividir el nombre en palabras y remover la cantidad de atributos
  const words = name.split(' ');
  if (words.length > attributeCount) {
    return words.slice(0, words.length - attributeCount).join(' ');
  }

  return name;
};

// Helper function to extract all variant attributes from product code
const extractVariantAttributes = (code) => {
  const firstUnderscoreIndex = code.indexOf('_');
  if (firstUnderscoreIndex === -1) {
    return { baseCode: code, attributes: [] };
  }

  const baseCode = code.substring(0, firstUnderscoreIndex);
  const attributesPart = code.substring(firstUnderscoreIndex + 1);
  const attributes = attributesPart.split('_');

  return { baseCode, attributes };
};

// Helper function to get attribute type based on position (generic approach)
const getAttributeType = (index) => {
  const attributeTypes = ['color', 'size', 'model', 'type', 'material'];
  return attributeTypes[index] || `attribute_${index + 1}`;
};


const ProductDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const isExtraSmallMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const { products: defaultProducts } = useProducts();
  const { departmentalProducts, currentFilters } = useDepartmental();
  const { addItemToCart, loading: cartLoading, myOrders } = useOrders();
  const { user } = useAuth();
  const { taxRegime } = useConfig();

  const { reviews, loading: reviewsLoading, fetchReviews, createReview } = useReviews();

  const [product, setProduct] = useState(null);
  const [loadingSpecificProduct, setLoadingSpecificProduct] = useState(true);
  const [errorSpecificProduct, setErrorSpecificProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [addingProductId, setAddingProductId] = useState(null);
  const [customerQuestion, setCustomerQuestion] = useState('');
  const [newRating, setNewRating] = useState(0);
  const [newComment, setNewComment] = useState('');
  const [canReview, setCanReview] = useState(false);
  const [reviewDisabledMessage, setReviewDisabledMessage] = useState('');
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

          console.log('🔍 Usando estado de filtros desde cache:', savedHasActiveFilters);
          return savedHasActiveFilters ? departmentalProducts : defaultProducts;
        } catch (error) {
          console.error('Error reading cache for filters:', error);
        }
      }
    }

    // ✅ FALLBACK: lógica original si no hay cache
    const hasActiveFilters = currentFilters && Object.keys(currentFilters).length > 0;
    console.log('🔍 Usando estado de filtros actual:', hasActiveFilters);
    return hasActiveFilters ? departmentalProducts : defaultProducts;
  };

  console.log("attributeOptions: ", attributeOptions)

  const areAllAttributesSelected = () => {
    // Si los atributos no han terminado de cargar, retornar false
    if (!allAttributesLoaded) return false;

    if (!attributeOptions || attributeOptions.length === 0) return true;

    return attributeOptions.every(attribute =>
      selectedAttributes[attribute.type] && selectedAttributes[attribute.type] !== ''
    );
  };

  const WHATSAPP_AGENT_NUMBER = '50672317420';

  const getPriceAtSale = useCallback((productData) => {
    if (!productData) return 0;
    let calculatedPrice = 0;
    if (user && user.role === 'Revendedor' && user.resellerCategory && productData.resellerPrices) {
      const resellerCategory = user.resellerCategory;
      const priceForCategory = productData.resellerPrices[resellerCategory];
      if (typeof priceForCategory === 'number' && priceForCategory > 0) {
        calculatedPrice = priceForCategory;
      }
    }
    if (calculatedPrice <= 0 && productData.resellerPrices && typeof productData.resellerPrices.cat1 === 'number' && productData.resellerPrices.cat1 > 0) {
      calculatedPrice = productData.resellerPrices.cat1;
    }
    return isNaN(calculatedPrice) || calculatedPrice <= 0 ? 0 : calculatedPrice;
  }, [user]);

  // Helper functions para el agrupamiento de productos relacionados
  const groupProductsByBase = (products) => {
    const groups = {};

    products.forEach(product => {
      const baseCode = getBaseCodeFromProductCode(product.code);

      if (!groups[baseCode]) {
        groups[baseCode] = [];
      }

      groups[baseCode].push(product);
    });

    return groups;
  };

  const getBaseCodeFromProductCode = (code) => {
    const firstUnderscoreIndex = code.indexOf('_');
    return firstUnderscoreIndex === -1 ? code : code.substring(0, firstUnderscoreIndex);
  };

  const selectRandomVariantFromEachGroup = (groupedProducts) => {
    const displayProducts = [];

    for (const baseCode in groupedProducts) {
      const variants = groupedProducts[baseCode];

      if (variants.length === 1) {
        const baseName = extractBaseNameFromProduct(variants[0].name, variants[0].code);
        displayProducts.push({
          ...variants[0],
          baseCode: baseCode,
          baseName: baseName,
          variantCount: 1
        });
      } else {
        const randomIndex = Math.floor(Math.random() * variants.length);
        const selectedVariant = variants[randomIndex];

        const baseName = extractBaseNameFromProduct(selectedVariant.name, selectedVariant.code);

        displayProducts.push({
          ...selectedVariant,
          baseCode: baseCode,
          baseName: baseName,
          variantCount: variants.length
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
    const words = productName.split(' ');

    // Remover la cantidad de palabras igual al número de atributos
    if (words.length > attributeCount) {
      return words.slice(0, words.length - attributeCount).join(' ');
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
        const isStillOnProductPage = currentPath.includes('/products/');

        // Only clear cache if we're not on any product page anymore
        if (!isStillOnProductPage) {
          const keysToRemove = [];
          for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith('attributeOptions_')) {
              keysToRemove.push(key);
            }
          }
          keysToRemove.forEach(key => localStorage.removeItem(key));
          console.log('Cache cleared - left product pages');
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


  const buildAttributeOptionsFromScratch = async (productData, currentVariantAttributes) => {
    console.log('=== 🔍 INICIO CONSTRUCCIÓN ATRIBUTOS (NUEVA API) ===');
    console.log('Producto:', productData.code);
    console.log('BaseCode:', currentVariantAttributes.baseCode);

    // VERIFICAR SI ES PRODUCTO SIMPLE
    // Se elimina el early return para que los productos base 
    // puedan consultar también si tienen variantes asociadas.

    setLoadingAttributes(true);
    setAllAttributesLoaded(false);

    try {
      // ✅ NUEVA LLAMADA A LA API - OBTENER TODAS LAS VARIANTES
      console.log('🔍 Buscando variantes via nuevo endpoint...');

      const token = user?.token;
      const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};

      console.log("currentVariantAttributes.baseCode: ", currentVariantAttributes.baseCode)
      const response = await axios.get(
        `${API_URL}/api/products/variants/${currentVariantAttributes.baseCode}`,
        config
      );

      const allVariants = response.data.variants || [];
      console.log('📊 Variantes encontradas via API:', allVariants.length);

      // ✅ FILTRAR SOLO VARIANTES DE LA MISMA ESTRUCTURA (IGNORANDO STOCK)
      const validVariants = allVariants.filter(variant => {
        const variantAttributes = extractVariantAttributes(variant.code);
        return variantAttributes.baseCode === currentVariantAttributes.baseCode;
      });

      console.log('📊 Variantes válidas (con stock y misma estructura):', validVariants.length);

      // ✅ PROCESAR LAS VARIANTES
      if (validVariants.length > 0) {
        console.log('🎯 Procesando variantes con nueva API');
        await processVariants(validVariants, currentVariantAttributes);
      } else {
        console.log('ℹ️ No hay variantes válidas con stock');
        setAttributeOptions([]);
        setAvailableOptions(new Map());
        setSelectedAttributes({});
      }

      setAllAttributesLoaded(true);

    } catch (error) {
      console.error('❌ Error con nueva API, usando fallback local:', error);

      // ✅ FALLBACK A LÓGICA ORIGINAL (por si la API falla)
      try {
        const hasActiveFilters = currentFilters && Object.keys(currentFilters).length > 0;
        const productsToUse = hasActiveFilters ? departmentalProducts : defaultProducts;

        if (productsToUse && productsToUse.length > 0) {
          const localVariants = productsToUse.filter(p => {
            const attr = extractVariantAttributes(p.code);
            return attr.baseCode === currentVariantAttributes.baseCode &&
              attr.attributes.length === currentVariantAttributes.attributes.length;
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
        console.error('❌ Fallback también falló:', fallbackError);
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
    console.log('🔄 Procesando variantes:', variants.length);

    variants.sort((a, b) => a.code.localeCompare(b.code));

    const optionsMap = new Map();
    const attributeOptionsList = [];

    // Encontrar el máximo número de atributos entre todas las variantes
    const maxAttributes = Math.max(...variants.map(v =>
      extractVariantAttributes(v.code).attributes.length
    ));

    // Inicializar estructura de atributos basada en el máximo
    for (let i = 0; i < maxAttributes; i++) {
      attributeOptionsList.push({
        type: getAttributeType(i),
        values: new Set()
      });
    }

    // Procesar cada variante
    variants.forEach(variant => {
      const attr = extractVariantAttributes(variant.code);

      attr.attributes.forEach((value, index) => {
        if (index < attributeOptionsList.length) {
          attributeOptionsList[index].values.add(value);
        }
      });

      const optionKey = attr.attributes.join('|');
      optionsMap.set(optionKey, variant);
    });

    // Filtrar atributos que realmente tienen valores
    const finalAttributeOptions = attributeOptionsList
      .filter(opt => opt.values.size > 0)
      .map(opt => ({
        type: opt.type,
        values: Array.from(opt.values).sort()
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
      timestamp: Date.now()
    };

    localStorage.setItem(cacheKey, JSON.stringify(cacheData));
    console.log('✅ Atributos guardados en localStorage');
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
        const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
        const { data } = await axios.get(`${API_URL}/api/products/${id}`, config);
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
            console.log('✅ Estado de filtros cargado desde cache:', savedHasActiveFilters);

            setAttributeOptions(parsedData.finalAttributeOptions);
            setAvailableOptions(new Map(parsedData.optionsMap));
            setSelectedAttributes(parsedData.initialSelections || {});
            setAllAttributesLoaded(true);
          } catch (error) {
            console.error('Error parsing cached data:', error);
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
          const filtered = productsToUse.filter(p => p._id !== id);
          const groupedRelated = groupProductsByBase(filtered);
          const displayRelatedProducts = selectRandomVariantFromEachGroup(groupedRelated);
          const shuffled = [...displayRelatedProducts].sort(() => 0.5 - Math.random());
          setRelatedProducts(shuffled.slice(0, 3));
        }

      } catch (err) {
        setErrorSpecificProduct(err.response?.data?.message || 'Producto no encontrado o error al cargar.');
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
    setSelectedAttributes(prev => {
      const newSelections = { ...prev };

      // Encontrar el índice del atributo que se está cambiando
      const attributeIndex = attributeOptions.findIndex(opt => opt.type === attributeType);

      // Resetear todos los atributos posteriores al que se está cambiando
      if (attributeIndex !== -1) {
        for (let i = attributeIndex + 1; i < attributeOptions.length; i++) {
          newSelections[attributeOptions[i].type] = '';
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
      return allValues.map(value => ({ value, isAvailable: true }));
    }

    // Verificar si TODOS los atributos anteriores están seleccionados
    const allPreviousSelected = attributeOptions
      .slice(0, attributeIndex)
      .every(attr => selectedAttributes[attr.type] && selectedAttributes[attr.type] !== '');

    // Si no todos los anteriores están seleccionados, mostrar todas como no disponibles
    if (!allPreviousSelected) {
      return allValues.map(value => ({ value, isAvailable: false }));
    }

    // Si todos los anteriores están seleccionados, filtrar correctamente
    const availableValues = new Set();
    const currentSelections = attributeOptions.map(opt => selectedAttributes[opt.type] || '');

    Array.from(availableOptions.keys()).forEach(optionKey => {
      const values = optionKey.split('|');

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

    return allValues.map(value => ({
      value,
      isAvailable: availableValues.has(value)
    }));
  };

  // --- useEffect para determinar si el usuario puede dejar una reseña ---
  useEffect(() => {
    if (!user) {
      setCanReview(false);
      setReviewDisabledMessage('Inicia sesión para dejar una reseña.');
      return;
    }

    const hasReviewed = reviews.some(review => review.user._id === user._id);
    if (hasReviewed) {
      setCanReview(false);
      setReviewDisabledMessage('Ya has dejado una reseña para este producto.');
      return;
    }

    const hasPurchased = myOrders.some(order =>
      order.items.some(item => item.product && item.product._id === id)
    );

    if (!hasPurchased) {
      setCanReview(false);
      setReviewDisabledMessage('Debes haber comprado este producto para dejar una reseña.');
      return;
    }

    setCanReview(true);
    setReviewDisabledMessage('Tu comentario (opcional)');
  }, [user, reviews, myOrders, id]);

  const getSelectedVariantFunction = () => {
    if (attributeOptions.length === 0 || !product) return product;

    const selectedValues = attributeOptions.map(opt =>
      selectedAttributes[opt.type] || ''
    );

    // Verificar que todas las selecciones estén completas
    const allSelected = selectedValues.every(value => value !== '');
    if (!allSelected) return product;

    const optionKey = selectedValues.join('|');
    const variant = availableOptions.get(optionKey);

    return variant || product; // Fallback al producto original si no se encuentra
  };

  const getSelectedVariant = getSelectedVariantFunction()

  const displayPrice = getPriceAtSale(getSelectedVariantFunction());
  const priceWithTax = getSelectedVariant && displayPrice !== null ?
    (taxRegime === 'simplified' ? Math.round(displayPrice) : calculatePriceWithTax(displayPrice, getSelectedVariant.iva)) : null;



  // Update handleAddToCart to use the selected variant
  const handleAddToCart = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    const selectedVariant = getSelectedVariantFunction();

    if (!selectedVariant) { return; }
    if (quantity <= 0) { return; }

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

  const handleRelatedProductAddToCart = useCallback(async (relatedProduct, qty) => {
    if (typeof addItemToCart !== 'function') {
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
  }, [addItemToCart, getPriceAtSale]);


  const handleWhatsAppInquiry = () => {
    if (!product) {
      toast.error("No se puede enviar la consulta, los detalles del producto no están disponibles.");
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

    window.open(whatsappLink, '_blank');
    setCustomerQuestion('')
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
      setNewComment('');
    } catch (err) {
      console.error("Fallo al enviar la reseña:", err);
    }
  };

  // FAQ Data (unchanged)
  const WHATSAPP_AGENT_NUMBER_ = '50672317420';
  const wholesaleMessage = "Hola, estoy interesado/a en sus precios de mayoreo y me gustaría recibir más información. Gracias.";
  const whatsappUrl = `https://wa.me/${WHATSAPP_AGENT_NUMBER_}?text=${encodeURIComponent(wholesaleMessage)}`;

  const faqData = [
    {
      question: '1. ¿Cuáles son los métodos de pago aceptados?',
      answer: 'Aceptamos pagos a través de tarjeta de crédito o débito. Los pagos se procesan através de TiloPay una pasarela de pago establecida en Costa Rica.'
    },
    {
      question: '2. ¿Cuál es el tiempo de entrega estimado?',
      answer: 'Para envíos dentro de la GAM, trabajamos con Mensajería Fonseca para garantizar una entrega rápida, usualmente en las siguientes 24 a 48 horas. Dependiendo de la demanda, el plazo puede extenderse. Tu entrega es nuestra prioridad y está 100% garantizada.'
    },
    {
      question: '3. ¿Son productos originales?',
      answer: 'Absolutamente. Garantizamos que todos nuestros productos son 100% originales, nuevos y se entregan sellados en su empaque de fábrica. La autenticidad es el pilar de nuestra marca.'
    },
    {
      question: '4. ¿Realizan envíos fuera de la GAM?',
      answer: 'Sí. Los envíos se gestionan a través de Correos de Costa Rica a todo el territorio nacional. El costo se calcula automáticamente según el peso de su pedido y su ubicación exacta.'
    },
  ];

  if (loadingSpecificProduct) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
        <Box sx={{ position: 'relative', display: 'inline-flex', filter: 'drop-shadow(0 0 6px rgba(255, 215, 0, 0.7))' }}>
          <CircularProgress
            variant="determinate"
            sx={{
              color: 'rgba(255, 215, 0, 0.25)',
            }}
            size={40}
            thickness={4}
            value={100}
          />
          <CircularProgress
            variant="indeterminate"
            disableShrink
            sx={{
              color: '#FFD700',
              animationDuration: '600ms',
              position: 'absolute',
              left: 0,
              '& .MuiCircularProgress-circle': {
                strokeLinecap: 'round',
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
        <Button onClick={() => navigate('/products')} sx={{ mt: 2 }}>Volver a Productos</Button>
      </Container>
    );
  }

  if (!product) {
    return (
      <Container maxWidth="lg" sx={{ my: 4, flexGrow: 1 }}>
        <Alert severity="warning">Producto no encontrado.</Alert>
        <Button onClick={() => navigate('/products')} sx={{ mt: 2 }}>Volver a Productos</Button>
      </Container>
    );
  }

  // const selectedVariant = getSelectedVariant();
  const isOutOfStock = getSelectedVariantFunction().countInStock <= 0;
  const baseProductName = extractBaseProductName(product.name, product.code);

  const contentSectionStyle = {
    my: 5, p: { xs: 2.5, sm: 3.5 }, bgcolor: 'background.paper', borderRadius: 3,
    boxShadow: theme.shadows[2], border: `1px solid ${theme.palette.grey[100]}`,
    transition: 'box-shadow 0.3s ease-in-out', '&:hover': { boxShadow: theme.shadows[4] }
  };

  const sectionTitleStyle = { fontWeight: 700, color: 'primary.main', mb: 3, textAlign: 'left' };

  const genderMap = { 'men': 'Hombre', 'women': 'Mujer', 'unisex': 'Unisex', 'children': 'Niños', 'elderly': 'Ancianos', 'other': 'Otro' };
  const getTranslatedGender = (gender) => genderMap[gender.toLowerCase()] || gender;

  const formatProductNameMultiLine = (name, maxLength) => {
    if (name.length <= maxLength) {
      return name;
    }

    const lines = [];
    let remainingText = name;

    while (remainingText.length > maxLength) {
      let breakPoint = remainingText.substring(0, maxLength).lastIndexOf(' ');
      let splitIndex = (breakPoint === -1) ? maxLength : breakPoint;

      lines.push(remainingText.substring(0, splitIndex));
      remainingText = remainingText.substring(splitIndex).trim();
    }

    lines.push(remainingText);
    return lines.join('\n');
  };

  const formatDimensions = (dimensions) => {
    if (!dimensions) return 'N/A';

    // Si es un objeto, convertirlo a string
    if (typeof dimensions === 'object') {
      const { width, height, depth } = dimensions;
      return `${width || ''} × ${height || ''} × ${depth || ''}`.trim();
    }

    // Si ya es un string, devolverlo tal cual
    return dimensions;
  };

  // Función para formatear valores de array
  const formatArrayValue = (value) => {
    if (!value || !Array.isArray(value) || value.length === 0) return 'N/A';

    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
        {value.map((feature, index) => (
          <Box key={index} sx={{ display: 'flex', alignItems: 'flex-start' }}>
            <Box component="span" sx={{ mr: 1 }}>•</Box>
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

    const selectedValues = attributeOptions.map(opt =>
      selectedAttributes[opt.type] || ''
    );

    // Verificar que todas las selecciones estén completas
    const allSelected = selectedValues.every(value => value !== '');
    if (!allSelected) return false;

    const optionKey = selectedValues.join('|');
    return availableOptions.has(optionKey);
  };



  const getCleanText = (html) => {
    if (!html) return '';
    const clean = DOMPurify.sanitize(html, { ALLOWED_TAGS: [] }); // Remove all tags
    return clean.replace(/\s+/g, ' ').trim();
  };


  return (
    <>
      <Helmet>
        <title>{product ? `${baseProductName} - Software Factory ERP` : 'Detalle de Producto'}</title>
        <meta name="description" content={product ? `Compra ${baseProductName}, perfumería fina en Costa Rica. ${getCleanText(product.description).substring(0, 120)}...` : 'Descubre nuestra colección de perfumes y cosméticos.'} />
        <meta property="og:title" content={product ? baseProductName : 'Look & Smell'} />
        <meta property="og:description" content={product ? getCleanText(product.description).substring(0, 120) : 'Tu tienda de confianza.'} />
        <meta property="og:image" content={product?.imageUrls?.[0]?.secure_url} />
      </Helmet>

      <Container maxWidth="lg" sx={{ my: 4, flexGrow: 1 }}>
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

        <Grid container spacing={5}>
          <Grid item xs={12} md={6}>
            <ProductImageCarousel imageUrls={getSelectedVariantFunction().imageUrls} productName={baseProductName} />
          </Grid>
          <Grid item xs={12} md={6}>
            <Box sx={{ p: 2, bgcolor: 'background.paper', borderRadius: 3, boxShadow: theme.shadows[1] }}>
              <Typography
                variant="h3"
                component="h1"
                gutterBottom
                sx={{
                  fontWeight: 700,
                  color: 'primary.main',
                  fontSize: { xs: '2rem', md: '2.5rem' },
                  whiteSpace: 'pre-line',
                }}
              >
                {formatProductNameMultiLine(baseProductName, 22)}
              </Typography>
              <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 2, lineHeight: 1.6 }}>{product.brand || 'Sin descripción disponible.'}</Typography>
              <Divider sx={{ my: 2 }} />


              {!loadingAttributes && attributeOptions && attributeOptions.length > 0 ? (
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
                          display: 'block',
                          fontWeight: 'bold',
                          color: 'grey.800',
                          mb: 2,
                          textTransform: 'uppercase',
                          letterSpacing: '0.05em'
                        }}
                      >

                      </Typography>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                        {options.map((option, optionIndex) => {
                          const isSelected = selectedAttributes[attribute.type] === option.value;
                          const isAvailable = option.isAvailable;
                          return (
                            <Button
                              key={optionIndex}
                              variant="outlined"
                              onClick={() => handleAttributeChange(attribute.type, option.value)}
                              disabled={!isAvailable || !allAttributesLoaded}
                              sx={{
                                px: 3,
                                py: 1.5,
                                borderRadius: 2,
                                fontSize: '0.875rem',
                                fontWeight: 'bold',
                                minWidth: '60px',
                                transition: 'all 0.3s ease',
                                transform: 'scale(1)',
                                '&:hover': {
                                  transform: 'scale(1.05)',
                                  ...(!isSelected && {
                                    bgcolor: 'primary.50',
                                    color: 'primary.700',
                                    borderColor: 'primary.300',
                                  })
                                },
                                '&:active': {
                                  transform: 'scale(0.95)'
                                },
                                ...(isSelected && {
                                  bgcolor: '#263C5C',
                                  color: 'white',
                                  borderColor: '#263C5C',
                                  boxShadow: '0 4px 12px rgba(38, 60, 92, 0.3)',
                                  '&:hover': {
                                    bgcolor: '#1E2F4A',
                                    borderColor: '#1E2F4A',
                                  }
                                }),
                                ...(!isSelected && {
                                  bgcolor: 'white',
                                  color: 'grey.800',
                                  borderColor: 'grey.300',
                                }),
                                ...(isLastAttribute && !option.isAvailable && {
                                  bgcolor: 'grey.100',
                                  color: 'grey.500',
                                  borderColor: 'grey.300',
                                  cursor: 'not-allowed',
                                  opacity: 0.7,
                                }),
                                // ESTILO ADICIONAL MIENTRAS LOS ATRIBUTOS SE CARGAN
                                ...(!allAttributesLoaded && {
                                  opacity: 0.6,
                                  cursor: 'not-allowed',
                                })
                              }}
                            >
                              {option.value}
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


              <Typography variant="h4" color="secondary" sx={{ mb: 2, fontWeight: 800 }}>
                {priceWithTax !== null ? formatPrice(priceWithTax) : 'Precio no disponible'}
              </Typography>
              {taxRegime !== 'simplified' && (
                <Typography variant="body2" color="text.secondary">
                  IVA incluido
                </Typography>
              )}
              <Typography variant="body1" color={isOutOfStock ? 'error.main' : 'text.primary'} sx={{ mb: 2, fontWeight: 600 }}>
                Stock Disponible: {getSelectedVariantFunction().countInStock} {isOutOfStock && '(Agotado)'}
              </Typography>

              <Box display="flex" alignItems="center" mb={3}>
                <Box display="flex" alignItems="center" gap={1}>
                  <IconButton onClick={() => setQuantity(q => Math.max(1, q - 1))} disabled={quantity <= 1 || cartLoading || isOutOfStock}>
                    <RemoveCircleOutlineIcon />
                  </IconButton>
                  <Typography sx={{ width: '2ch', textAlign: 'center' }}>{quantity}</Typography>
                  <IconButton onClick={() => setQuantity(q => Math.min(product.countInStock, q + 1))} disabled={quantity >= product.countInStock || cartLoading || isOutOfStock}>
                    <AddCircleOutlineIcon />
                  </IconButton>
                </Box>
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={cartLoading ? <CircularProgress size={20} color="inherit" /> : <ShoppingCartIcon />}
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
                    borderRadius: 8,
                    textTransform: 'none',
                    px: { xs: 1.5, sm: 4 }, // Reducir padding horizontal en móviles
                    py: { xs: 1, sm: 1.5 }, // Reducir padding vertical en móviles
                    ml: { xs: 0.5, sm: 1 }, // Reducir margen izquierdo en móviles
                    fontSize: { xs: '0.75rem', sm: '0.875rem' }, // Tamaño de fuente responsive
                    minWidth: { xs: 'auto', sm: '64px' }, // Ancho mínimo ajustable
                    background: '#bb4343ff',
                    boxShadow: `0 3px 5px 2px rgba(33, 33, 33, .3)`,
                    color: 'white',
                    '&:hover': {
                      background: '#ff0000ff',
                      boxShadow: `0 3px 8px 3px rgba(33, 33, 33, .4)`,
                      transform: 'translateY(-2px)',
                    },
                    '&:active': { transform: 'translateY(0)' },
                    '&:disabled': {
                      background: '#cccccc',
                      color: '#666666',
                    },
                    // Ocultar texto en móviles muy pequeños y mostrar solo el icono
                    ...(isExtraSmallMobile && {
                      '& .MuiButton-startIcon': {
                        margin: 0
                      },
                      minWidth: 'auto',
                      width: '40px',
                      height: '40px',
                      borderRadius: '50%'
                    })
                  }}
                >
                  {/* Texto condicional para móviles pequeños */}
                  {isExtraSmallMobile ? '' : 'Añadir al Carrito'}
                </Button>

              </Box>
            </Box>
          </Grid>
        </Grid>

        <Box sx={contentSectionStyle}>
          <Typography variant="h5" component="h2" gutterBottom sx={sectionTitleStyle}>Descripción del Producto</Typography>
          {/* <Typography variant="body1" color="text.primary" sx={{ lineHeight: 1.7 }}>{product.description || 'No hay descripción detallada disponible para este producto.'}</Typography> */}
          <HTMLContent
            html={product.description}
            fallback="No hay descripción detallada disponible para este producto."
            variant="body1"
            color="text.primary"
            sx={{ lineHeight: 1.7 }}
          />

          {/* --- 4. NUEVA SECCIÓN DE CONSULTA POR WHATSAPP --- */}
          <Card sx={{ ...contentSectionStyle, mt: 5 }}>
            <CardContent>
              <Typography variant="h5" component="h2" gutterBottom sx={sectionTitleStyle}>
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
                  fontWeight: 'bold',
                  borderRadius: '8px',
                  bgcolor: '#25D366',
                  '&:hover': {
                    bgcolor: '#1EBE57',
                  },
                }}
              >
                Consultar por WhatsApp
              </Button>
            </CardContent>
          </Card>
        </Box>


        <Box sx={{
          p: { xs: 2, sm: 3 },
          borderRadius: 2,
          boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
          backgroundColor: 'background.paper',
          mb: 4,
          overflow: 'hidden'
        }}>
          <Typography
            variant="h5"
            component="h2"
            gutterBottom
            sx={{
              fontWeight: 600,
              color: 'primary.main',
              mb: 3,
              pb: 1,
              borderBottom: '2px solid',
              borderColor: 'primary.light'
            }}
          >
            Especificaciones
          </Typography>

          {/* Contenedor con scroll horizontal para móviles */}
          <Box sx={{
            width: '100%',
            overflowX: 'auto',
            WebkitOverflowScrolling: 'touch', // Scroll suave en iOS
            '&::-webkit-scrollbar': {
              height: 6,
            },
            '&::-webkit-scrollbar-track': {
              background: 'rgba(0,0,0,0.05)',
              borderRadius: 3,
            },
            '&::-webkit-scrollbar-thumb': {
              background: 'rgba(0,0,0,0.2)',
              borderRadius: 3,
            }
          }}>
            <TableContainer
              component={Paper}
              elevation={0}
              sx={{
                minWidth: 650, // Mantiene el ancho mínimo para desktop
                borderRadius: 2,
                border: '1px solid',
                borderColor: 'grey.200',
                overflow: 'hidden',
                display: 'table' // Importante para que no colapse en móviles
              }}
            >
              <Table aria-label="Especificaciones del producto" sx={{ minWidth: 650 }}>
                <TableBody>
                  {/* Código */}
                  <TableRow sx={{ backgroundColor: 'grey.50' }}>
                    <TableCell
                      component="th"
                      scope="row"
                      sx={{
                        width: { xs: '50%', sm: '40%' }, // Ajuste responsive del ancho
                        fontWeight: 600,
                        color: 'text.secondary',
                        borderRight: '1px solid',
                        borderColor: 'grey.200',
                        py: 2,
                        whiteSpace: 'nowrap' // Evita que el texto se divida en varias líneas
                      }}
                    >
                      Código
                    </TableCell>
                    <TableCell sx={{
                      color: getSelectedVariantFunction().code ? 'text.primary' : 'grey.500',
                      py: 2,
                      minWidth: 150 // Ancho mínimo para la celda de datos
                    }}>
                      {getSelectedVariantFunction().code || 'N/A'}
                    </TableCell>
                  </TableRow>

                  {/* Volumen */}
                  <TableRow>
                    <TableCell
                      component="th"
                      scope="row"
                      sx={{
                        fontWeight: 600,
                        color: 'text.secondary',
                        borderRight: '1px solid',
                        borderColor: 'grey.200',
                        py: 2,
                        whiteSpace: 'nowrap'
                      }}
                    >
                      Volumen
                    </TableCell>
                    <TableCell sx={{
                      color: getSelectedVariantFunction().volume ? 'text.primary' : 'grey.500',
                      py: 2,
                      minWidth: 150
                    }}>
                      {getSelectedVariantFunction().volume || 'N/A'}
                    </TableCell>
                  </TableRow>

                  {/* Género */}
                  <TableRow sx={{ backgroundColor: 'grey.50' }}>
                    <TableCell
                      component="th"
                      scope="row"
                      sx={{
                        fontWeight: 600,
                        color: 'text.secondary',
                        borderRight: '1px solid',
                        borderColor: 'grey.200',
                        py: 2,
                        whiteSpace: 'nowrap'
                      }}
                    >
                      Género
                    </TableCell>
                    <TableCell sx={{
                      color: getSelectedVariantFunction().gender ? 'text.primary' : 'grey.500',
                      py: 2,
                      minWidth: 150
                    }}>
                      {getSelectedVariantFunction().gender || 'N/A'}
                    </TableCell>
                  </TableRow>

                  {/* Colores */}
                  <TableRow>
                    <TableCell
                      component="th"
                      scope="row"
                      sx={{
                        fontWeight: 600,
                        color: 'text.secondary',
                        borderRight: '1px solid',
                        borderColor: 'grey.200',
                        py: 2,
                        whiteSpace: 'nowrap'
                      }}
                    >
                      Colores
                    </TableCell>
                    <TableCell sx={{
                      color: getSelectedVariantFunction().colors?.length ? 'text.primary' : 'grey.500',
                      py: 2,
                      minWidth: 150
                    }}>
                      {formatArrayValue(getSelectedVariantFunction().colors)}
                    </TableCell>
                  </TableRow>

                  {/* Tallas */}
                  <TableRow sx={{ backgroundColor: 'grey.50' }}>
                    <TableCell
                      component="th"
                      scope="row"
                      sx={{
                        fontWeight: 600,
                        color: 'text.secondary',
                        borderRight: '1px solid',
                        borderColor: 'grey.200',
                        py: 2,
                        whiteSpace: 'nowrap'
                      }}
                    >
                      Tamaños
                    </TableCell>
                    <TableCell sx={{
                      color: getSelectedVariantFunction().sizes?.length ? 'text.primary' : 'grey.500',
                      py: 2,
                      minWidth: 150
                    }}>
                      {formatArrayValue(getSelectedVariantFunction().sizes)}
                    </TableCell>
                  </TableRow>

                  {/* Materiales */}
                  <TableRow>
                    <TableCell
                      component="th"
                      scope="row"
                      sx={{
                        fontWeight: 600,
                        color: 'text.secondary',
                        borderRight: '1px solid',
                        borderColor: 'grey.200',
                        py: 2,
                        whiteSpace: 'nowrap'
                      }}
                    >
                      Materiales
                    </TableCell>
                    <TableCell sx={{
                      color: getSelectedVariantFunction().materials?.length ? 'text.primary' : 'grey.500',
                      py: 2,
                      minWidth: 150
                    }}>
                      {formatArrayValue(getSelectedVariantFunction().materials)}
                    </TableCell>
                  </TableRow>

                  {/* Rango de edad */}
                  <TableRow sx={{ backgroundColor: 'grey.50' }}>
                    <TableCell
                      component="th"
                      scope="row"
                      sx={{
                        fontWeight: 600,
                        color: 'text.secondary',
                        borderRight: '1px solid',
                        borderColor: 'grey.200',
                        py: 2,
                        whiteSpace: 'nowrap'
                      }}
                    >
                      Rango de edad
                    </TableCell>
                    <TableCell sx={{
                      color: getSelectedVariantFunction().ageRange ? 'text.primary' : 'grey.500',
                      py: 2,
                      minWidth: 150
                    }}>
                      {getSelectedVariantFunction().ageRange || 'N/A'}
                    </TableCell>
                  </TableRow>

                  {/* Características */}
                  <TableRow>
                    <TableCell
                      component="th"
                      scope="row"
                      sx={{
                        fontWeight: 600,
                        color: 'text.secondary',
                        borderRight: '1px solid',
                        borderColor: 'grey.200',
                        py: 2,
                        whiteSpace: 'nowrap'
                      }}
                    >
                      Características
                    </TableCell>
                    <TableCell sx={{
                      color: getSelectedVariantFunction().features?.length ? 'text.primary' : 'grey.500',
                      py: 2,
                      minWidth: 150
                    }}>
                      {formatArrayValue(getSelectedVariantFunction().features)}
                    </TableCell>
                  </TableRow>

                  {/* Voltaje */}
                  <TableRow sx={{ backgroundColor: 'grey.50' }}>
                    <TableCell
                      component="th"
                      scope="row"
                      sx={{
                        fontWeight: 600,
                        color: 'text.secondary',
                        borderRight: '1px solid',
                        borderColor: 'grey.200',
                        py: 2,
                        whiteSpace: 'nowrap'
                      }}
                    >
                      Voltaje
                    </TableCell>
                    <TableCell sx={{
                      color: getSelectedVariantFunction().voltage ? 'text.primary' : 'grey.500',
                      py: 2,
                      minWidth: 150
                    }}>
                      {getSelectedVariantFunction().voltage || 'N/A'}
                    </TableCell>
                  </TableRow>

                  {/* Garantía */}
                  <TableRow>
                    <TableCell
                      component="th"
                      scope="row"
                      sx={{
                        fontWeight: 600,
                        color: 'text.secondary',
                        borderRight: '1px solid',
                        borderColor: 'grey.200',
                        py: 2,
                        whiteSpace: 'nowrap'
                      }}
                    >
                      Garantía
                    </TableCell>
                    <TableCell sx={{
                      color: getSelectedVariantFunction().warranty ? 'text.primary' : 'grey.500',
                      py: 2,
                      minWidth: 150
                    }}>
                      {getSelectedVariantFunction().warranty || 'N/A'}
                    </TableCell>
                  </TableRow>

                  {/* Incluye baterías */}
                  <TableRow sx={{ backgroundColor: 'grey.50' }}>
                    <TableCell
                      component="th"
                      scope="row"
                      sx={{
                        fontWeight: 600,
                        color: 'text.secondary',
                        borderRight: '1px solid',
                        borderColor: 'grey.200',
                        py: 2,
                        whiteSpace: 'nowrap'
                      }}
                    >
                      Incluye baterías
                    </TableCell>
                    <TableCell sx={{
                      color: getSelectedVariantFunction().includesBatteries !== undefined ? 'text.primary' : 'grey.500',
                      py: 2,
                      minWidth: 150
                    }}>
                      {getSelectedVariantFunction().includesBatteries !== undefined ? (getSelectedVariantFunction().includesBatteries ? 'Sí' : 'No') : 'N/A'}
                    </TableCell>
                  </TableRow>

                  {/* Tipo de batería */}
                  <TableRow>
                    <TableCell
                      component="th"
                      scope="row"
                      sx={{
                        fontWeight: 600,
                        color: 'text.secondary',
                        borderRight: '1px solid',
                        borderColor: 'grey.200',
                        py: 2,
                        whiteSpace: 'nowrap'
                      }}
                    >
                      Tipo de batería
                    </TableCell>
                    <TableCell sx={{
                      color: getSelectedVariantFunction().batteryType ? 'text.primary' : 'grey.500',
                      py: 2,
                      minWidth: 150
                    }}>
                      {getSelectedVariantFunction().batteryType || 'N/A'}
                    </TableCell>
                  </TableRow>

                  {/* Dimensiones */}
                  <TableRow sx={{ backgroundColor: 'grey.50' }}>
                    <TableCell
                      component="th"
                      scope="row"
                      sx={{
                        fontWeight: 600,
                        color: 'text.secondary',
                        borderRight: '1px solid',
                        borderColor: 'grey.200',
                        py: 2,
                        whiteSpace: 'nowrap'
                      }}
                    >
                      Dimensiones
                    </TableCell>
                    <TableCell sx={{
                      color: getSelectedVariantFunction().dimensions ? 'text.primary' : 'grey.500',
                      py: 2,
                      minWidth: 150
                    }}>
                      {formatDimensions(getSelectedVariantFunction().dimensions)}
                    </TableCell>
                  </TableRow>

                  {/* Peso */}
                  <TableRow>
                    <TableCell
                      component="th"
                      scope="row"
                      sx={{
                        fontWeight: 600,
                        color: 'text.secondary',
                        borderRight: '1px solid',
                        borderColor: 'grey.200',
                        py: 2,
                        whiteSpace: 'nowrap'
                      }}
                    >
                      Peso
                    </TableCell>
                    <TableCell sx={{
                      color: getSelectedVariantFunction().weight ? 'text.primary' : 'grey.500',
                      py: 2,
                      minWidth: 150
                    }}>
                      {getSelectedVariantFunction().weight || 'N/A'}
                    </TableCell>
                  </TableRow>

                  {/* Ubicación recomendada */}
                  <TableRow sx={{ backgroundColor: 'grey.50' }}>
                    <TableCell
                      component="th"
                      scope="row"
                      sx={{
                        fontWeight: 600,
                        color: 'text.secondary',
                        borderRight: '1px solid',
                        borderColor: 'grey.200',
                        py: 2,
                        whiteSpace: 'nowrap'
                      }}
                    >
                      Ubicación recomendada
                    </TableCell>
                    <TableCell sx={{
                      color: getSelectedVariantFunction().recommendedLocation ? 'text.primary' : 'grey.500',
                      py: 2,
                      minWidth: 150
                    }}>
                      {getSelectedVariantFunction().recommendedLocation || 'N/A'}
                    </TableCell>
                  </TableRow>

                  {/* Categoría */}
                  <TableRow>
                    <TableCell
                      component="th"
                      scope="row"
                      sx={{
                        fontWeight: 600,
                        color: 'text.secondary',
                        borderRight: '1px solid',
                        borderColor: 'grey.200',
                        py: 2,
                        whiteSpace: 'nowrap'
                      }}
                    >
                      Categoría
                    </TableCell>
                    <TableCell sx={{
                      color: getSelectedVariantFunction().category ? 'text.primary' : 'grey.500',
                      py: 2,
                      minWidth: 150
                    }}>
                      {getSelectedVariantFunction().category || 'N/A'}
                    </TableCell>
                  </TableRow>

                  {/* Marca */}
                  <TableRow sx={{ backgroundColor: 'grey.50' }}>
                    <TableCell
                      component="th"
                      scope="row"
                      sx={{
                        fontWeight: 600,
                        color: 'text.secondary',
                        borderRight: '1px solid',
                        borderColor: 'grey.200',
                        py: 2,
                        whiteSpace: 'nowrap'
                      }}
                    >
                      Marca
                    </TableCell>
                    <TableCell sx={{
                      color: getSelectedVariantFunction().brand ? 'text.primary' : 'grey.500',
                      py: 2,
                      minWidth: 150
                    }}>
                      {getSelectedVariantFunction().brand || 'N/A'}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        </Box>





        {getSelectedVariantFunction().tags && getSelectedVariantFunction().tags.length > 0 && (
          <Box sx={contentSectionStyle}>
            <Typography variant="h5" component="h2" gutterBottom sx={sectionTitleStyle}>Notas Aromáticas</Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {product.tags.map((tagItem, tagIndex) => (
                <Button key={tagIndex} variant="contained" color="secondary" sx={{ borderRadius: 1, fontWeight: 600, cursor: 'default', textTransform: 'none', pointerEvents: 'none', boxShadow: 'none', '&:hover': { boxShadow: 'none', bgcolor: theme.palette.primary.main, }, '&:active': { boxShadow: 'none', bgcolor: theme.palette.primary.main, } }}>
                  {tagItem}
                </Button>
              ))}
            </Box>
          </Box>
        )}

        {/* --- 4. NUEVA SECCIÓN DE PREGUNTAS FRECUENTES (FAQ) --- */}
        <Box sx={{ ...contentSectionStyle, mt: 5 }}>
          <Typography variant="h5" component="h2" gutterBottom sx={sectionTitleStyle}>
            Preguntas Frecuentes
          </Typography>
          {faqData.map((faq, index) => (
            <Accordion key={index} sx={{
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              color: 'text.primary',
              boxShadow: 'none',
              borderBottom: `1px solid ${theme.palette.divider}`,
              '&:before': { display: 'none' },
              '&.Mui-expanded': { margin: 'auto 0' }
            }}>
              <AccordionSummary
                expandIcon={<ExpandMoreIcon sx={{ color: 'secondary.main' }} />}
                aria-controls={`panel${index}a-content`}
                id={`panel${index}a-header`}
              >
                <Typography sx={{ fontWeight: 'bold', color: 'primary.main' }}>{faq.question}</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography variant="body2" sx={{ color: 'text.secondary', lineHeight: 1.7 }}>
                  {faq.answer}
                </Typography>
              </AccordionDetails>
            </Accordion>
          ))}
        </Box>


        {/* --- SECCIÓN DE CALIFICACIONES Y RESEÑAS ACTUALIZADA --- */}
        <Card sx={{ ...contentSectionStyle, mt: 5 }}>
          <CardContent>
            <Typography variant="h5" component="h2" gutterBottom sx={sectionTitleStyle}>
              Calificaciones y Reseñas
            </Typography>
            {reviews.length > 0 && (
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 4, p: 2, bgcolor: 'action.hover', borderRadius: 2 }}>
                <Typography variant="h4" sx={{ mr: 2, fontWeight: 'bold' }}>
                  {product.averageRating.toFixed(1)}
                </Typography>
                <Box>
                  <Rating value={product.averageRating} precision={0.5} readOnly />
                  <Typography variant="body2" color="text.secondary">
                    Basado en {product.numReviews} reseña(s)
                  </Typography>
                </Box>
              </Box>
            )}

            {reviewsLoading ? (
              <CircularProgress />
            ) : reviews.length === 0 ? (
              <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic', mt: 2 }}>
                Aún no hay reseñas para este producto. ¡Sé el primero en calificarlo!
              </Typography>
            ) : (
              <List>
                {reviews.map((review, index) => (
                  <React.Fragment key={review._id}>
                    <ListItem alignItems="flex-start">
                      <Avatar sx={{ bgcolor: 'secondary.main', mr: 2 }}>
                        {review.user.firstName ? review.user.firstName.charAt(0) : '?'}
                      </Avatar>
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Typography component="span" variant="body1" sx={{ fontWeight: 'bold' }}>
                              {review.user.firstName || 'Usuario'} {review.user.lastName || ''}
                            </Typography>
                            <Rating value={review.rating} readOnly size="small" sx={{ ml: 1.5, verticalAlign: 'middle' }} />
                          </Box>
                        }
                        secondary={
                          <>
                            <Typography component="span" variant="body2" color="text.primary" sx={{ display: 'block', mt: 1, whiteSpace: 'pre-wrap' }}>
                              {review.comment}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {new Date(review.createdAt).toLocaleDateString('es-CR')}
                            </Typography>
                          </>
                        }
                      />
                    </ListItem>
                    {index < reviews.length - 1 && <Divider variant="inset" component="li" />}
                  </React.Fragment>
                ))}
              </List>
            )}

            {/* Formulario para Dejar una Reseña (con lógica condicional) */}
            {user && (
              <Box component="form" onSubmit={handleReviewSubmit} sx={{ mt: 4, pt: 3, borderTop: `1px solid ${theme.palette.divider}` }}>
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>Escribe tu propia reseña</Typography>
                <Box sx={{ mb: 2 }}>
                  <Typography component="legend">Tu Calificación</Typography>
                  <Rating
                    name="new-rating"
                    value={newRating}
                    onChange={(event, newValue) => { setNewRating(newValue); }}
                    readOnly={!canReview} // Se deshabilita si no puede reseñar
                  />
                </Box>
                <TextField
                  label={reviewDisabledMessage} // Label dinámico
                  multiline
                  rows={4}
                  fullWidth
                  variant="outlined"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  disabled={!canReview} // Se deshabilita si no puede reseñar
                />
                {/* <Button type="submit" variant="contained" sx={{ mt: 2 }} disabled={!canReview || reviewsLoading}>
                  Enviar Reseña
                </Button> */}
                <Button
                  type="submit"
                  variant="contained"
                  disabled={!canReview || reviewsLoading}
                  sx={{
                    mt: 2,
                    backgroundColor: '#4CAF50',
                    '&:hover': {
                      backgroundColor: '#45a049',
                      transform: 'translateY(-2px)',
                      boxShadow: '0 4px 8px rgba(0,0,0,0.2)'
                    },
                    '&:active': {
                      transform: 'translateY(0)',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                    },
                    '&.Mui-disabled': {
                      backgroundColor: '#cccccc',
                      color: '#666666'
                    },
                    fontSize: '16px',
                    fontWeight: '600',
                    padding: '10px 24px',
                    borderRadius: '8px',
                    textTransform: 'none',
                    transition: 'all 0.2s ease-in-out',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.15)'
                  }}
                >
                  {reviewsLoading ? 'Enviando...' : 'Enviar Reseña'}
                </Button>
              </Box>
            )}
          </CardContent>
        </Card>


        {relatedProducts.length > 0 && (
          <Box sx={{ ...contentSectionStyle, textAlign: 'center' }}>
            <Typography variant="h5" component="h2" gutterBottom sx={{ ...sectionTitleStyle, textAlign: 'center' }}>
              Productos Relacionados
            </Typography>
            <Grid container spacing={4} justifyContent="center">
              {relatedProducts.map((p) => (
                <Grid item key={p._id} xs={12} sm={6} md={6} lg={6}>
                  <ProductCard
                    product={{
                      ...p,
                      name: p.baseName || p.name,
                      variantCount: p.variantCount
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
          <Box sx={{ ...contentSectionStyle, textAlign: 'center' }}>
            <Typography variant="body1" color="text.secondary">
              No se encontraron productos relacionados.
            </Typography>
          </Box>
        )}

      </Container>
    </>
  );
};

export default ProductDetailsPage;