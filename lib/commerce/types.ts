// Shapes mirror the Shopify Storefront API (Cart, CartLine, ProductVariant,
// Money) so the mock provider can be swapped for the real one without any
// type changes downstream.

export type Money = {
  amount: string;
  currencyCode: "GBP";
};

export type ProductImage = {
  url: string;
  altText: string;
};

export type ProductVariant = {
  id: string;
  title: string;
  sku: string;
  price: Money;
  compareAtPrice: Money | null;
  availableForSale: boolean;
  // Main image for this variant (e.g. the bundle shot for The pair vs. the
  // sample sachet shot). Falls back to the product's first image when absent.
  image?: ProductImage;
};

export type ProductHandle = "khana";

export type Product = {
  id: string;
  handle: ProductHandle;
  title: string;
  shortDescription: string;
  description: string;
  images: ProductImage[];
  tags: string[];
  variants: ProductVariant[];
};

// An item included in a bundle (not sold separately): the refillable table
// jars and the masala dabba that ship with pouch tiers. `valuePence` is the
// total worth of the row, shown struck out next to "Free".
export type IncludedItem = {
  title: string;
  image: string;
  valuePence: number;
};

export type CartLineMerchandise = ProductVariant & {
  product: Pick<Product, "id" | "handle" | "title" | "images">;
};

export type CartLine = {
  id: string;
  quantity: number;
  merchandise: CartLineMerchandise;
  cost: {
    totalAmount: Money;
    compareAtAmount: Money | null;
  };
};

export type CartDiscountCode = {
  code: string;
  applicable: boolean;
};

export type Cart = {
  id: string;
  lines: CartLine[];
  totalQuantity: number;
  cost: {
    subtotalAmount: Money;
    totalAmount: Money;
  };
  discountCodes: CartDiscountCode[];
  checkoutUrl: string;
};

export type CartLineInput = {
  merchandiseId: string;
  quantity: number;
};

export type CommerceMode = "waitlist" | "live";
export type CommerceProviderName = "mock" | "shopify";
