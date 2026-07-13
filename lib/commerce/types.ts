// Shapes mirror the Shopify Storefront API (Cart, CartLine, ProductVariant,
// Money) so the mock provider can be swapped for the real one without any
// type changes downstream.

export type Money = {
  amount: string;
  currencyCode: "GBP";
};

// Quantity pricing tier for a product: buying `minQty` units costs
// `totalPence` for that block. Charged prices come from Shopify's automatic
// discounts at checkout; this table only mirrors them for on-site display
// and mock-cart math.
export type QuantityTier = {
  minQty: number;
  totalPence: number;
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
  // Main image for this variant (e.g. the 300g pouch shot vs. the sample
  // sachet shot). Falls back to the product's first image when absent.
  image?: ProductImage;
  quantityTiers?: QuantityTier[];
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

// A free item bundled with a purchase (not sold separately). `valuePence` is
// the struck-through "worth" shown next to "Free"; `note` is an optional
// caveat like "with your first order".
export type GiftItem = {
  title: string;
  image: string;
  valuePence: number;
  note?: string;
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
