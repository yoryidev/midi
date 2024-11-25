import styled from "@emotion/styled"
import { observer } from "mobx-react-lite"
import { FC } from "react"
import { useStores } from "../../hooks/useStores"
import { PianoRollEditor } from "../PianoRoll/PianoRollEditor"
import { TransportPanel } from "../TransportPanel/TransportPanel"

const Container = styled.div`
  height: 100%;
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  overflow: hidden;
`

const Column = styled.div`
  height: 100%;
  display: flex;
  flex-grow: 1;
  flex-direction: column;
`

const Routes: FC = observer(() => {
  const { router } = useStores()
  const path = router.path
  return <>{path === "/track" && <PianoRollEditor />}</>
})

export const RootView: FC = () => (
  <>
    <Column>
      <Container>
        <Routes />
        <TransportPanel />
      </Container>
    </Column>
  </>
)
