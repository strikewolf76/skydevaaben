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

Bank A drum lanes (channel 1). Bank offset is +16 per bank, so bank B pad 1 = 40.

| OXI lane | Pad | Note |
| --- | --- | --- |
| 1 | A1 | 24 |
| 2 | A2 | 25 |
| 3 | A3 | 26 |
| 4 | A4 | 27 |
| 5 | A5 | 20 |
| 6 | A6 | 21 |
| 7 | A7 | 22 |
| 8 | A8 | 23 |

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
| 7 | Multitrack | Out B ch 1 | SP-404 main drum kit, pads A1-A8 |
| 8 | Multitrack | Out B ch 1 | SP-404 percussion and fills, pads A9-A16 |

Sequencer 6 is free. Sequencer 1 can also control SP drums and FX, but sequencers
7 and 8 are the standard 16-pad layout; see the [drum palette guide](sp-404mk2/README.md).
Chord mode on sequencer 4 can be harmonised to the others.

## Instrument definitions

Load these in the OXI app (the device holds 8 slots):

- `device_device_SP-404MK2.json`
- `device_device_JU-06A.json`
- `device_device_Nymphes.json`
- `device_device_Typhon.json`

There is no definition for the Model D (no public MIDI map found). It will work for notes and pitch bend.

## Keystep

- Keystep plays whichever OXI track is selected, so you can play and record any instrument.
- Turn the Keystep's own sequencer and arpeggiator off, and let OXI send the clock.

## To confirm on the hardware

- How to set the Model D's MIDI channel, and whether it responds to CC.
- That the OXI sends MIDI clock on both Out A and Out B.
- That the SP-404 is set to follow external MIDI clock.
- Each device's MIDI port type (DIN or TRS) for the thru box cabling.
