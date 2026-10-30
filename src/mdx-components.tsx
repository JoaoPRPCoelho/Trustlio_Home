import type { MDXComponents } from "mdx/types";
import { ProductVideo } from "@/components/media";
import { ComparisonTable, ProductCard } from "@/components/product";

// Components available inside every MDX article without importing them.
const components: MDXComponents = {
  ProductCard,
  ComparisonTable,
  ProductVideo,
};

export function useMDXComponents(): MDXComponents {
  return components;
}
