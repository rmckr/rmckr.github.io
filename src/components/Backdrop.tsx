/** Fixed ground plus a single soft light source at the top of the page. */
export function Backdrop() {
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10">
      <div className="absolute inset-0 bg-ground" />
      <div className="absolute inset-x-0 top-0 h-[520px] bg-[radial-gradient(62%_100%_at_50%_0%,rgba(205,203,202,0.07),transparent_75%)]" />
    </div>
  )
}
