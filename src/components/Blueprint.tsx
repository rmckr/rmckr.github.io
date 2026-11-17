/**
 * The hero's blueprint: a hairline grid on the page's ground. It is static,
 * decorative, and the hero's only texture.
 */
export function Blueprint() {
  return <div aria-hidden="true" className="blueprint pointer-events-none absolute inset-0" />
}
