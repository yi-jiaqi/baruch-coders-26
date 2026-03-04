# Roblox Studio Setup Guide for Beginners

## Step 1: Install Roblox Studio

1. Go to https://create.roblox.com
2. Click "Start Creating"
3. Download and install Roblox Studio
4. Sign in with your Roblox account (create one if needed)

## Step 2: Create a New Game

1. Open Roblox Studio
2. Click "New" in the top left
3. Select "Baseplate" template (empty world with a floor)
4. Click "Create"

## Step 3: Understanding the Interface

### Main Panels
- **Explorer** (right side): Shows all objects in your game
- **Properties** (right side): Edit selected object settings
- **Toolbox** (left side): Pre-made models and assets
- **Output** (bottom): Shows errors and print messages

### Important Folders in Explorer
```
Workspace          -- All visible objects (parts, models)
ServerScriptService -- Scripts that run on the server
StarterGui         -- UI elements given to players
StarterPlayer      -- Player scripts and settings
ReplicatedStorage  -- Shared resources (accessible by all scripts)
```

## Step 4: Adding Scripts to Your Game

### For Server Scripts (CheckpointHandler, KillBrick):
1. Right-click "ServerScriptService" in Explorer
2. Click "Insert Object" > "Script"
3. Rename it (right-click > Rename)
4. Double-click to open and paste the code

### For Local Scripts (Timer, StageCounter):
1. Right-click "StarterPlayer" > "StarterPlayerScripts"
2. Click "Insert Object" > "LocalScript"
3. Rename and paste code

### For UI Scripts:
1. Right-click "StarterGui"
2. Insert Object > "ScreenGui"
3. Add UI elements inside (TextLabel, Frame, etc.)

## Step 5: Building Your Obby

### Creating a Platform
1. Click "Part" in the Home tab (or press Ctrl+1)
2. A gray block appears - this is your platform
3. Use Move tool (Ctrl+2) to position it
4. Use Scale tool (Ctrl+3) to resize it
5. Use Rotate tool (Ctrl+4) to rotate it

### Changing Colors
1. Select the part
2. In Properties panel, find "BrickColor" or "Color"
3. Click to choose a new color

### Creating a Checkpoint
1. Create a Part
2. Color it green
3. Rename it "Checkpoint1" (or Checkpoint2, etc.)
4. Add to a folder called "Checkpoints" in Workspace

### Creating a Kill Brick
1. Create a Part
2. Color it red
3. Rename it to include "Kill" (e.g., "KillBrick1")
4. The script will detect parts with "Kill" in the name

## Step 6: Testing Your Game

1. Click "Play" button (or press F5)
2. Test your obstacles
3. Press "Stop" (or Shift+F5) to exit play mode
4. Make adjustments as needed

## Step 7: Publishing Your Game

1. File > Publish to Roblox
2. Enter a name and description
3. Choose settings (public/private)
4. Click "Create"

## Tips for Beginners

- **Save often!** File > Save to Roblox (or Ctrl+S for local)
- **Use anchoring**: Select part > Properties > check "Anchored" (prevents falling)
- **Group objects**: Select multiple parts > Ctrl+G to group
- **Undo mistakes**: Ctrl+Z
- **Duplicate parts**: Ctrl+D (great for making similar platforms)

## Troubleshooting

### Script not working?
1. Check Output panel for red error messages
2. Make sure script is in the correct location
3. Verify part names match what the script expects

### Parts falling through floor?
- Make sure "Anchored" is checked in Properties

### Can't see changes?
- Stop and restart Play mode to see script changes
