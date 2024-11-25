import { Measure } from "../measure/Measure"

export interface Beat {
  measure: number
  beat: number
  tick: number
}

export type BeatWithX = Beat & {
  x: number
}

// Find Measure within the range.The first element also includes something before StartTick
const getMeasuresInRange = (
  measures: Measure[],
  startTick: number,
  endTick: number,
) => {
  let i = 0
  const result: Measure[] = []

  for (const measure of measures) {
    const nextMeasure = measures[i + 1]
    i++

    // Find the first MEASURE
    if (result.length === 0) {
      if (nextMeasure !== undefined && nextMeasure.startTick <= startTick) {
        // Skip if the next Measure can be the first
      }
      if (measure.startTick > startTick) {
        console.warn("There is no initial time signature. Use 4/4 by default")
        result.push({ startTick: 0, measure: 0, numerator: 4, denominator: 4 })
      } else {
        result.push(measure)
      }
    }

    // Find the remaining MEASURE. If you can handle correctly if you do not have the first MEASURE, check if you do the first MEASURE, rather than ELSE
    if (result.length !== 0) {
      if (measure.startTick <= endTick) {
        result.push(measure)
      } else {
        break
      }
    }
  }

  return result
}

export const createBeatsInRange = (
  allMeasures: Measure[],
  timebase: number,
  startTick: number,
  endTick: number,
): Beat[] => {
  const beats: Beat[] = []
  const measures = getMeasuresInRange(allMeasures, startTick, endTick)

  measures.forEach((measure, i) => {
    const nextMeasure = measures[i + 1]

    const ticksPerBeat = (timebase * 4) / measure.denominator

    // Make a beat up to the next bar or song EndTick
    const lastTick = nextMeasure ? nextMeasure.startTick : endTick

    const startBeat = Math.max(
      0,
      Math.floor((startTick - measure.startTick) / ticksPerBeat),
    )
    const endBeat = (lastTick - measure.startTick) / ticksPerBeat

    for (let beat = startBeat; beat < endBeat; beat++) {
      const tick = measure.startTick + ticksPerBeat * beat
      beats.push({
        measure: measure.measure + Math.floor(beat / measure.numerator),
        beat: beat % measure.numerator,
        tick,
      })
    }
  })

  return beats
}

export const createBeatsWithXInRange = (
  allMeasures: Measure[],
  pixelsPerTick: number,
  timebase: number,
  startTick: number,
  width: number,
): BeatWithX[] => {
  const endTick = startTick + width / pixelsPerTick
  return createBeatsInRange(allMeasures, timebase, startTick, endTick).map(
    (b) => ({
      ...b,
      x: Math.round(b.tick * pixelsPerTick),
    }),
  )
}
