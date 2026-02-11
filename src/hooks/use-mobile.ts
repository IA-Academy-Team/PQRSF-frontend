import * as React from 'react'

const MOBILE_BREAKPOINT = 768
const MEDIUM_MAX_WIDTH = 1280
const SHORT_VIEWPORT_HEIGHT = 900
const LARGE_LOW_HEIGHT = 1100

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined)

  React.useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
    const onChange = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    }
    mql.addEventListener('change', onChange)
    setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    return () => mql.removeEventListener('change', onChange)
  }, [])

  return !!isMobile
}

/** Número de chats a mostrar en "Chats Recientes": 3 móvil, 4 medianas/poca altura, 5 grandes con altura justa, 6 escritorio alto. */
export function useChatsVisibleLimit() {
  const [limit, setLimit] = React.useState(6)

  React.useEffect(() => {
    const update = () => {
      const w = window.innerWidth
      const h = window.innerHeight
      if (w < MOBILE_BREAKPOINT) setLimit(3)
      else if (h < SHORT_VIEWPORT_HEIGHT || (w >= MOBILE_BREAKPOINT && w < MEDIUM_MAX_WIDTH)) setLimit(4)
      else if (h < LARGE_LOW_HEIGHT) setLimit(5)
      else setLimit(6)
    }
    update()
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [])

  return limit
}
