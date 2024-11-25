import { AnyEvent } from "midifile-ts"
import {
  AnyEventFeature,
  DeltaTimeProvider,
  isSequencerSpecificEvent,
  TickProvider,
} from "../track"
import { mapToSignalEvent } from "../track/signalEvents"
import { DistributiveOmit } from "../types"
import { assemble as assembleNotes } from "./noteAssembler"

export function addTick<T extends DeltaTimeProvider>(events: T[]) {
  let tick = 0
  return events.map((e) => {
    const { deltaTime, ...rest } = e
    tick += deltaTime
    return {
      ...(rest as DistributiveOmit<T, "deltaTime">),
      tick,
    }
  })
}

export const removeUnnecessaryProps = <T>(e: T): T => {
  const { channel, ...ev } = e as any
  return ev
}

export const isSupportedEvent = (e: AnyEventFeature): boolean =>
  !(e.type === "meta" && e.subtype === "endOfTrack")

const toSignalEvent = <
  T extends DistributiveOmit<AnyEvent, "deltaTime"> & TickProvider,
>(
  e: T,
) => {
  if (isSequencerSpecificEvent(e)) {
    return mapToSignalEvent(e)
  }
  return e
}

export function toTrackEvents(events: AnyEvent[]) {
  return assembleNotes(
    addTick(events.filter(isSupportedEvent)).map(toSignalEvent),
  ).map(removeUnnecessaryProps)
}

// toTrackEvents without addTick
export function tickedEventsToTrackEvents(
  events: (DistributiveOmit<AnyEvent, "deltaTime"> & TickProvider)[],
) {
  return assembleNotes(events.filter(isSupportedEvent).map(toSignalEvent)).map(
    removeUnnecessaryProps,
  )
}
