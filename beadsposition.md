# Matchbox Checkers — Complete State & Arrow Reference

> **Source of truth**: This document is derived directly from `Checkers_-_Updated_Moves.pdf`, which defines all matchbox states and their legal moves for the 4×4 mini-checkers game.

---

## Coordinate & Display Convention

### Visual Grid vs. Engine Grid

Every image shows the board with **White (open circles) at the top and Black (filled circles) at the bottom**. The engine uses the opposite orientation.

| Visual Row | Engine Row | Occupant at game start |
|------------|------------|------------------------|
| VR0 (top of image) | Engine Row 3 | **Black home row** |
| VR1 | Engine Row 2 | Black's second row |
| VR2 | Engine Row 1 | White's second row |
| VR3 (bottom of image) | Engine Row 0 | **White home row** |

Columns are the same in both systems: **VC0/C0 = left → VC3/C3 = right**.

**Dark (playable) squares only:**

| Visual Row | Playable Columns |
|------------|-----------------|
| VR0 | C1, C3 |
| VR1 | C0, C2 |
| VR2 | C1, C3 |
| VR3 | C0, C2 |

### Piece Symbols

| Symbol in image | Meaning |
|----------------|---------|
| Filled dark circle | **Black piece** (Computer) |
| Open white circle (outline) | **White piece** (Human) |
| Circle with **`+`** inside | **Ghost** — White piece that was just captured; no longer on the active board |

### Arrow Colors = Bead Colors

Each arrow shows one possible move for Black from that state. Color maps to bead:

| Arrow Color | Bead | Hex |
|-------------|------|-----|
| 🔵 Blue | `BEAD_BLUE` | `#3b82f6` |
| 🟡 Yellow | `BEAD_YELLOW` | `#eab308` |
| 🟠 Orange | `BEAD_ORANGE` | `#f97316` |
| 🟢 Green | `BEAD_GREEN` | `#22c55e` |

### Arrow Direction

Arrows point **from** the Black piece's current square **→ to** its destination. Because Black advances toward White's side (visually upward), arrows generally point up in the image.

For **capture moves**, the arrow spans two squares (jumping over a White piece). The white piece at the intermediate square is removed.

### Folder → Chance (Black's move number)

| Folder | Chance | Meaning |
|--------|--------|---------|
| `2/` | 0 | Black's **1st** move |
| `4/` | 1 | Black's **2nd** move |
| `6/` | 2 | Black's **3rd** move |
| `8/` | 3 | Black's **4th** move |

---

## How to read the piece-position tables

Each state uses this table format. Positions are given in **visual coordinates** (VR = visual row, C = column):

```
VR0 (top):    [ C0 | C1 | C2 | C3 ]
VR1:          [ C0 | C1 | C2 | C3 ]
VR2:          [ C0 | C1 | C2 | C3 ]
VR3 (bottom): [ C0 | C1 | C2 | C3 ]
```

Key: `B` = Black, `W` = White, `+` = White ghost (captured), `.` = empty/non-playable

---

## FOLDER `2/` — Chance 0 — Black's 1st Move

Three states. All share the same Black starting positions; White has just made its first move, giving different configurations.

---

### `2/state_1.png`

**Board:**
```
VR0:  [ .  | .  | .  | W  ]   ← White has two pieces on their home row
VR1:  [ W  | .  | .  | .  ]
VR2:  [ .  | .  | .  | .  ]
VR3:  [ B  | .  | B  | .  ]   ← Black has two pieces on its home row
```

> White occupies (VR0,C1) and (VR0,C3). Black occupies (VR3,C0) and (VR3,C2).

**Arrows — Black's moves:**

| # | Color | From (visual) | To (visual) | Type |
|---|-------|---------------|-------------|------|
| 1 | 🔵 Blue | VR3, C0 | VR2, C1 | Simple forward-right |
| 2 | 🟡 Yellow | VR3, C2 | VR2, C1 | Simple forward-left |
| 3 | 🟠 Orange | VR3, C2 | VR2, C3 | Simple forward-right |

**Beads:** Blue, Yellow, Orange (3 beads)

---

### `2/state_2.png`

**Board:**
```
VR0:  [ .  | .  |    |  W ]  
VR1:  [ .  | .  | W  | .  ] 
VR2:  [ .  | .  | .  | .  ]
VR3:  [ B  | .  | B  | .  ]
```

> White at (VR0,C2) and (VR1,C1). Black at (VR3,C0) and (VR3,C2).

**Arrows — Black's moves:**

| # | Color | From (visual) | To (visual) | Type |
|---|-------|---------------|-------------|------|
| 1 | 🔵 Blue | VR3, C0 | VR2, C1 | Simple forward-right |
| 2 | 🟡 Yellow | VR3, C2 | VR2, C1 | Simple forward-left |
| 3 | 🟠 Orange | VR3, C2 | VR2, C3 | Simple forward-right |

**Beads:** Blue, Yellow, Orange (3 beads)

---

### `2/state_3.png`

**Board:**
```
VR0:  [ .  | W  | .  | .  ]   ← White piece at (VR0,C1)
VR1:  [ .  | .  | W  | .  ]   ← White piece at (VR1,C2)
VR2:  [ .  | .  | .  | .  ]
VR3:  [ B  | .  | B  | .  ]
```

> White at (VR0,C1) and (VR1,C2). Black at (VR3,C0) and (VR3,C2).

**Arrows — Black's moves:**

| # | Color | From (visual) | To (visual) | Type |
|---|-------|---------------|-------------|------|
| 1 | 🔵 Blue | VR3, C0 | VR2, C1 | Simple forward-right |
| 2 | 🟡 Yellow | VR3, C2 | VR2, C1 | Simple forward-left |
| 3 | 🟠 Orange | VR3, C2 | VR2, C3 | Simple forward-right |

**Beads:** Blue, Yellow, Orange (3 beads)

> **Note:** All three Chance-0 states show the same arrow pattern from Black (both bottom-row pieces have identical move options). White's different positions don't block Black's opening moves here.

---

## FOLDER `4/` — Chance 1 — Black's 2nd Move

Ten states. Games have diverged — pieces have moved, some may be captured.

---

### `4/state_1.png`

**Board:**
```
VR0:  [ .  | .  | .  | W  ]   ← White at (VR0,C3)
VR1:  [ .  | .  | .  | .  ]
VR2:  [ .  | .  | .  | .  ]
VR3:  [ B  | .  | +  | .  ]   ← Black at (VR3,C0); White ghost at (VR3,C2)
```

> One White piece was captured (ghost at VR3,C2). Remaining White at (VR0,C3). Black at (VR3,C0).

**Arrows — Black's moves:**

| # | Color | From (visual) | To (visual) | Type |
|---|-------|---------------|-------------|------|
| 1 | 🔵 Blue | VR3, C0 | VR2, C1 | Simple forward-right |

**Beads:** Blue (1 bead)

---

### `4/state_2.png`

**Board:**
```
VR0:  [ .  | .  | .  |   ]   ← White at (VR0,C1) and (VR0,C3)
VR1:  [ W  | .  | W  | .  ]
VR2:  [ .  | B  | .  | .  ]   ← Black advanced to (VR2,C1)
VR3:  [ B  | .  | .  | .  ]   ← Black at (VR3,C0)
```

> Two Black pieces: (VR2,C1) and (VR3,C0). Two White pieces: (VR0,C1) and (VR0,C3).

**Arrows — Black's moves:**

| # | Color | From (visual) | To (visual) | Type |
|---|-------|---------------|-------------|------|
| 1 | 🟠 Orange | VR2, C1 | VR0, C3 | **Capture** — jumps over White at (VR1,C2) |

> The orange arrow spans two squares diagonally (VR2→VR1→VR0), capturing the White piece at (VR1,C2). Since a capture is available it is mandatory.

**Beads:** Orange (1 bead — mandatory capture)

---

### `4/state_3.png`

**Board:**
```
VR0:  [ .  | .  | .  | .  ]   ← White at (VR0,C1)
VR1:  [ W  | .  | W  | .  ]   ← White at (VR1,C2)
VR2:  [ .  | B  | .  | .  ]   ← Black at (VR2,C1)
VR3:  [ .  | .  | B  | .  ]   ← Black at (VR3,C2)
```

**Arrows — Black's moves:**

| # | Color | From (visual) | To (visual) | Type |
|---|-------|---------------|-------------|------|
| 1 | 🔵 Blue | VR2, C1 | VR0, C3 | **Capture** — jumps White at (VR1,C2) |
| 2 | 🟠 Orange | VR3, C2 | VR2, C3 | Simple forward-right |

**Beads:** Blue, Orange (2 beads)

---

### `4/state_4.png`

**Board:**
```
VR0:  [ .  | .  | .  | W  ]   ← White at (VR0,C3)
VR1:  [ .  | .  | .  | .  ]
VR2:  [ .  | B  | .  | W  ]   ← Black at (VR2,C1); White at (VR2,C3)
VR3:  [ .  | .  | B  | .  ]   ← Black at (VR3,C2)
```

**Arrows — Black's moves:**

| # | Color | From (visual) | To (visual) | Type |
|---|-------|---------------|-------------|------|
| 1 | 🟢 Green | VR2, C1 | VR1, C0 | Simple forward-left |
| 2 | 🔵 Blue | VR2, C1 | VR1, C2 | Simple forward-right |

**Beads:** Green, Blue (2 beads)

---

### `4/state_5.png`

**Board:**
```
VR0:  [ .  | .  | .  | W  ]   ← White at (VR0,C3)
VR1:  [  . | .  | .  | .  ]   ← White at (VR1,C0) — advanced
VR2:  [ .  | W  | .  | B  ]   ← Black at (VR2,C3)
VR3:  [ B  | .  | .  | .  ]   ← Black at (VR3,C0)
```

**Arrows — Black's moves:**

| # | Color | From (visual) | To (visual) | Type |
|---|-------|---------------|-------------|------|
| 1 | 🔵 Blue | VR3, C0 | VR1, C2 | **Capture** — jumps White at (VR2,C1) |
| 2 | 🟡 Yellow | VR2, C3 | VR1, C2 | Simple forward-left |

**Beads:** Blue, Yellow (2 beads)

---

### `4/state_6.png`

**Board:**
```
VR0:  [ .  | W  | .  | .  ]   ← White at (VR0,C1)
VR1:  [ .  | .  | .  | .  ]   ← White at (VR1,C0) — advanced
VR2:  [ .  | W  | .  | B  ]   ← Black at (VR2,C3)
VR3:  [ B  | .  | .  | .  ]   ← Black at (VR3,C0)
```

**Arrows — Black's moves:**

| # | Color | From (visual) | To (visual) | Type |
|---|-------|---------------|-------------|------|
| 1 | 🔵 Blue | VR3, C0 | VR1, C2 | **Capture** — jumps White at (VR2,C1) |
| 2 | 🟡 Yellow | VR2, C3 | VR1, C2 | Simple forward-left |

**Beads:** Blue, Yellow (2 beads)

---

### `4/state_7.png`


**Board:**
```
VR0:  [ .  | .  | .  | .  ]
VR1:  [ W  | .  | W  | .  ]   ← White at (VR1,C0) and (VR1,C2)
VR2:  [ .  | .  | .  | B  ]   ← Black at (VR2,C3)
VR3:  [ B  | .  | .  | .  ]   ← Black at (VR3,C0)
```

**Arrows — Black's moves:**

| # | Color | From (visual) | To (visual) | Type |
|---|-------|---------------|-------------|------|
| 1 | 🟡 Yellow | VR2, C3 | VR0, C1 | **Capture** — jumps White at (VR1,C2) |
| 2 | 🔵 Blue | VR3, C0 | VR2, C1 | Simple forward-right |

**Beads:** Yellow, Blue (2 beads)

---

### `4/state_8.png`

**Board:**
```
VR0:  [ .  | .  | .  | W  ]   ← White at (VR0,C3)
VR1:  [ .  | .  | .  | .  ]
VR2:  [ .  | .  | .  | .  ]
VR3:  [ +  | .  | B  | .  ]   ← White ghost at (VR3,C0); Black at (VR3,C2)
```

**Arrows — Black's moves:**

| # | Color | From (visual) | To (visual) | Type |
|---|-------|---------------|-------------|------|
| 1 | 🟡 Yellow | VR3, C2 | VR2, C1 | Simple forward-left |
| 2 | 🟠 Orange | VR3, C2 | VR2, C3 | Simple forward-right |

**Beads:** Yellow, Orange (2 beads)

---

### `4/state_9.png`

VR0 (top):    [ C0 | C1 | C2 | C3 ]
VR1:          [ C0 | C1 | C2 | C3 ]
VR2:          [ C0 | C1 | C2 | C3 ]
VR3 (bottom): [ C0 | C1 | C2 | C3 ]

**Board:**
```
VR0:  [ .  | .  | .  | W  ] 
VR1:  [ .  | .  | .  | .  ]
VR2:  [ .  | B  | .  | W  ]
VR3:  [ B  | .  | .  | .  ] 
```

**Arrows — Black's moves:**

| # | Color | From (visual) | To (visual) | Type |
|---|-------|---------------|-------------|------|
| 1 | 🟡 Yellow | VR2, C1 | VR1, C0 | Simple forward-left |
| 2 | 🟠 Orange | VR2, C1 | VR1, C2 | Simple forward-right |


**Beads:** Yellow, Orange (2 beads)

---

### `4/state_10.png`

**Board:**
```
VR0:  [ .  | W  | .  | .  ]   
VR1:  [ .  | .  | .  | .  ]
VR2:  [ .  | B  | .  | W  ] 
VR3:  [ B  | .  | .  | .  ] 
```

**Arrows — Black's moves:**

| # | Color | From (visual) | To (visual) | Type |
|---|-------|---------------|-------------|------|
| 1 | 🟡 Yellow | VR2, C1 | VR1, C0 | Simple forward-left |
| 2 | 🟠 Orange | VR2, C1 | VR1, C2 | Simple forward-right |


**Beads:** Yellow, Orange (2 beads)

---

## FOLDER `6/` — Chance 2 — Black's 3rd Move

Twelve states. Late midgame — fewer pieces, often a single Black piece remaining.

---

### `6/state_1.png`

**Board:**
```
VR0:  [ .  | .  | .  | .  ]
VR1:  [ .  | .  | .  | .  ]
VR2:  [ .  | W  | .  | B  ]   ← White at (VR2,C1); Black at (VR2,C3)
VR3:  [ .  | .  | .  | .  ]
```

**Arrows — Black's moves:**

| # | Color | From (visual) | To (visual) | Type |
|---|-------|---------------|-------------|------|
| 1 | 🟡 Yellow | VR2, C3 | VR1, C2 | Simple forward-left |

**Beads:** Yellow (1 bead)

---

### `6/state_2.png`

**Board:**
```
VR0:  [ .  | .  | .  | .  ]
VR1:  [ .  | .  | .  | .  ]
VR2:  [ .  | W  | .  | W  ]   ← White at (VR2,C1) and (VR2,C3)
VR3:  [ B  | .  | .  | .  ]   ← Black at (VR3,C0)
```

**Arrows — Black's moves:**

| # | Color | From (visual) | To (visual) | Type |
|---|-------|---------------|-------------|------|
| 1 | 🔵 Blue | VR3, C0 | VR1, C2 | **Capture** — jumps White at (VR2,C1) |

**Beads:** Blue (1 bead — mandatory capture)

---

### `6/state_3.png`

**Board:**
```
VR0:  [ .  | .  | .  | W  ]   ← White at (VR0,C3)
VR1:  [ .  | .  | B  | .  ]   ← Black at (VR1,C2)
VR2:  [ .  | .  | .  | .  ]
VR3:  [ B  | .  | +  | .  ]   ← Black at (VR3,C0); White ghost at (VR3,C2)
```

**Arrows — Black's moves:**

| # | Color | From (visual) | To (visual) | Type |
|---|-------|---------------|-------------|------|
| 1 | 🟡 Yellow | VR1, C2 | VR0, C1 | Simple forward-left |
| 2 | 🔵 Blue | VR3, C0 | VR2, C1 | Simple forward-right |

**Beads:** Yellow, Blue (2 beads)

---

### `6/state_4.png`

**Board:**
```
VR0:  [ .  | .  | .  | .  ]
VR1:  [ .  | .  | W  | .  ]   ← White at (VR1,C2)
VR2:  [ .  | .  | .  | B  ]   ← Black at (VR2,C3)
VR3:  [ .  | .  | +  | .  ]   ← White ghost at (VR3,C2)
```

**Arrows — Black's moves:**

| # | Color | From (visual) | To (visual) | Type |
|---|-------|---------------|-------------|------|
| 1 | 🟡 Yellow | VR2, C3 | VR0, C1 | **Capture** — jumps White at (VR1,C2) |

> The arrow is long (spans 2 rows), confirming a capture jump.

**Beads:** Yellow (1 bead — mandatory capture)

---

### `6/state_5.png`

**Board:**
```
VR0:  [ .  | .  | .  | .  ]
VR1:  [ B  | .  | W  | .  ]   ← Black at (VR1,C0); White at (VR1,C2)
VR2:  [ .  | .  | .  | W  ]   ← White at (VR2,C3)
VR3:  [ .  | .  | B  | .  ]   ← Black at (VR3,C2)
```

**Arrows — Black's moves:**

| # | Color | From (visual) | To (visual) | Type |
|---|-------|---------------|-------------|------|
| 1 | 🔵 Blue | VR1, C0 | VR0, C1 | Simple forward-right |
| 2 | 🟡 Yellow | VR3, C2 | VR2, C1 | Simple forward-left |

**Beads:** Blue, Yellow (2 beads)

---

### `6/state_6.png`

**Board:**
```
VR0:  [ .  | .  | .  | W  ]   ← White at (VR0,C3)
VR1:  [ B  | .  | .  | .  ]   ← Black at (VR1,C0)
VR2:  [ .  | .  | .  | .  ]
VR3:  [ B  | .  | +  | .  ]   ← Black at (VR3,C0); White ghost at (VR3,C2)
```

**Arrows — Black's moves:**

| # | Color | From (visual) | To (visual) | Type |
|---|-------|---------------|-------------|------|
| 1 | 🟠 Orange | VR1, C0 | VR0, C1 | Simple forward-right |
| 2 | 🔵 Blue | VR3, C0 | VR2, C1 | Simple forward-right |

**Beads:** Orange, Blue (2 beads)

---

### `6/state_7.png`

**Board:**
```
VR0:  [ .  | .  | .  | .  ]
VR1:  [ B  | .  | W  | .  ]   ← Black at (VR1,C0); White at (VR1,C2)
VR2:  [ .  | .  | .  | W  ]   ← White at (VR2,C3)
VR3:  [ B  | .  | .  | .  ]   ← Black at (VR3,C0)
```

**Arrows — Black's moves:**

| # | Color | From (visual) | To (visual) | Type |
|---|-------|---------------|-------------|------|
| 1 | 🟠 Orange | VR1, C0 | VR0, C1 | Simple forward-right |
| 2 | 🔵 Blue | VR3, C0 | VR2, C1 | Simple forward-right |

**Beads:** Orange, Blue (2 beads)

---

### `6/state_8.png`

**Board:**
```
VR0:  [ .  | .  | .  | .  ]
VR1:  [ .  | .  | .  | .  ]   
VR2:  [ .  | W  | .  | W  ]
VR3:  [ .  | .  | B  | .  ] 
```

**Arrows — Black's moves:**

| # | Color | From (visual) | To (visual) | Type |
|---|-------|---------------|-------------|------|
| 1 | 🟡 Yellow | VR3, C2 | VR1, C0 | **Capture** — jumps White at (VR2,C1) |

> The arrow spans two rows, confirming a capture. The destination (VR1,C0) is the landing square after jumping (VR2,C1).

**Beads:** Yellow (1 bead — mandatory capture)

---

### `6/state_9.png`

**Board:**
```
VR0:  [ .  | .  | .  | .  ]   ← White at (VR0,C1)
VR1:  [ W  | .  | B  | .  ]   ← Black at (VR1,C2)
VR2:  [ .  | .  | .  | W  ]   ← White at (VR2,C3)
VR3:  [ B  | .  | .  | .  ]   ← Black at (VR3,C0)
```

**Arrows — Black's moves:**

| # | Color | From (visual) | To (visual) | Type |
|---|-------|---------------|-------------|------|
| 1 | 🟡 Yellow | VR1, C2 | VR0, C1 | Simple forward-left |
| 2 | 🟠 Orange | VR1, C2 | VR0, C3 | Simple forward-right |
| 3 | 🔵 Blue | VR3, C0 | VR2, C1 | Simple forward-right |

**Beads:** Yellow, Orange, Blue (3 beads)

---

### `6/state_10.png`

**Board:**
```
VR0:  [ .  | W  | .  | .  ]   ← White at (VR0,C1)
VR1:  [ .  | .  | B  | .  ]   ← Black at (VR1,C2)
VR2:  [ .  | .  | .  | .  ]
VR3:  [ B  | .  | +  | .  ]   ← Black at (VR3,C0); White ghost at (VR3,C2)
```

**Arrows — Black's moves:**

| # | Color | From (visual) | To (visual) | Type |
|---|-------|---------------|-------------|------|
| 1 | 🟠 Orange | VR1, C2 | VR0, C3 | Simple forward-right |
| 2 | 🔵 Blue | VR3, C0 | VR2, C1 | Simple forward-right |

**Beads:** Orange, Blue (2 beads)

---

### `6/state_11.png`

**Board:**
```
VR0:  [ .  | W  | .  | .  ]   ← White at (VR0,C1)
VR1:  [ B  | .  | .  | .  ]   ← Black at (VR1,C0)
VR2:  [ .  | .  | .  | .  ]
VR3:  [ B  | .  | +  | .  ]   ← Black at (VR3,C0); White ghost at (VR3,C2)
```

**Arrows — Black's moves:**

| # | Color | From (visual) | To (visual) | Type |
|---|-------|---------------|-------------|------|
| 1 | 🔵 Blue | VR3, C0 | VR2, C1 | Simple forward-right |

**Beads:** Blue (1 bead)

---

### `6/state_12.png`

**Board:**
```
VR0:  [ .  | .  | .  | .  ]
VR1:  [ W  | .  | .  | .  ]   ← White at (VR1,C0)
VR2:  [ .  | .  | .  | B  ]   ← Black at (VR2,C3)
VR3:  [ +  | .  | .  | .  ]   ← White ghost at (VR3,C0)
```

**Arrows — Black's moves:**

| # | Color | From (visual) | To (visual) | Type |
|---|-------|---------------|-------------|------|
| 1 | 🟡 Yellow | VR2, C3 | VR1, C2 | Simple forward-left |

**Beads:** Yellow (1 bead)

---

## FOLDER `8/` — Chance 3 — Black's 4th Move

Seven states. Deep endgame — often a single Black piece close to or already in winning range.

---

### `8/state_1.png`

**Board:**
```
VR0:  [ .  | .  | .  | .  ]
VR1:  [ .  | .  | B  | .  ]   
VR2:  [ .  | .  | .  | .  ]
VR3:  [ .  | .  | +  | .  ]
```

**Arrows — Black's moves:**

| # | Color | From (visual) | To (visual) | Type |
|---|-------|---------------|-------------|------|
| 1 | 🟡 Yellow | VR1, C2 | VR0, C1 | Simple forward-left |
| 2 | 🟠 Orange | VR1, C2 | VR0, C3 | Simple forward-right |

> Both moves advance Black to White's home row (engine Row 3 = VR0) — **winning moves**.

**Beads:** Yellow, Orange (2 beads)

---

### `8/state_2.png`

**Board:**
```
VR0:  [ .  | .  | .  | .  ]
VR1:  [ .  | .  | B  | .  ]  
VR2:  [ .  | .  | .  | .  ]
VR3:  [ +  | .  | .  | .  ] 
```

**Arrows — Black's moves:**

| # | Color | From (visual) | To (visual) | Type |
|---|-------|---------------|-------------|------|
| 1 | 🟡 Yellow | VR1, C2 | VR0, C1 | Simple forward-left (**winning**) |
| 2 | 🟠 Orange | VR1, C2 | VR0, C3 | Simple forward-right (**winning**) |

**Beads:** Yellow, Orange (2 beads)

---

### `8/state_3.png`

**Board:**

```
VR0:  [ .  | .  | .  | .  ]
VR1:  [ B  | .  | W  | .  ]   ← Black at (VR1,C0); White at (VR1,C2)
VR2:  [ .  | B  | .  | .  ]   ← Black at (VR2,C1)
VR3:  [ .  | .  | +  | .  ]   ← White ghost at (VR3,C2)
```

**Arrows — Black's moves:**

| # | Color | From (visual) | To (visual) | Type |
|---|-------|---------------|-------------|------|
| 1 | 🔵 Blue | VR1, C0 | VR0, C1 | Simple forward-right (**winning** — reaches Row3) |
| 2 | 🟠 Orange | VR2, C1 | VR0, C3 | **Capture** — jumps White at (VR1,C2); lands on White's home row (**winning**) |

**Beads:** Blue, Orange (2 beads)

---

### `8/state_4.png`

**Board:**
```
VR0:  [ .  | .  | .  | .  ]
VR1:  [ B  | .  | .  | .  ]   ← Black at (VR1,C0)
VR2:  [ .  | .  | .  | W  ]   ← White at (VR2,C3)
VR3:  [ +  | .  | .  | .  ]   ← White ghost at (VR3,C0)
```

**Arrows — Black's moves:**

| # | Color | From (visual) | To (visual) | Type |
|---|-------|---------------|-------------|------|
| 1 | 🔵 Blue | VR1, C0 | VR0, C1 | Simple forward-right (**winning**) |

**Beads:** Blue (1 bead — forced winning move)

---

### `8/state_5.png`

**Board:**
```
VR0:  [ .  | .  | .  | .  ]   
VR1:  [ W  | .  | B  | .  ]  
VR2:  [ .  | B  | .  | .  ]  
VR3:  [ .  | .  | +  | .  ]
```

**Arrows — Black's moves:**

| # | Color | From (visual) | To (visual) | Type |
|---|-------|---------------|-------------|------|
| 1 | 🟡 Yellow | VR1, C2 | VR0, C1 | Simple forward-left (**winning**) |
| 2 | 🟠 Orange | VR1, C2 | VR0, C3 | Simple forward-right (**winning**) |

**Beads:** Yellow, Orange (2 beads)

---

### `8/state_6.png`

**Board:**
```
VR0:  [ .  | .  | .  | .  ]
VR1:  [ .  | .  | B  | .  ]   
VR2:  [ .  | .  | .  | W  ]  
VR3:  [ .  | .  | +  | .  ]
```

**Arrows — Black's moves:**

| # | Color | From (visual) | To (visual) | Type |
|---|-------|---------------|-------------|------|
| 1 | 🟡 Yellow | VR1, C2 | VR0, C1 | Simple forward-left (**winning**) |
| 2 | 🟠 Orange | VR1, C2 | VR0, C3 | Simple forward-right (**winning**) |

**Beads:** Yellow, Orange (2 beads)

---

### `8/state_7.png`

**Board:**
```
VR0:  [ .  | .  | .  | .  ]
VR1:  [ B  | .  | .  | .  ]
VR2:  [ .  | .  | .  | .  ]
VR3:  [ .  | .  | +  | .  ] 
```

**Arrows — Black's moves:**

| # | Color | From (visual) | To (visual) | Type |
|---|-------|---------------|-------------|------|
| 1 | 🔵 Blue | VR1, C0 | VR0, C1 | Simple forward-right (**winning**) |

**Beads:** Blue (1 bead — forced winning move)

---


## Bead Definitions for `bead-definitions.ts`

```typescript
// Bead color constants
const BEAD_BLUE   = "#3b82f6";
const BEAD_YELLOW = "#eab308";
const BEAD_ORANGE = "#f97316";
const BEAD_GREEN  = "#22c55e";

export const IMAGE_BEAD_DISPLAY: Record<string, string[]> = {
  // Chance 0 — folder "2/"
  "0-0": [BEAD_BLUE, BEAD_YELLOW, BEAD_ORANGE],   // 2/state_1
  "0-1": [BEAD_BLUE, BEAD_YELLOW, BEAD_ORANGE],   // 2/state_2
  "0-2": [BEAD_BLUE, BEAD_YELLOW, BEAD_ORANGE],   // 2/state_3

  // Chance 1 — folder "4/"
  "1-0": [BEAD_BLUE],                              // 4/state_1
  "1-1": [BEAD_ORANGE],                            // 4/state_2
  "1-2": [BEAD_BLUE, BEAD_ORANGE],                 // 4/state_3
  "1-3": [BEAD_GREEN, BEAD_BLUE],                  // 4/state_4
  "1-4": [BEAD_BLUE, BEAD_YELLOW],                 // 4/state_5
  "1-5": [BEAD_BLUE, BEAD_YELLOW],                 // 4/state_6
  "1-6": [BEAD_YELLOW, BEAD_BLUE],                 // 4/state_7
  "1-7": [BEAD_YELLOW, BEAD_ORANGE],               // 4/state_8
  "1-8": [BEAD_YELLOW, BEAD_ORANGE],               // 4/state_9
  "1-9": [BEAD_YELLOW, BEAD_ORANGE],               // 4/state_10

  // Chance 2 — folder "6/"
  "2-0":  [BEAD_YELLOW],                           // 6/state_1
  "2-1":  [BEAD_BLUE],                             // 6/state_2
  "2-2":  [BEAD_YELLOW, BEAD_BLUE],                // 6/state_3
  "2-3":  [BEAD_YELLOW],                           // 6/state_4
  "2-4":  [BEAD_BLUE, BEAD_YELLOW],                // 6/state_5
  "2-5":  [BEAD_ORANGE, BEAD_BLUE],                // 6/state_6
  "2-6":  [BEAD_ORANGE, BEAD_BLUE],                // 6/state_7
  "2-7":  [BEAD_YELLOW],                           // 6/state_8
  "2-8":  [BEAD_YELLOW, BEAD_ORANGE, BEAD_BLUE],   // 6/state_9
  "2-9":  [BEAD_ORANGE, BEAD_BLUE],                // 6/state_10
  "2-10": [BEAD_BLUE],                             // 6/state_11
  "2-11": [BEAD_YELLOW],                           // 6/state_12

  // Chance 3 — folder "8/"
  "3-0": [BEAD_YELLOW, BEAD_ORANGE],               // 8/state_1
  "3-1": [BEAD_YELLOW, BEAD_ORANGE],               // 8/state_2
  "3-2": [BEAD_BLUE, BEAD_ORANGE],                 // 8/state_3
  "3-3": [BEAD_BLUE],                              // 8/state_4
  "3-4": [BEAD_YELLOW, BEAD_ORANGE],               // 8/state_5
  "3-5": [BEAD_YELLOW, BEAD_ORANGE],               // 8/state_6
  "3-6": [BEAD_BLUE],                              // 8/state_7
};
```

---
