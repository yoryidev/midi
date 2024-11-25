import { GLCanvas, Transform } from "@ryohey/webgl-react";
import { observer } from "mobx-react-lite";
import {
  FC,
  MouseEventHandler,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { setSong } from "../../../actions";
import { matrixFromTranslation } from "../../../helpers/matrix";
import { useStores } from "../../../hooks/useStores";
import { Beats } from "../../GLNodes/Beats";
import { Cursor } from "../../GLNodes/Cursor";
import { Selection } from "../../GLNodes/Selection";
import NoteMouseHandler from "../MouseHandler/NoteMouseHandler";
import { songFromFile } from "../PianoRollEditor";
import { PianoRollStageProps } from "../PianoRollStage";
import { Lines } from "./Lines";
import { Notes } from "./Notes";
// import {setScrollTopInPixels}

export const PianoRollCanvas: FC<PianoRollStageProps> = observer(
  ({ width, height }) => {
    const rootStore = useStores();
    const {
      pianoRollStore,
      pianoRollStore: {
        notesCursor,
        scrollLeft,
        scrollTop,
        rulerStore: { beats },
        cursorX,
        selectionBounds,
      },
      player,
    } = rootStore;
    const [mouseHandler] = useState(new NoteMouseHandler(rootStore));
    const prevStore = [...pianoRollStore.origNotes];
    const handleContextMenu: MouseEventHandler = useCallback((e) => {
      if (pianoRollStore.mouseMode === "selection") {
        e.stopPropagation();
        return;
      }
    }, []);
    useEffect(() => {
      const fetchData = async () => {
        try {
          const song = await songFromFile("test.mid");
          setSong(rootStore)(song);
        } catch (error) {
          // Handle errors, e.g., log or show an alert
          console.error("Error fetching data:", error);
        }
      };

      fetchData();
    }, []);
    useEffect(() => {
      pianoRollStore.canvasWidth = width;
    }, [width]);

    useEffect(() => {
      pianoRollStore.canvasHeight = height;
    }, [height]);

    useEffect(() => {
      const lastNote = prevStore[prevStore.length - 1];
      if (lastNote) {
        const lastPos = lastNote?.x + lastNote?.width;
        let min = prevStore[0].y;
        let max = prevStore[0].y;
        prevStore.map((item) => {
          if (min > item.y) min = item.y;
          if (max < item.y) max = item.y;
        });
        let wscale = 0,
          hscale = 0;
        wscale =
          (width / lastPos - 1) /
          (1.04 + 0.000025 * (2000 - window.innerWidth));

        if (window.innerWidth <= 1440)
          wscale =
            (width / lastPos - 1) /
            (1.053 + 0.00007 * (1440 - window.innerWidth));
        if (window.innerWidth <= 1024)
          wscale =
            (width / lastPos - 1) /
            (1.08 + 0.00015 * (1024 - window.innerWidth));

        if (window.innerWidth <= 768)
          wscale =
            (width / lastPos - 1) / (1.12 + 0.0006 * (768 - window.innerWidth));

        if (window.innerWidth <= 425)
          wscale =
            (width / lastPos - 1) / (1.32 + 0.004 * (425 - window.innerWidth));
        hscale = height / (max - min + prevStore[0].height) - 1;
        if (width != 0) pianoRollStore.scaleAroundPointX(wscale, 0);
        if (height != 0) pianoRollStore.scaleAroundPointY((hscale * 7) / 10, 0);

        let minY = pianoRollStore.notes[0]?.y,
          maxY = pianoRollStore.notes[0]?.y;
        pianoRollStore.notes.map((item) => {
          if (minY > item.y) minY = item.y;
          if (maxY < item.y) maxY = item.y;
        });
        const scrollTopPos =
          (height - (maxY + pianoRollStore.notes[0]?.height - minY)) / 2;
        pianoRollStore.setScrollTopInPixels(minY - scrollTopPos);
      }
    }, [rootStore.song, width, height]);

    useEffect(() => {
      const lastNote = pianoRollStore.notes[pianoRollStore.notes.length - 1];
      if (player.isPlaying && cursorX >= lastNote?.x + lastNote?.width + 20) {
        player.reset();
      }
    }, [cursorX]);

    const scrollXMatrix = useMemo(
      () => matrixFromTranslation(-scrollLeft, 0),
      [scrollLeft]
    );

    const scrollYMatrix = useMemo(
      () => matrixFromTranslation(0, -scrollTop),
      [scrollLeft, scrollTop]
    );

    const scrollXYMatrix = useMemo(
      () => matrixFromTranslation(-scrollLeft, -scrollTop),
      [scrollLeft, scrollTop]
    );
    return (
      <>
        <GLCanvas
          width={width}
          height={height}
          style={{ cursor: notesCursor }}
          onMouseDown={mouseHandler.onMouseDown}
          onMouseMove={mouseHandler.onMouseMove}
          onMouseUp={mouseHandler.onMouseUp}
        >
          <Transform matrix={scrollYMatrix}>
            <Lines zIndex={0} />
          </Transform>
          <Transform matrix={scrollXMatrix}>
            <Beats height={height} beats={beats} zIndex={1} />
            <Cursor x={cursorX} height={height} zIndex={5} />
          </Transform>
          <Transform matrix={scrollXYMatrix}>
            <Notes zIndex={3} />
            <Selection rect={selectionBounds} zIndex={4} />
          </Transform>
        </GLCanvas>
      </>
    );
  }
);
