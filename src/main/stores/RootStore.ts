import { makeObservable, observable } from "mobx"
import Player from "../../common/player"
import Song, { emptySong } from "../../common/song"
import TrackMute from "../../common/trackMute"
import { GroupOutput } from "../services/GroupOutput"
import { MIDIInput, previewMidiInput } from "../services/MIDIInput"
import { SoundFontSynth } from "../services/SoundFontSynth"
import { ControlStore } from "./ControlStore"
import { MIDIDeviceStore } from "./MIDIDeviceStore"
import PianoRollStore from "./PianoRollStore"
import RootViewStore from "./RootViewStore"
import Router from "./Router"
import { SoundFontStore } from "./SoundFontStore"

export default class RootStore {
  song: Song = emptySong()
  readonly router = new Router()
  readonly trackMute = new TrackMute()
  readonly rootViewStore = new RootViewStore()
  readonly pianoRollStore: PianoRollStore
  readonly controlStore: ControlStore
  readonly midiDeviceStore = new MIDIDeviceStore()
  readonly player: Player
  readonly synth: SoundFontSynth
  readonly metronomeSynth: SoundFontSynth
  readonly synthGroup = new GroupOutput()
  readonly midiInput = new MIDIInput()
  readonly soundFontStore: SoundFontStore

  constructor() {
    makeObservable(this, {
      song: observable.ref,
    })

    const context = new (window.AudioContext || window.webkitAudioContext)()
    this.synth = new SoundFontSynth(context)
    this.metronomeSynth = new SoundFontSynth(context)
    this.synthGroup.outputs.push({ synth: this.synth, isEnabled: true })

    this.player = new Player(
      this.synthGroup,
      this.metronomeSynth,
      this.trackMute,
      this
    )

    this.pianoRollStore = new PianoRollStore(this)
    this.controlStore = new ControlStore(this.pianoRollStore)
    this.soundFontStore = new SoundFontStore(this.synth)

    const preview = previewMidiInput(this)

    this.midiInput.onMidiMessage = (e) => {
      preview(e)
    }

    this.pianoRollStore.setUpAutorun()

    this.init()
  }

  private async init() {
    try {
      await this.synth.setup()
      await this.soundFontStore.init()
      this.setupMetronomeSynth()
    } catch (e) {
      this.rootViewStore.initializeError = e as Error
      this.rootViewStore.openInitializeErrorDialog = true
    }
  }

  private async setupMetronomeSynth() {
    const soundFontURL =
      "https://cdn.jsdelivr.net/gh/ryohey/signal@6959f35/public/A320U_drums.sf2"
    await this.metronomeSynth.setup()
    const data = await (await fetch(soundFontURL)).arrayBuffer()
    await this.metronomeSynth.loadSoundFont(data)
  }
}
