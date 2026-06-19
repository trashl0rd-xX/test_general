// NIGHTFIELD — main story file
// External functions injected by narrativeEngine.ts
EXTERNAL getSanity()
EXTERNAL hasFlag(flag)
EXTERNAL hasItem(itemId)

-> open_field_center

// ============================================================
// ROOMS
// ============================================================

=== open_field_center ===
{not hasFlag("awakened"):
    You are lying on your back in a field.
    The grass is cold and wet against your neck. Stars press against the sky with too much force, too much brightness. You don't know how long you've been here. You don't know how you got here.
    You sit up.
    The treeline surrounds you on all sides. A perfect circle of dark. The trees begin exactly where the starlight ends, as if the darkness was placed there deliberately.
    Somewhere deep in the woods, to the north, something glows.
    # SET_FLAG:awakened
    # SANITY:-3
- else:
    The field stretches flat and pale around you. The stars haven't moved. You're not sure they can.
    {getSanity() < 40: The grass near your feet is bent in a shape you don't want to look at directly.}
}
* [Move toward the light]
    -> treeline_north
* [Search the field around you]
    -> field_search
* [Stand still and listen]
    -> field_listen
- -> open_field_center

=== field_search ===
You move through the grass in a slow circle. It comes up to your knees. There's nothing here — no bag, no phone, no keys. Whoever you were when you arrived, you brought nothing with you.
{not hasFlag("found_watch"):
    Your wrist catches the starlight. You're wearing a watch. The glass is cracked. It reads 3:14 and is not moving.
    # SET_FLAG:found_watch
    # ADD_ITEM:cracked_watch
}
# SANITY:-1
-> open_field_center

=== field_listen ===
You hold your breath.
Wind through grass. Something far off — an owl, maybe, or something making a sound like an owl. The hum of the field itself, low and constant, almost like electricity.
Then, from the north: a single branch snapping. Something heavy.
{getSanity() < 50: You feel certain that whatever made that sound is now aware you heard it.}
# SANITY:-4
-> open_field_center

// ============================================================

=== treeline_north ===
The treeline is a wall. Up close the trees are older than they should be — trunks too wide, bark peeling in long strips. The darkness between them is complete. Not dim. Not shadowed. Complete.
The light is visible through the canopy — pale, amber, half a mile north at least. Maybe more.
{getSanity() < 50: Something is breathing just past the first row of trees. You can hear it.}
{getSanity() < 30: Your legs don't want to move into the dark.}
# SANITY:-3
* [Step into the trees]
    -> forest_path_a
* [Follow the edge of the treeline east]
    -> treeline_east
* [Go back to the field]
    -> open_field_center
- -> treeline_north

=== treeline_east ===
The treeline curves east. You follow it for what feels like ten minutes. The field is always the same behind you. The trees are always the same beside you.
You find where the treeline dips toward a gap — a deer path, maybe, or something older that deer now use. It leads north, into the dark.
# SANITY:-2
* [Take the gap — enter the forest]
    -> forest_path_b
* [Keep following the edge]
    -> treeline_east_2
* [Return to the field]
    -> open_field_center
- -> treeline_east

=== treeline_east_2 ===
The treeline curves back around. You've gone in a full circle. The gap you found is behind you. The field is ahead.
You've been walking for longer than the geography should allow.
# SANITY:-5
-> open_field_center

// ============================================================

=== forest_path_a ===
The trees close over you immediately. The starlight dies. You move forward with your hands out, feeling for bark, using the gaps between trunks to navigate.
The ground is soft. Your footsteps make almost no sound.
Ahead, there's a clearing — you can see it from the slight brightening of the dark.
{hasFlag("stalker_active"):
    Something moves in the trees to your left. Not toward you. Parallel. Matching your pace.
    # SANITY:-8
}
# SANITY:-2
* [Move toward the clearing]
    -> first_clearing
* [Stop and wait for your eyes to adjust]
    -> forest_path_a_wait
* [Go back]
    -> treeline_north
- -> forest_path_a

=== forest_path_a_wait ===
You stop. Eyes open, eyes shut — it makes almost no difference.
Slowly, shapes resolve. Not the shapes of trees. The shapes of the spaces between trees, which are their own kind of geography.
You can see the path more clearly now. And to your left: nothing moving. The sound, if there was a sound, has stopped.
# SANITY:-1
-> forest_path_a

// ============================================================

=== first_clearing ===
The clearing is round and maybe thirty feet across. The canopy opens and you can see stars again. A fallen log runs across the middle, grey and mossy.
{not hasFlag("found_note_1"):
    There's something pale wedged under the log. Paper.
    # SET_FLAG:found_note_1
}
{getSanity() < 40:
    -> first_clearing_hallucination
}
{hasFlag("stalker_active"):
    At the edge of the clearing, a sound like weight settling into wet soil. Behind you. You don't turn around.
    # SANITY:-10
}
# SANITY:-1
* [Read the paper under the log]
    {hasFlag("found_note_1"): -> read_note_1 | -> first_clearing}
* [Continue north through the clearing]
    -> forest_path_b
* [Take the path east]
    -> hollow_log
* [Go back south]
    -> forest_path_a
- -> first_clearing

=== first_clearing_hallucination ===
// Phantom path — snaps back after 2 turns
You see a door standing upright in the middle of the clearing. It's attached to nothing. The wood is dark and old and the handle is brass and the handle is turning.
* [Open the door]
    You reach out. Your hand passes through the handle as if the door is made of smoke. Then you blink, and it isn't there.
    # SANITY:-6
    -> first_clearing
* [Look away]
    When you look back the door is gone. It was never there.
    # SANITY:-2
    -> first_clearing

=== read_note_1 ===
The paper is damp but legible. It's a note, handwritten, in handwriting that looks like yours:

"The light isn't the destination. The light is how it marks where it's been."

There's a date at the bottom. It's today's date.
# SANITY:-7
* [...]
    -> first_clearing

// ============================================================

=== forest_path_b ===
The path runs north between trees so close you have to turn sideways to pass between them. The light through the canopy is dimmer here. The ground is covered in old leaves that crush silently under your feet.
{hasFlag("stalker_active"):
    Something large moves through the trees thirty feet to your right. You hear it before you see anything, and you don't see anything.
    # SANITY:-6
    # SET_FLAG:stalker_close
}
# SANITY:-2
* [Push north]
    -> dense_thicket
* [Try the east fork]
    -> creek_crossing
* [Go back to the clearing]
    -> first_clearing
- -> forest_path_b

=== hollow_log ===
An enormous fallen trunk, five feet in diameter, its core hollowed by decades of rot. You can see through it — a dark tube maybe eight feet long.
{not hasFlag("stalker_active"):
    It's the kind of place you could hide. If you needed to.
    # SET_FLAG:found_hollow_log
}
{hasFlag("stalker_active"):
    Something is at the edge of the trees. Not moving. Watching the log. You don't go in.
    # SANITY:-8
}
* [Crawl through the hollow log]
    {not hasFlag("stalker_active"):
        You curl yourself into the hollow and pull dead wood around the entrance. You cannot hear anything. Not even wind.
        You stay there until your heart slows.
        # SANITY:+5
    - else:
        You don't. Not with it watching.
    }
    -> hollow_log
* [Go back to the clearing]
    -> first_clearing
- -> hollow_log

// ============================================================

=== creek_crossing ===
You hear the creek before you reach it. Running water — the first sound that isn't wind or your own breathing or the thing in the trees.
The creek is shallow, maybe three feet across. The water is black in the dark. Stones are visible under the surface, pale and smooth. On the far bank, the path continues north.
{hasFlag("stalker_close"):
    Your reflection in the water is wrong. Not wrong-shaped. Just slightly behind you. Like it needs a second to catch up.
    # SANITY:-10
}
# SANITY:-1
* [Cross the creek]
    You step on the stones. The water is very cold. You get across without falling.
    -> forest_path_c
* [Kneel and drink]
    {not hasFlag("drank_creek"):
        You're thirsty. You hadn't noticed until now. The water tastes like mineral and something else you can't name. You drink anyway.
        # SET_FLAG:drank_creek
        # SANITY:-3
    - else:
        You've already drunk from it. You don't again.
    }
    -> creek_crossing
* [Go back]
    -> forest_path_b
- -> creek_crossing

=== dense_thicket ===
The path narrows to almost nothing. Branches drag across your arms. The light from the north seems closer here — amber, warm, wrong somehow. Nothing natural glows that amber in the middle of a night forest.
{hasFlag("stalker_active"):
    Behind you, something exhales. Long. Slow. Like a thing that doesn't need air but learned to breathe anyway.
    # SANITY:-12
    -> dense_thicket_encounter
}
# SANITY:-3
* [Push through toward the light]
    -> fallen_stones
* [Turn back]
    -> forest_path_b
- -> dense_thicket

=== dense_thicket_encounter ===
You can't see it. You can hear it — directly behind you, close enough that you feel the air move.
# SANITY:-5
* [Run]
    You push forward through the thicket, branches tearing at your face. You don't look back. You come out the other side shaking, something pulling at you that you have to force yourself not to name.
    # SANITY:-8
    -> fallen_stones
* [Go very still]
    You stop breathing. You stop moving. You become, as best you can, nothing.
    Thirty seconds pass. A minute. The breathing behind you stops.
    It worked. For now.
    # SANITY:+3
    -> dense_thicket

// ============================================================

=== forest_path_c ===
North of the creek the trees thin slightly. The light is visible without obstruction now — amber, steady, coming from a low building in a clearing ahead. What you assumed was a farmhouse is smaller than a farmhouse. It looks like a groundskeeper's shack.
One window. Light in the window.
# SANITY:-1
* [Approach the shack]
    -> farmhouse_approach
* [Circle wide and look for another way in]
    -> old_fence_line
* [Wait and watch]
    -> forest_path_c_watch
- -> forest_path_c

=== forest_path_c_watch ===
You wait. Five minutes. Ten.
The light in the window doesn't change. There's no movement inside. No sound from the shack.
{getSanity() < 40: Behind you, in the direction you came from, the creek sounds different. Louder. Like something is standing in it.}
# SANITY:-3
-> forest_path_c

// ============================================================

=== old_fence_line ===
A collapsed fence of rotten posts and rusted wire runs east-west across the forest floor. It's old enough that small trees have grown through it. You step over it easily.
On the north side of the fence, the ground slopes downward toward a wide clearing. The shack is visible. There's a second door on this side, facing south. Also lit from within.
{not hasFlag("found_keyring"):
    Caught on the wire of the fence is a small keyring with a single key. No label.
    # ADD_ITEM:keyring
    # SET_FLAG:found_keyring
}
# SANITY:-1
* [Head to the south door of the shack]
    -> farmhouse_approach
* [Follow the fence east]
    -> field_south_slope
- -> old_fence_line

=== field_south_slope ===
The fence runs east until the treeline opens and you step out onto a slope of open grass. You're on the south edge of the same field you woke in, but from the high ground you can see the whole circle of it.
From here you can also see that the path between the treelines — the direct north route you should have taken — is clear. You went the long way around.
{hasFlag("stalker_active"):
    Standing in the middle of the field, very still, is a shape that is roughly the shape of a person but isn't. It's looking in your direction.
    # SANITY:-15
}
# SANITY:-2
* [Cross the field to the north treeline]
    -> treeline_north
* [Go back into the woods]
    -> old_fence_line
- -> field_south_slope

// ============================================================

=== fallen_stones ===
A ring of large stones, half-buried, maybe eight feet in diameter. Not natural. Placed. Old enough that the forest has mostly swallowed them but not so old that you can't see the arrangement was intentional.
{not hasFlag("read_stone"):
    One stone has markings on its flat face. You look closer. Names. Dozens of names, carved at different depths over what must be generations. The most recent one is shallow, half-finished.
    It could be your name. You're not certain either way.
    # SET_FLAG:read_stone
    # SANITY:-10
}
# SANITY:-2
* [Continue north]
    -> farmhouse_approach
* [Go back south]
    -> dense_thicket
- -> fallen_stones

// ============================================================

=== farmhouse_approach ===
The shack is ten feet in front of you. Up close: wooden walls, roof moss-covered, one window with a candle inside. The door is unlocked — you can see the latch isn't engaged.
{hasFlag("stalker_active"):
    From the treeline behind you, a long crackling sound. Like a knuckle. Repeated seven times.
    # SANITY:-10
}
{getSanity() > 40:
    This is the end of the first chapter. You're close enough to the door that you could knock.
    You don't knock. You open it.
    # PHASE:ending
    -> ending_passage
- else:
    The light doesn't look like candlelight anymore. It's moving too slowly. Something behind the window shifts.
    # PHASE:ending
    -> ending_absorption
}

// ============================================================
// ENDINGS
// ============================================================

=== ending_passage ===
Inside: a table, a chair, a candle almost burned down to nothing. On the table, a key. The same make as the one you may or may not already have.
There's a second door on the far wall. A real door — solid, with hinges and a frame.
You try the handle. It opens onto more dark. But different dark. The kind that has roads in it, and distance, and somewhere else.
You stand in the doorway for a long time.
You don't go through.
You're not sure —
# PHASE:gameover
-> END

=== ending_absorption ===
The thing in the window turns toward you.
It has been waiting in this exact spot for exactly this. You understand, in the way you sometimes understand things just before they stop mattering, that it knew you were coming. That the light was yours to follow.
That you have been here before.
The candle goes out.
# PHASE:gameover
-> END

=== ending_taken ===
// Triggered by entitySystem when sanity hits 0
The forest goes quiet.
Not silent. Quiet. The distinction matters and then it doesn't.
-> END
