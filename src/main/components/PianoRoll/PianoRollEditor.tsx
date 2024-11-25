import styled from "@emotion/styled"
import { SplitPaneProps } from "@ryohey/react-split-pane"
import { observer } from "mobx-react-lite"
import { FC, ReactNode, useEffect } from "react"
import { songFromMidi } from "../../../common/midi/midiConversion"
import { setSong } from "../../actions"
import { useStores } from "../../hooks/useStores"
import { PianoRollKeyboardShortcut } from "../KeyboardShortcut/PianoRollKeyboardShortcut"
import PianoRoll from "./PianoRoll"
import { StyledSplitPane } from "./StyledSplitPane"
const ColumnContainer = styled.div`
  display: flex;
  flex-direction: column;
  flex-grow: 1;
`

const PaneLayout: FC<SplitPaneProps & { isShow: boolean; pane: ReactNode }> = ({
  isShow,
  pane,
  children,
  ...props
}) => {
  if (isShow) {
    return (
      <StyledSplitPane {...props}>
        {pane}
        {children}
      </StyledSplitPane>
    )
  }
  return <>{children}</>
}
export const songFromFile = async (file: File | string) => {
  let buf: ArrayBuffer

  if (typeof file === "string") {
    // If the input is a string, assume it's the path to the static MIDI file
    const response = await fetch(file)
    if (!response.ok) {
      throw new Error("Failed to fetch MIDI file")
    }
    buf = await response.arrayBuffer()
  } else {
    // If the input is a File object, read it directly
    buf = await file.arrayBuffer()
  }

  const song = songFromMidi(new Uint8Array(buf))

  // Rest of your code remains the same...
  if (song.name.length === 0) {
    // Use the file name without extension as the song title
    song.name =
      typeof file === "string"
        ? file.replace(/\.[^/.]+$/, "")
        : file.name.replace(/\.[^/.]+$/, "")
  }
  song.filepath = typeof file === "string" ? file : file.name
  song.isSaved = true

  return song
}
export const PianoRollEditor: FC = observer(() => {
  const { pianoRollStore, rootViewStore } = useStores()
  const { showTrackList, showEventList } = pianoRollStore
  const rootStore = useStores()
  useEffect(() => {
    const fetchData = async () => {
      try {
        const song = await songFromFile("test.mid")
        setSong(rootStore)(song)
      } catch (error) {
        // Handle errors, e.g., log or show an alert
        console.error("Error fetching data:", error)
      }
    }

    fetchData()
  }, [])
  return (
    <ColumnContainer>
      <PianoRollKeyboardShortcut />
      <div style={{ display: "flex", flexGrow: 1, position: "relative" }}>
        <PaneLayout
          split="vertical"
          minSize={280}
          pane1Style={{ display: "none" }}
          pane2Style={{ display: "flex" }}
          isShow={showTrackList}
          pane={<></>}
        >
          <PaneLayout
            split="vertical"
            minSize={240}
            pane1Style={{ display: "none" }}
            pane2Style={{ display: "flex" }}
            isShow={showEventList}
            pane={<></>}
          >
            <PianoRoll />
          </PaneLayout>
        </PaneLayout>
      </div>
    </ColumnContainer>
  )
})
