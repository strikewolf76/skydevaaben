# name=Synido TempoPAD C16 MK2 Mixer

import channels
import midi
import mixer
import ui


FRAME_SIZE = 4
MIDI_CHANNEL_STATUS = 0xB0
BANK_CC = 9
STEREO_CC = 10
PAN_CCS = (13, 14, 15, 16)
FADER_CCS = (37, 38, 39, 40)
MUTE_CCS = (61, 64, 67, 70)
SOLO_CCS = (62, 65, 68, 71)
ARM_CCS = (63, 66, 69, 72)

frame_start = 1
rack_start = 0
rack_view_state = None
pressed_buttons = set()


def last_track():
    # trackCount includes the special Current track, which is not an insert.
    return mixer.trackCount() - 2


def show_frame(scroll=False):
    ui.miDisplayRect(frame_start, frame_start + FRAME_SIZE - 1, midi.MaxInt)
    if scroll:
        ui.scrollWindow(0, frame_start + FRAME_SIZE - 1)
        ui.scrollWindow(0, frame_start)


def OnInit():
    show_frame()


def OnDeInit():
    ui.miDisplayRect(frame_start, frame_start + FRAME_SIZE - 1, 1)
    ui.crDisplayRect(0, 0, 0, 1, 0, midi.CR_HighlightChannelName)


def OnProjectLoad(status):
    global frame_start, rack_start, rack_view_state
    frame_start = min(frame_start, max(1, last_track() - FRAME_SIZE + 1))
    rack_start = 0
    rack_view_state = None
    pressed_buttons.clear()
    show_frame()


def show_rack_frame(scroll=False):
    count = min(FRAME_SIZE, channels.channelCount() - rack_start)
    if count > 0:
        flags = midi.CR_HighlightChannelName
        if scroll:
            flags |= midi.CR_ScrollToView
        ui.crDisplayRect(0, rack_start, 0, count, midi.MaxInt, flags)
    else:
        ui.crDisplayRect(0, 0, 0, 1, 0, midi.CR_HighlightChannelName)


def OnIdle():
    global rack_start, rack_view_state
    focused = ui.getFocused(1)
    count = channels.channelCount()
    state = (focused, count)
    if state != rack_view_state:
        rack_view_state = state
        rack_start = min(rack_start, max(0, count - FRAME_SIZE))
        if focused:
            show_rack_frame()


def handle_rack_message(event):
    global rack_start

    cc = event.data1
    value = event.data2
    count = channels.channelCount()
    rack_start = min(rack_start, max(0, count - FRAME_SIZE))

    if cc == BANK_CC:
        event.handled = True
        delta = value - 64
        if delta:
            rack_start = max(0, min(max(0, count - FRAME_SIZE),
                                    rack_start + 2 * delta))
            show_rack_frame(scroll=True)
    elif cc in PAN_CCS:
        event.handled = True
        channel = rack_start + PAN_CCS.index(cc)
        if channel < count:
            pan = channels.getChannelPan(channel) + (value - 64) / 64
            channels.setChannelPan(channel, max(-1.0, min(1.0, pan)))
    elif cc in FADER_CCS:
        event.handled = True
        channel = rack_start + FADER_CCS.index(cc)
        if channel < count:
            channels.setChannelVolume(channel, value / 127, midi.PIM_AlwaysPickup)
    elif cc in MUTE_CCS or cc in SOLO_CCS or cc in ARM_CCS:
        event.handled = True
        if value != 0 and cc not in pressed_buttons:
            pressed_buttons.add(cc)
            if cc in MUTE_CCS:
                channel = rack_start + MUTE_CCS.index(cc)
                action = channels.muteChannel
            elif cc in SOLO_CCS:
                channel = rack_start + SOLO_CCS.index(cc)
                action = channels.soloChannel
            else:
                channel = rack_start + ARM_CCS.index(cc)
                action = channels.selectOneChannel
            if channel < count:
                action(channel)


def OnMidiMsg(event):
    global frame_start

    if event.status != MIDI_CHANNEL_STATUS:
        return

    cc = event.data1
    value = event.data2
    if value == 0 and (cc in MUTE_CCS or cc in SOLO_CCS or cc in ARM_CCS):
        pressed_buttons.discard(cc)
    if ui.getFocused(1):
        handle_rack_message(event)
        return
    if not ui.getFocused(0):
        return

    if cc == BANK_CC:
        event.handled = True
        delta = value - 64
        if delta:
            frame_start = max(1, min(last_track() - FRAME_SIZE + 1,
                                     frame_start + 2 * delta))
            show_frame(scroll=True)
    elif cc == STEREO_CC:
        event.handled = True
        track = mixer.trackNumber()
        if 0 <= track <= last_track():
            stereo = mixer.getTrackStereoSep(track) + (value - 64) / 64
            mixer.setTrackStereoSep(track, max(-1.0, min(1.0, stereo)))
    elif cc in PAN_CCS:
        event.handled = True
        track = frame_start + PAN_CCS.index(cc)
        pan = mixer.getTrackPan(track) + (value - 64) / 64
        mixer.setTrackPan(track, max(-1.0, min(1.0, pan)))
    elif cc in FADER_CCS:
        event.handled = True
        track = frame_start + FADER_CCS.index(cc)
        mixer.setTrackVolume(track, value / 127, midi.PIM_AlwaysPickup)
    elif cc in MUTE_CCS or cc in SOLO_CCS or cc in ARM_CCS:
        event.handled = True
        if value != 0 and cc not in pressed_buttons:
            pressed_buttons.add(cc)
            if cc in MUTE_CCS:
                mixer.muteTrack(frame_start + MUTE_CCS.index(cc))
            elif cc in SOLO_CCS:
                mixer.soloTrack(frame_start + SOLO_CCS.index(cc))
            else:
                mixer.armTrack(frame_start + ARM_CCS.index(cc))
