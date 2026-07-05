import React, { lazy, Suspense } from "react";
import dynamicIconImports from "lucide-react/dynamicIconImports";
import { BarChart3, type LucideProps } from "lucide-react";

export const ICON_NAMES = Object.keys(dynamicIconImports) as (keyof typeof dynamicIconImports)[];

/** Accepts either lucide kebab-case ("bar-chart-3") or PascalCase ("BarChart3", as stored historically). */
export function resolveIconName(name?: string | null): keyof typeof dynamicIconImports | null {
  if (!name) return null;
  const kebab = name
    .trim()
    .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
    .replace(/([A-Za-z])(\d)/g, "$1-$2")
    .toLowerCase();
  return kebab in dynamicIconImports ? (kebab as keyof typeof dynamicIconImports) : null;
}

// lazy() components must be created once per icon, or every render remounts the suspense boundary
const lazyCache = new Map<string, React.LazyExoticComponent<React.ComponentType<LucideProps>>>();

interface DynamicIconProps extends Omit<LucideProps, "ref"> {
  name?: string | null;
}

/** Renders any lucide icon by name, lazy-loaded as its own chunk. Unknown/missing names fall back to BarChart3. */
const DynamicIcon = ({ name, ...props }: DynamicIconProps) => {
  const key = resolveIconName(name);
  if (!key) return <BarChart3 {...props} />;
  let Icon = lazyCache.get(key);
  if (!Icon) {
    Icon = lazy(dynamicIconImports[key]);
    lazyCache.set(key, Icon);
  }
  return (
    <Suspense fallback={<span aria-hidden style={{ display: "inline-block", width: props.size ?? 24, height: props.size ?? 24 }} />}>
      <Icon {...props} />
    </Suspense>
  );
};

export default DynamicIcon;
