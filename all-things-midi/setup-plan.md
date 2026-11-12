# OXI One MkII setup plan

OXI One MkII is the brain: it sequences everything and sends clock. The KeyStep is only a keyboard.

## Cabling

```
KeyStep 37 mk2 --MIDI OUT--> OXI MIDI IN          (USB-C also works)
OXI Out A --> MIDI thru box --> Model D, Typhon, JU-06A, Nymphes
OXI Out B --> SP-404MK2 MIDI IN                   (SP-404 in MIDI Mode B)
```

- OXI MIDI is Type-A TRS. A DIN adapter is included; the SP-404MK2 is also TRS, so a TRS-to-TRS cable should work (confirm it is Type A).
- Out A feeds four DIN synths, so it needs a thru box (or OXI Split). Out B only serves the SP-404.

## Channel plan

| Port | Ch | Device | Role |
| --- | --- | --- | --- |
| Out A | 1 | Dreadbox Typhon | Bass / lead |
| Out A | 2 | Roland JU-06A | Chords / pads |
| Out A | 3 | Nymphes | Poly / pads |
| Out A | 4 | Behringer Model D | Bass |
| Out B | 1 | SP-404MK2 | Pads banks A-E, BUS 1 FX |
| Out B | 2 | SP-404MK2 | Pads banks F-J, BUS 2 FX |
| Out B | 3 | SP-404MK2 | BUS 3 FX |
| Out B | 4 | SP-404MK2 | BUS 4 FX |
| Out B | 5 | SP-404MK2 | Input FX |

Set each synth to its channel number above. Out A and Out B are separate ports, so the SP-404 channels never collide with the synths.

## SP-404MK2 (Mode B)

Pad notes and effect CCs use the same channels, so one OXI track can send both.

Seq 8 main drum tracks, in descending order (bank A, channel 1). Bank offset is
+16 per bank, so bank B pad 1 = 40.

| OXI track | Pad | Note |
| --- | --- | --- |
| 8 | A1 | 24 |
| 7 | A2 | 25 |
| 6 | A3 | 26 |
| 5 | A4 | 27 |
| 4 | A5 | 20 |
| 3 | A6 | 21 |
| 2 | A7 | 22 |
| 1 | A8 | 23 |

Effect CCs (mod lanes), from the SP-404MK2 definition:

- CC16-18 and CC80-82: Control 1-6
- CC19: effect on/off (0-63 off, 64-127 on)
- CC83: effect number

Full note map: `oximk2/SP404_ModeB_Pad_Map.txt`.

## OXI layout

| Sequencer | Type | Output | Use |
| --- | --- | --- | --- |
| 1 | Multitrack | Out B ch 1 | Optional SP-404 drums, plus mod lanes for FX |
| 2 | Mono | Out A ch 4 | Model D |
| 3 | Mono | Out A ch 1 | Typhon |
| 4 | Poly / Chord | Out A ch 2 | JU-06A |
| 5 | Poly | Out A ch 3 | Nymphes |
| 7 | Multitrack | Out B ch 1 | SP-404 percussion and fills, pads A9-A16 |
| 8 | Multitrack | Out B ch 1 | SP-404 main drum kit, pads A1-A8 |

Sequencer 6 is free. Sequencer 1 can also control SP drums and FX, but sequencers
7 and 8 are the standard 16-pad layout; see the [drum palette guide](sp-404mk2/README.md).
Chord mode on sequencer 4 can be harmonised to the others.

## Synth modulation lanes

Use the following six-lane starting layout for the synth sequencers. The lane
number is an OXI modulation lane; the CC number is the MIDI destination.
All three sequencers send to Out A on their assigned channels above.

| Mod lane | Typhon: Seq 3, ch 1 | JU-06A: Seq 4, ch 2 | Nymphes: Seq 5, ch 3 |
| --- | --- | --- | --- |
| 1: Filter | CC 74: Filter cutoff | CC 74: VCF frequency | CC 74: LPF cutoff |
| 2: Tone | CC 4: Filter FM | CC 71: VCF resonance | CC 71: Resonance |
| 3: Envelope | CC 6: Filter EG level | CC 22: VCF envelope depth | CC 3: LPF EG depth |
| 4: Motion | CC 70: Waveshape | CC 3: LFO rate | CC 18: LFO 1 rate |
| 5: Space | CC 91: FX2 mix | CC 91: Delay level | CC 78: Reverb mix |
| 6: Colour | CC 97: FX3 mix | CC 93: Chorus type | CC 12: Pulse width |
| 7 | Off | Off | Off |
| 8 | Off | Off | Off |

For the Model D on Seq 2, leave all eight modulation lanes off until its MIDI
implementation has been confirmed. This synth-lane convention does not apply
to the SP-404 sequencers.

### Configure on the OXI

1. Load the instrument definitions listed below and select the matching
   definition for each synth sequencer. These files supply CC names and numbers;
   they do **not** configure modulation lanes.
2. Select Seq 3, open **MOD**, select a lane, and press **PAGE** for its lane
   settings. Assign **CC Dest 1** for lanes 1-6 to the Typhon destination in the
   table. Set **CC Dest 2** to **Off** unless intentionally using it.
3. For lanes 7 and 8, set both **CC Dest 1** and **CC Dest 2** to **Off**.
   Also set **Int Dest 1** and **Int Dest 2** to **Off** so the lanes remain
   unused. Repeat for the JU-06A on Seq 4 and Nymphes on Seq 5, using their
   respective table columns. Leave all four destinations off on Seq 2.
4. Confirm that each sequencer sends through Out A on its assigned channel,
   then test each destination at a moderate level. Save the configured OXI
   project as the starting point for new patterns and projects.

Leaving lanes 7 and 8 off does not reserve MIDI CC numbers 7 and 8 globally.
The synth definitions retain their actual CC mappings. The Typhon 4.2.1
destinations should be checked against its on-device MIDI CC LIST before use.
Typhon FX mixes depend on the selected effects; JU-06A chorus type is stepped,
not continuous. Start gently with filter FM and resonance.

[OXI modulation lane settings](https://docs.oxiinstruments.com/oxi-one-mkii-manual/modulation/)
describe the destination controls. These settings must be made on the OXI; this
file is a reference, not a configured project.

## Instrument definitions

Load these in the OXI app (the device holds 8 slots):

- `oximk2/device_device_SP-404MK2.oxiindef`
- `oximk2/device_device_JU-06A.oxiindef`
- `oximk2/device_device_Nymphes.oxiindef`
- `oximk2/device_device_Typhon.oxiindef`

The Typhon definition targets firmware 4.2.1's revised CC mapping, based on the
[MIDI Guide list](https://midi.guide/d/dreadbox/typhon/). Check its CC numbers
against the Typhon's MIDI CC LIST before use. The SP definition's DJ and looper
controls only apply in those modes; looper delete erases the looper recording,
and looper stop all samples requires four quick triggers.
These definitions control CC parameters; configure pad note offsets separately.

There is no definition for the Model D (no public MIDI map found). It will work for notes and pitch bend.

## Keystep

- Keystep plays whichever OXI track is selected, so you can play and record any instrument.
- Turn the Keystep's own sequencer and arpeggiator off, and let OXI send the clock.

## To confirm on the hardware

- How to set the Model D's MIDI channel, and whether it responds to CC.
- That the OXI sends MIDI clock on both Out A and Out B.
- That the SP-404 is set to follow external MIDI clock.
- Each device's MIDI port type (DIN or TRS) for the thru box cabling.
