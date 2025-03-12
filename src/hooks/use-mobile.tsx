
import * as React from "react"

const MOBILE_BREAKPOINT = 768

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined)

  React.useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
    
    // Initial check
    setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    
    // Listen for changes
    const onChange = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    }
    
    // Modern event listener pattern
    mql.addEventListener("change", onChange)
    
    // Cleanup
    return () => mql.removeEventListener("change", onChange)
  }, [])

  return isMobile === undefined ? false : isMobile
}
