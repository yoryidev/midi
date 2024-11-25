import styled from "@emotion/styled"
import useComponentSize from "@rehooks/component-size"
import { clamp } from "lodash"
import { observer } from "mobx-react-lite"
import { FC, useCallback, useEffect, useRef } from "react"
import { WHEEL_SCROLL_RATE } from "../../Constants"
import { stop } from "../../actions"
import { isTouchPadEvent } from "../../helpers/touchpad"
import { useStores } from "../../hooks/useStores"
import { PianoRollStage } from "./PianoRollStage"
import { StyledSplitPane } from "./StyledSplitPane"

declare global {
  interface Window {
    colors: any
  }
}

const Parent = styled.div`
  flex-grow: 1;
  background: ${window.colors.backgroundColor};
  position: relative;
`

const Alpha = styled.div`
  flex-grow: 1;
  position: relative;

  .alphaContent {
    position: absolute;
    top: 0;
    left: 0;
  }
`

declare global {
  interface Window {
    stop: () => void
  }
}
const PianoRollWrapper: FC = observer(() => {
  const {
    pianoRollStore: s,
    pianoRollStore: { transform },
  } = useStores()
  const rootStore = useStores()
  const ref = useRef(null)
  const size = useComponentSize(ref)

  const alphaRef = useRef(null)
  const { height: alphaHeight = 0 } = useComponentSize(alphaRef)

  const onWheel = useCallback(
    (e: React.WheelEvent) => {
      if (e.shiftKey && (e.altKey || e.ctrlKey)) {
        // vertical zoom
        let scaleYDelta = isTouchPadEvent(e.nativeEvent)
          ? 0.02 * e.deltaY
          : 0.01 * e.deltaX
        scaleYDelta = clamp(scaleYDelta, -0.15, 0.15) // prevent acceleration to zoom too fast
        s.scaleAroundPointY(scaleYDelta, e.nativeEvent.offsetY)
      } else if (e.altKey || e.ctrlKey) {
        // horizontal zoom
        const scaleFactor = isTouchPadEvent(e.nativeEvent) ? 0.01 : -0.01
        const scaleXDelta = clamp(e.deltaY * scaleFactor, -0.15, 0.15) // prevent acceleration to zoom too fast
        s.scaleAroundPointX(scaleXDelta, e.nativeEvent.offsetX)
      } else {
        // scrolling
        const scaleFactor = isTouchPadEvent(e.nativeEvent)
          ? 1
          : transform.pixelsPerKey * WHEEL_SCROLL_RATE
        const deltaY = e.deltaY * scaleFactor
        s.scrollBy(-e.deltaX, -deltaY)
      }
    },
    [s, transform],
  )
  useEffect(() => {
    window.stop = () => stop(rootStore)
  }, [])
  return (
    <Parent ref={ref}>
      <StyledSplitPane split="horizontal" minSize={50} defaultSize={"100%"}>
        <Alpha onWheel={onWheel} ref={alphaRef}>
          <PianoRollStage width={size.width} height={alphaHeight} />
        </Alpha>
      </StyledSplitPane>
    </Parent>
  )
})

export default PianoRollWrapper
