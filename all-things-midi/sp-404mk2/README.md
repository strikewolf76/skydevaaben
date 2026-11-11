# OBRST SP-404MKII drum palette

This is the standard 16-pad layout for every OBRST drum palette. A palette is a
set of sounds in **sample bank A** of an SP-404MKII project. Change the sounds
to suit the project, but **keep the instrument role on the same numbered pad**.
OXI patterns can then be reused without remapping the drums.

An SP project contains ten sample banks and ten pattern banks; a palette is not
itself a separate project. Use a different project when you want an independent
set of banks and patterns. A pattern changes the rhythm, not the pad layout.
This document is a setup reference, not a preconfigured SP or OXI project.

## Fixed routing

- Connect OXI ONE MKII **Out B** to the SP MIDI input.
- Set the SP to **MIDI mode B**, with the default MIDI note offset.
- Use SP **sample bank A**, addressed on MIDI channel **1**.
- Use OXI sequencers **7 and 8**, both in **Multitrack** mode. Each has eight
  tracks; every track sends to **Out B, channel 1**.
- The MIDI note numbers below are absolute MIDI numbers, not pad numbers.
  Octave names can differ between devices, so check by triggering the pad.
- Seq 7 tracks 1-8 play SP pads A1-A8. Seq 8 tracks 1-8 play SP pads A9-A16.
  For example, Seq 8 track 1 plays pad A9; it is not OXI track 9.

## Standard pad assignments

### Seq 7: main drum kit

| OXI track | SP pad | MIDI note | Instrument | Role | LinnDrum example WAV |
| --- | --- | ---: | --- | --- | --- |
| 1 | A1 | 24 | Bass drum | Foundation | `BD Lindrum Orig.wav` |
| 2 | A2 | 25 | Snare | Backbeat | `SD Lindrum Orig 17.wav` |
| 3 | A3 | 26 | Closed hi-hat | Timekeeping | `CH Lindrum Orig Decay 06.wav` |
| 4 | A4 | 27 | Open hi-hat | Accent | `OH Lindrum Orig.wav` |
| 5 | A5 | 20 | Clap | Snare layer | `Clap Lindrum Orig.wav` |
| 6 | A6 | 21 | Side stick | Variation | `SS Lindrum Orig 11.wav` |
| 7 | A7 | 22 | Crash | Transition | `Crash Lindrum Orig.wav` |
| 8 | A8 | 23 | Ride | Drive | `Ride Lindrum Orig.wav` |

### Seq 8: percussion and fills

| OXI track | SP pad | MIDI note | Instrument | Role | LinnDrum example WAV |
| --- | --- | ---: | --- | --- | --- |
| 1 | A9 | 16 | Cabasa | Subdivision | `Cabasa Lindrum Orig.wav` |
| 2 | A10 | 17 | Tambourine | Groove | `Tamb Lindrum Orig.wav` |
| 3 | A11 | 18 | Low conga | Syncopation | `Conga Lindrum Orig 24 F#3.wav` |
| 4 | A12 | 19 | High conga | Response | `Conga Lindrum Orig 36 F#4.wav` |
| 5 | A13 | 12 | Cowbell | Accent | `Cowbell Lindrum Orig.wav` |
| 6 | A14 | 13 | Low tom | Fill | `Tom Lindrum Orig 09.wav` |
| 7 | A15 | 14 | Mid tom | Fill | `Tom Lindrum Orig 18.wav` |
| 8 | A16 | 15 | High tom | Fill | `Tom Lindrum Orig 22.wav` |

The example files are in the local `Lindrum From Mars\WAV\02. Kits\01. OG Clean
Kit` folder. They are not included in this repository. The conga filenames
include `F#3` and `F#4`; select the exact files shown above.

## One-time OXI setup

1. Connect the devices and set the SP MIDI mode and note offset as described
   under **Fixed routing**.
2. Hold **SHIFT + 7** and select **Multitrack**. Repeat for **SHIFT + 8**.
3. For each of the 16 tracks, open its track menu by holding the sequencer
   button and pressing the first-column pad for that track, or by pressing
   **TRACK** and then that pad. Set its output to **B** and MIDI channel to
   **1**. Set **Ofs** (knob 2) to the note corresponding to its SP pad in the
   tables. Use preview and confirm the actual pad triggered.
4. Save the configured OXI project as your starting point. When creating new
   patterns or projects, retain these track settings and base notes. Step note
   changes or transposition can send a different note, so check them if a track
   triggers the wrong sound.

The existing [full Mode B pad map](../oximk2/SP404_ModeB_Pad_Map.txt) covers
other banks. The numbers in this guide are specifically for bank A.

## Checklist: set up a new drum palette

1. **Choose the project safely.** Decide whether to use an existing SP project
   or a separate one. Press **SHIFT + SUB PAD** and select the intended project
   slot. Confirm which project is loaded and check its contents. Selecting a
   slot does not guarantee that it is empty; do not overwrite work you need.
   Back up existing material first.
2. **Choose bank A.** Press **A/F** until the button is steadily lit for bank A,
   not blinking for bank F. Inspect pads A1-A16 before importing.
3. **Choose 16 sounds by role.** Use the two tables above as the permanent
   assignment list. For a new palette, substitute your preferred kick, snare,
   hi-hats, percussion and toms, but put each on the same pad as its role.
   If a role is not needed, leave that pad empty rather than move another role
   into its place.
4. **Prepare the SD card.** Copy the chosen WAV files from your computer into
   the `IMPORT` folder on an SP-formatted SD card. For the LinnDrum example,
   use the exact filenames in the tables.
5. **Import one pad at a time.** Insert the card. From the top screen press
   **SHIFT + pad 14**, choose **IMPORT from SD-CARD**, then **SAMPLE**. Select
   the destination pad, choose its WAV with **VALUE**, and press **VALUE** to
   import. Repeat for each assigned pad. Follow the tables rather than assuming
   an alphabetical or bulk-import order.
6. **Protect existing work.** Importing onto an occupied pad prompts for
   confirmation and overwrites that pad's sample. Cancel unless replacement is
   intended. Do not remove the card or power off while the SP shows
   **Working...**.
7. **Check the sounds.** Play each SP pad directly, then trigger each OXI track:
   Seq 7 tracks 1-8 must play A1-A8, and Seq 8 tracks 1-8 must play A9-A16.
   Check levels, starts, tails and any playback settings as needed for the kit.
8. **Keep a reusable starting point.** Note the SP project slot and palette
   name, save the OXI project, and back up the SP project. When switching to a
   new SP palette or OXI pattern, run the trigger check again.

If a track plays the wrong pad, check the project and sample bank, SP MIDI mode
and note offset, OXI output and channel, track note offset, and any step note
or transposition changes before changing the pad layout.

## References

- [Overall MIDI setup](../setup-plan.md)
- Roland: [selecting a project](https://static.roland.com/manuals/sp-404mk2_reference/eng/17805617.html),
  [selecting a sample bank](https://static.roland.com/manuals/sp-404mk2_reference/eng/17804979.html),
  [importing samples](https://static.roland.com/manuals/sp-404mk2_reference_v550/en-US/7958977178537867.html),
  and [MIDI note map](https://static.roland.com/manuals/sp-404mk2_reference_v550/en-US/8012353178593931.html).
- OXI: [Multitrack setup walkthrough](https://docs.oxiinstruments.com/oxi-one-mkii-manual/workflow/)
  and [Multitrack mode](https://docs.oxiinstruments.com/oxi-one-mkii-manual/multitrack-mode/).
