--[[
	CheckpointHandler.lua

	PURPOSE: Manages checkpoint system for the obby
	LOCATION: Place this script in ServerScriptService

	HOW IT WORKS:
	- When a player touches a checkpoint, their spawn point is updated
	- When they die, they respawn at their last checkpoint
	- Checkpoints must be named "Checkpoint1", "Checkpoint2", etc.

	SETUP:
	1. Create a folder called "Checkpoints" in Workspace
	2. Add Parts named "Checkpoint1", "Checkpoint2", etc.
	3. This script handles everything else!
]]

-- SERVICES --
-- Services are like toolboxes that give us special abilities
local Players = game:GetService("Players")

-- CONFIGURATION --
-- Change these values to customize the checkpoint behavior
local CHECKPOINT_FOLDER_NAME = "Checkpoints"  -- Name of folder containing checkpoints
local CHECKPOINT_COLOR = Color3.fromRGB(0, 255, 0)  -- Green color for checkpoints
local ACTIVATED_COLOR = Color3.fromRGB(255, 255, 0)  -- Yellow when touched

-- STORAGE --
-- This table remembers each player's current checkpoint
local playerCheckpoints = {}

-- FUNCTIONS --

-- Find the checkpoints folder in Workspace
local function getCheckpointsFolder()
	local folder = workspace:FindFirstChild(CHECKPOINT_FOLDER_NAME)

	if not folder then
		-- Create the folder if it doesn't exist
		folder = Instance.new("Folder")
		folder.Name = CHECKPOINT_FOLDER_NAME
		folder.Parent = workspace
		warn("Created Checkpoints folder - add checkpoint parts inside it!")
	end

	return folder
end

-- Set up a single checkpoint part
local function setupCheckpoint(checkpoint)
	-- Make sure it's a part we can touch
	if not checkpoint:IsA("BasePart") then
		return
	end

	-- Make checkpoint look nice
	checkpoint.Anchored = true  -- Don't let it fall
	checkpoint.CanCollide = true  -- Players can stand on it
	checkpoint.Color = CHECKPOINT_COLOR
	checkpoint.Material = Enum.Material.Neon  -- Glowing effect

	-- What happens when something touches this checkpoint
	checkpoint.Touched:Connect(function(hit)
		-- Check if a player touched it (not just a random part)
		local character = hit.Parent
		local player = Players:GetPlayerFromCharacter(character)

		if player then
			-- Extract the checkpoint number from the name (e.g., "Checkpoint5" -> 5)
			local checkpointNumber = tonumber(checkpoint.Name:match("%d+"))
			local currentCheckpoint = playerCheckpoints[player.UserId] or 0

			-- Only update if this is a NEW checkpoint (higher number)
			if checkpointNumber and checkpointNumber > currentCheckpoint then
				playerCheckpoints[player.UserId] = checkpointNumber

				-- Visual feedback - change color briefly
				checkpoint.Color = ACTIVATED_COLOR
				task.delay(0.5, function()
					checkpoint.Color = CHECKPOINT_COLOR
				end)

				-- Let the player know they reached a checkpoint
				print(player.Name .. " reached Checkpoint " .. checkpointNumber)
			end
		end
	end)
end

-- Respawn player at their last checkpoint
local function respawnAtCheckpoint(player)
	-- Wait a moment for the character to load
	task.wait(0.1)

	local character = player.Character
	if not character then return end

	local humanoidRootPart = character:FindFirstChild("HumanoidRootPart")
	if not humanoidRootPart then return end

	-- Find which checkpoint to spawn at
	local checkpointNumber = playerCheckpoints[player.UserId] or 1
	local checkpointsFolder = getCheckpointsFolder()
	local checkpoint = checkpointsFolder:FindFirstChild("Checkpoint" .. checkpointNumber)

	if checkpoint then
		-- Move player above the checkpoint
		humanoidRootPart.CFrame = checkpoint.CFrame + Vector3.new(0, 5, 0)
	end
end

-- MAIN SETUP --

-- Set up existing checkpoints
local checkpointsFolder = getCheckpointsFolder()
for _, checkpoint in pairs(checkpointsFolder:GetChildren()) do
	setupCheckpoint(checkpoint)
end

-- Set up any checkpoints added later
checkpointsFolder.ChildAdded:Connect(setupCheckpoint)

-- Handle new players joining
Players.PlayerAdded:Connect(function(player)
	-- Start at checkpoint 1
	playerCheckpoints[player.UserId] = 0

	-- When player spawns (or respawns after dying)
	player.CharacterAdded:Connect(function(character)
		respawnAtCheckpoint(player)
	end)
end)

-- Clean up when player leaves
Players.PlayerRemoving:Connect(function(player)
	playerCheckpoints[player.UserId] = nil
end)

print("Checkpoint system loaded!")
