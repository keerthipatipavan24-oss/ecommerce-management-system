import initialProducts from "./products";

// Get products from localStorage
export const getSavedProducts = () => {
  try {
    const savedProducts = localStorage.getItem("products");

    // First time: save initial sample products
    if (!savedProducts) {
      localStorage.setItem("products", JSON.stringify(initialProducts));
      return initialProducts;
    }

    const parsedProducts = JSON.parse(savedProducts);

    if (!Array.isArray(parsedProducts)) {
      localStorage.setItem("products", JSON.stringify(initialProducts));
      return initialProducts;
    }

    return parsedProducts;
  } catch {
    localStorage.setItem("products", JSON.stringify(initialProducts));
    return initialProducts;
  }
};

// Save products to localStorage
export const saveProducts = (products) => {
  localStorage.setItem("products", JSON.stringify(products));
};
