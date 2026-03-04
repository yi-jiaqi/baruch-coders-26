--[[
	KillBrickHandler.lua

	PURPOSE: Makes dangerous parts (lava, spikes, etc.) kill players on touch
	LOCATION: Place this script in ServerScriptService

	HOW IT WORKS:
	- Any part with "Kill" in its name becomes deadly
	- When a player touches it, they die and respawn
	- Also handles falling off the map (below Y = -50)

	SETUP:
	1. Create Parts and name them with "Kill" (e.g., "KillBrick", "LavaKill", "KillZone")
	2. Color them red/orange so players know they're dangerous
	3. This script handles everything else!
]]

-- SERVICES --
local Players = game:GetService("Players")
local RunService = game:GetService("RunService")

-- CONFIGURATION --
local KILL_PART_KEYWORD = "Kill"  -- Parts with this word in their name are deadly
local FALL_DEATH_HEIGHT = -50    -- Y position where players die from falling
local KILL_COOLDOWN = 0.5        -- Seconds between kills (prevents multiple deaths)

-- STORAGE --
local recentlyKilled = {}  -- Prevents killing the same player multiple times rapidly

-- FUNCTIONS --

-- Check if a part should kill players
local function isKillPart(part)
	return part.Name:find(KILL_PART_KEYWORD) ~= nil
end

-- Kill a player's character
local function killPlayer(character)
	local humanoid = character:FindFirstChild("Humanoid")
	if humanoid and humanoid.Health > 0 then
		humanoid.Health = 0
	end
end

-- Set up a kill brick
local function setupKillBrick(part)
	-- Only set up BaseParts (not folders, scripts, etc.)
	if not part:IsA("BasePart") then
		return
	end

	-- Check if this part should be a kill brick
	if not isKillPart(part) then
		return
	end

	-- Make it look dangerous
	part.Anchored = true
	part.CanCollide = true

	-- Connect the touch event
	part.Touched:Connect(function(hit)
		local character = hit.Parent
		local humanoid = character:FindFirstChild("Humanoid")

		if humanoid then
			local player = Players:GetPlayerFromCharacter(character)
			if player then
				-- Check cooldown to prevent multiple rapid deaths
				if recentlyKilled[player.UserId] then
					return
				end

				-- Mark as recently killed
				recentlyKilled[player.UserId] = true
				task.delay(KILL_COOLDOWN, function()
					recentlyKilled[player.UserId] = nil
				end)

				-- Kill the player
				killPlayer(character)
			end
		end
	end)

	print("Kill brick set up: " .. part.Name)
end

-- Scan for kill bricks in a container
local function scanForKillBricks(container)
	for _, descendant in pairs(container:GetDescendants()) do
		setupKillBrick(descendant)
	end
end

-- Check if player fell off the map
local function checkFallDeath()
	for _, player in pairs(Players:GetPlayers()) do
		local character = player.Character
		if character then
			local humanoidRootPart = character:FindFirstChild("HumanoidRootPart")
			if humanoidRootPart then
				if humanoidRootPart.Position.Y < FALL_DEATH_HEIGHT then
					-- Check cooldown
					if not recentlyKilled[player.UserId] then
						recentlyKilled[player.UserId] = true
						task.delay(KILL_COOLDOWN, function()
							recentlyKilled[player.UserId] = nil
						end)
						killPlayer(character)
					end
				end
			end
		end
	end
end

-- MAIN SETUP --

-- Set up existing kill bricks in workspace
scanForKillBricks(workspace)

-- Set up any parts added later
workspace.DescendantAdded:Connect(function(descendant)
	-- Small delay to let properties be set
	task.wait(0.1)
	setupKillBrick(descendant)
end)

-- Check for fall deaths every frame
RunService.Heartbeat:Connect(checkFallDeath)

-- Clean up when player leaves
Players.PlayerRemoving:Connect(function(player)
	recentlyKilled[player.UserId] = nil
end)

print("Kill brick system loaded!")
