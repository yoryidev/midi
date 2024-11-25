import styled from "@emotion/styled";
import Pause from "mdi-react/PauseIcon";
import PlayArrow from "mdi-react/PlayArrowIcon";
import { FC } from "react";
import { CircleButton } from "./CircleButton";

declare global {
  interface Window {
    colors: any;
  }
}
export const StyledButton = styled(CircleButton)`
  position: fixed;
  top: 50%;
  left: 50%;
  width: 150px;
  height: 150px;
  transform: translate(-50%, -50%);
  display: flex;
  background: ${window.colors.primary};
  svg {
    width: 100%;
    height: 100%;
  }
  &:hover {
    background: ${window.colors.primary};
    opacity: 0.8;
  }

  &.active {
    background: ${window.colors.primary};
  }
  @media (max-width: 560px) {
    width: 100px;
    height: 100px;
  }
`;

export interface PlayButtonProps {
  onClick?: () => void;
  isPlaying: boolean;
}

export const MiddlePlayButton: FC<PlayButtonProps> = (
  { onClick, isPlaying },
  ref
) => {
  if (!isPlaying)
    return (
      <StyledButton
        id="button-play"
        onClick={onClick}
        className={isPlaying ? "active" : undefined}
      >
        {isPlaying ? <Pause /> : <PlayArrow />}
      </StyledButton>
    );
  return <></>;
};
