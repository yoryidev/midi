import Color from "color"
import { partition } from "lodash"
import { observer } from "mobx-react-lite"
import { FC, useEffect } from "react"
import { trackColorToCSSColor } from "../../../../common/track/TrackColor"
import { colorToVec4 } from "../../../gl/color"
import { useStores } from "../../../hooks/useStores"
import { useTheme } from "../../../hooks/useTheme"
import { PianoNoteItem } from "../../../stores/PianoRollStore"
import { NoteCircles } from "./NoteCircles"
import { NoteRectangles } from "./NoteRectangles"

declare global {
  interface Window {
    colors: any
  }
}

export const Notes: FC<{ zIndex: number }> = observer(({ zIndex }) => {
  const {
    pianoRollStore: { notes, selectedTrack, cursorX },
  } = useStores()
  const theme = useTheme()

  if (selectedTrack === undefined) {
    return <></>
  }

  const [drumNotes, normalNotes] = partition(notes, (n) => n.isDrum)
  const baseColor = Color(
    selectedTrack.color !== undefined
      ? trackColorToCSSColor(selectedTrack.color)
      : window.colors
      ? window.colors.primary
      : theme.themeColor,
  )
  const borderColor = colorToVec4(baseColor.lighten(0.3))
  const selectedColor = colorToVec4(baseColor.lighten(0.7))
  const backgroundColor = Color(theme.backgroundColor)

  const colorize = (item: PianoNoteItem) => ({
    ...item,
    color: item.isSelected
      ? selectedColor
      : colorToVec4(baseColor.mix(backgroundColor, 1 - item.velocity / 127)),
  })

  useEffect(() => {
    notes.map((item) => {
      if (cursorX > item.x && cursorX < item.x + item.width)
        item.isSelected = true
      else item.isSelected = false
    })
  }, [cursorX])
  return (
    <>
      <NoteCircles
        strokeColor={borderColor}
        rects={drumNotes.map(colorize)}
        zIndex={zIndex}
      />
      <NoteRectangles
        strokeColor={borderColor}
        rects={normalNotes.map(colorize)}
        zIndex={zIndex + 0.1}
      />
    </>
  )
})
