// Server-side Shopify Storefront API client used by the /api/cart route
// handlers. The access token lives only here (SHOPIFY_* env vars are not
// NEXT_PUBLIC_*), so it never reaches the client bundle.
//
// The GraphQL documents live in ./queries.ts; their field selection matches
// lib/commerce/types.ts, and mapCart() below is the single place a Shopify
// response becomes the app's Cart shape. If a field is added to the Cart
// type, add it to CART_FRAGMENT and here.

import type {
  Cart,
  CartLine,
  Money,
  ProductHandle,
  ProductImage
} from "../types";

const API_VERSION = "2026-01";

export class ShopifyConfigError extends Error {
  constructor() {
    super(
      "Shopify is not configured: set SHOPIFY_STORE_DOMAIN and SHOPIFY_STOREFRONT_ACCESS_TOKEN"
    );
    this.name = "ShopifyConfigError";
  }
}

export class ShopifyUserError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ShopifyUserError";
  }
}

type GraphQLResponse<T> = {
  data?: T;
  errors?: { message: string }[];
};

export async function shopifyFetch<T>(
  query: string,
  variables: Record<string, unknown>
): Promise<T> {
  const domain = process.env.SHOPIFY_STORE_DOMAIN;
  const token = process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN;
  if (!domain || !token) throw new ShopifyConfigError();

  const response = await fetch(
    `https://${domain}/api/${API_VERSION}/graphql.json`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Storefront-Access-Token": token
      },
      body: JSON.stringify({ query, variables }),
      // Cart state must never be cached between mutations.
      cache: "no-store"
    }
  );

  if (!response.ok) {
    throw new Error(`Shopify responded ${response.status}`);
  }

  const payload = (await response.json()) as GraphQLResponse<T>;
  if (payload.errors?.length) {
    throw new Error(payload.errors.map((error) => error.message).join("; "));
  }
  if (!payload.data) throw new Error("Shopify returned no data");
  return payload.data;
}

// ---- Response shapes (the subset CART_FRAGMENT selects) ----

type ShopifyMoney = { amount: string; currencyCode: string };

type ShopifyCartLine = {
  id: string;
  quantity: number;
  cost: {
    totalAmount: ShopifyMoney;
    compareAtAmountPerQuantity: ShopifyMoney | null;
  };
  merchandise: {
    id: string;
    title: string;
    sku: string;
    availableForSale: boolean;
    price: ShopifyMoney;
    compareAtPrice: ShopifyMoney | null;
    product: {
      id: string;
      handle: string;
      title: string;
      featuredImage: { url: string; altText: string | null } | null;
    };
  };
};

export type ShopifyCart = {
  id: string;
  checkoutUrl: string;
  totalQuantity: number;
  discountCodes: { code: string; applicable: boolean }[];
  cost: {
    subtotalAmount: ShopifyMoney;
    totalAmount: ShopifyMoney;
  };
  lines: { edges: { node: ShopifyCartLine }[] };
};

function mapMoney(money: ShopifyMoney): Money {
  return { amount: money.amount, currencyCode: "GBP" };
}

function mapLine(node: ShopifyCartLine): CartLine {
  const images: ProductImage[] = node.merchandise.product.featuredImage
    ? [
        {
          url: node.merchandise.product.featuredImage.url,
          altText: node.merchandise.product.featuredImage.altText ?? ""
        }
      ]
    : [];

  // The fragment exposes the per-unit compare-at price; the app's CartLine
  // carries the line total, so multiply by quantity here.
  const compareAtAmount = node.cost.compareAtAmountPerQuantity
    ? {
        amount: (
          parseFloat(node.cost.compareAtAmountPerQuantity.amount) *
          node.quantity
        ).toFixed(2),
        currencyCode: "GBP" as const
      }
    : null;

  return {
    id: node.id,
    quantity: node.quantity,
    merchandise: {
      id: node.merchandise.id,
      title: node.merchandise.title,
      sku: node.merchandise.sku,
      availableForSale: node.merchandise.availableForSale,
      price: mapMoney(node.merchandise.price),
      compareAtPrice: node.merchandise.compareAtPrice
        ? mapMoney(node.merchandise.compareAtPrice)
        : null,
      image: images[0],
      product: {
        id: node.merchandise.product.id,
        handle: node.merchandise.product.handle as ProductHandle,
        title: node.merchandise.product.title,
        images
      }
    },
    cost: {
      totalAmount: mapMoney(node.cost.totalAmount),
      compareAtAmount
    }
  };
}

export function mapCart(cart: ShopifyCart): Cart {
  return {
    id: cart.id,
    checkoutUrl: cart.checkoutUrl,
    totalQuantity: cart.totalQuantity,
    discountCodes: cart.discountCodes,
    cost: {
      subtotalAmount: mapMoney(cart.cost.subtotalAmount),
      totalAmount: mapMoney(cart.cost.totalAmount)
    },
    lines: cart.lines.edges.map((edge) => mapLine(edge.node))
  };
}

// Shopify cart mutations return { cart, userErrors }; surface userErrors as a
// typed error so route handlers can distinguish "you did something invalid"
// (400) from "Shopify is down" (502).
export function unwrapMutation(payload: {
  cart: ShopifyCart | null;
  userErrors: { field: string[] | null; message: string }[];
}): Cart {
  if (payload.userErrors?.length) {
    throw new ShopifyUserError(
      payload.userErrors.map((error) => error.message).join("; ")
    );
  }
  if (!payload.cart) throw new Error("Shopify returned no cart");
  return mapCart(payload.cart);
}
