import Color from "color"
import { observer } from "mobx-react-lite"
import { FC } from "react"
import { Layout } from "../../../Constants"
import { colorToVec4 } from "../../../gl/color"
import { useStores } from "../../../hooks/useStores"
import { useTheme } from "../../../hooks/useTheme"
import { HorizontalGrid } from "./HorizontalGrid"

declare global {
  interface Window {
    colors: any
  }
}
export const Lines: FC<{ zIndex: number }> = observer(({ zIndex }) => {
  const theme = useTheme()
  const rootStore = useStores()
  const {
    pianoRollStore: { scrollTop, canvasWidth, canvasHeight, scaleY },
  } = rootStore

  return (
    <HorizontalGrid
      rect={{
        x: 0,
        y: scrollTop,
        width: canvasWidth,
        height: canvasHeight,
      }}
      color={colorToVec4(Color(theme.dividerColor).alpha(0.2))}
      highlightedColor={colorToVec4(Color(theme.dividerColor).alpha(0.5))}
      blackLaneColor={colorToVec4(Color(window.colors.blackKeyLane))}
      height={scaleY * Layout.keyHeight}
      zIndex={zIndex}
    />
  )
})
