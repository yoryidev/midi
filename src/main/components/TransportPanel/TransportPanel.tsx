import styled from "@emotion/styled";
import FastForward from "mdi-react/FastForwardIcon";
import FastRewind from "mdi-react/FastRewindIcon";
import Loop from "mdi-react/LoopIcon";
import MetronomeIcon from "mdi-react/MetronomeIcon";
import Stop from "mdi-react/StopIcon";
import { observer } from "mobx-react-lite";
import { FC, useCallback } from "react";
import {
  fastForwardOneBar,
  playOrPause,
  rewindOneBar,
  stop,
  toggleEnableLoop,
} from "../../actions";
import { useStores } from "../../hooks/useStores";
import { CircleButton } from "./CircleButton";
import { MiddlePlayButton } from "./MiddlePlayButton";
import { PlayButton } from "./PlayButton";
import { TempoForm } from "./TempoForm";

const Toolbar = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.25rem 1rem;
  background: ${({ theme }) => theme.backgroundColor};
  border-top: 1px solid ${({ theme }) => theme.dividerColor};
  height: 3rem;
  box-sizing: border-box;
`;

const LoopButton = styled(CircleButton)`
  &.active {
    color: ${({ theme }) => theme.themeColor};
  }
`;

const MetronomeButton = styled(CircleButton)`
  &.active {
    color: ${({ theme }) => theme.themeColor};
  }
`;

const TimestampText = styled.div`
  font-family: "Roboto Mono", monospace;
  font-size: 0.9rem;
  color: ${({ theme }) => theme.secondaryTextColor};
`;

const Timestamp: FC = observer(() => {
  const { pianoRollStore } = useStores();
  const mbtTime = pianoRollStore.currentMBTTime;
  return <TimestampText>{mbtTime}</TimestampText>;
});

export const ToolbarSeparator = styled.div`
  background: ${({ theme }) => theme.dividerColor};
  margin: 0.4em 1em;
  width: 1px;
  height: 1rem;
  @media (max-width: 560px) {
    display: none;
  }
`;

export const Right = styled.div`
  position: absolute;
  right: 1em;
`;

export const TransportPanel: FC = observer(() => {
  const rootStore = useStores();
  const { player, synth } = rootStore;

  const { isPlaying, isMetronomeEnabled, loop } = player;
  const isSynthLoading = synth.isLoading;

  const onClickPlay = playOrPause(rootStore);

  const onClickStop = stop(rootStore);
  const onClickBackward = rewindOneBar(rootStore);
  const onClickForward = fastForwardOneBar(rootStore);
  const onClickEnableLoop = toggleEnableLoop(rootStore);
  const onClickMetronone = useCallback(() => {
    player.isMetronomeEnabled = !player.isMetronomeEnabled;
  }, [player]);

  return (
    <Toolbar>
      <CircleButton onClick={onClickBackward}>
        <FastRewind />
      </CircleButton>

      <CircleButton onClick={onClickStop}>
        <Stop />
      </CircleButton>
      <MiddlePlayButton onClick={onClickPlay} isPlaying={isPlaying} />
      <PlayButton onClick={onClickPlay} isPlaying={isPlaying} />

      <CircleButton onClick={onClickForward}>
        <FastForward />
      </CircleButton>
      {loop && (
        <LoopButton
          onClick={onClickEnableLoop}
          className={loop.enabled ? "active" : undefined}
        >
          <Loop />
        </LoopButton>
      )}

      <ToolbarSeparator />

      <Timestamp />
    </Toolbar>
  );
});
