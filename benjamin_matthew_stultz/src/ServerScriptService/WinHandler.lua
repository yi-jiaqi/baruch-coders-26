--[[
	WinHandler.lua

	PURPOSE: Handles what happens when a player finishes the obby
	LOCATION: Place this script in ServerScriptService

	HOW IT WORKS:
	- When a player touches the "FinishLine" part, they win!
	- Shows a celebration message
	- Records their completion time
	- Optionally teleports them back to start

	SETUP:
	1. Create a Part at the end of your obby
	2. Name it "FinishLine"
	3. Make it big and obvious (maybe a trophy or arch)
]]

-- SERVICES --
local Players = game:GetService("Players")
local ReplicatedStorage = game:GetService("ReplicatedStorage")

-- CONFIGURATION --
local FINISH_LINE_NAME = "FinishLine"
local TELEPORT_TO_START = true  -- Set to false to keep player at finish
local WIN_COOLDOWN = 3  -- Seconds before they can win again

-- Create a RemoteEvent for client notifications
local winEvent = Instance.new("RemoteEvent")
winEvent.Name = "PlayerWonEvent"
winEvent.Parent = ReplicatedStorage

-- STORAGE --
local playerStartTimes = {}  -- When each player started
local recentWinners = {}  -- Prevent multiple wins

-- FUNCTIONS --

-- Called when a player first spawns (to start their timer)
local function startPlayerTimer(player)
	playerStartTimes[player.UserId] = tick()
end

-- Calculate time taken to complete
local function getCompletionTime(player)
	local startTime = playerStartTimes[player.UserId]
	if startTime then
		return tick() - startTime
	end
	return 0
end

-- Format time nicely (e.g., "1:23.45")
local function formatTime(seconds)
	local minutes = math.floor(seconds / 60)
	local secs = seconds % 60
	return string.format("%d:%05.2f", minutes, secs)
end

-- Handle player winning
local function playerWon(player)
	-- Check cooldown
	if recentWinners[player.UserId] then
		return
	end

	-- Set cooldown
	recentWinners[player.UserId] = true
	task.delay(WIN_COOLDOWN, function()
		recentWinners[player.UserId] = nil
	end)

	-- Calculate completion time
	local completionTime = getCompletionTime(player)
	local timeString = formatTime(completionTime)

	-- Announce the win to everyone
	local message = player.Name .. " completed the obby in " .. timeString .. "!"
	print(message)

	-- Notify the winning player (client will show UI)
	winEvent:FireClient(player, completionTime, timeString)

	-- Notify all other players
	for _, otherPlayer in pairs(Players:GetPlayers()) do
		if otherPlayer ~= player then
			winEvent:FireClient(otherPlayer, nil, message)
		end
	end

	-- Optionally teleport back to start
	if TELEPORT_TO_START then
		task.wait(3)  -- Let them celebrate first

		-- Reset their checkpoint progress
		local character = player.Character
		if character then
			local humanoid = character:FindFirstChild("Humanoid")
			if humanoid then
				-- This will trigger respawn at Checkpoint 1
				humanoid.Health = 0
			end
		end

		-- Reset their timer for next run
		playerStartTimes[player.UserId] = tick()
	end
end

-- Set up the finish line
local function setupFinishLine()
	local finishLine = workspace:FindFirstChild(FINISH_LINE_NAME, true)

	if not finishLine then
		warn("No FinishLine found! Create a Part named 'FinishLine' at the end of your obby.")
		return
	end

	-- Make it look special
	finishLine.Anchored = true
	finishLine.CanCollide = false  -- Walk through it (like a finish tape)
	finishLine.Transparency = 0.5
	finishLine.Color = Color3.fromRGB(255, 215, 0)  -- Gold color
	finishLine.Material = Enum.Material.Neon

	-- Connect touch event
	finishLine.Touched:Connect(function(hit)
		local character = hit.Parent
		local player = Players:GetPlayerFromCharacter(character)

		if player then
			playerWon(player)
		end
	end)

	print("Finish line ready at: " .. finishLine:GetFullName())
end

-- MAIN SETUP --

-- Set up finish line
setupFinishLine()

-- Also check if finish line is added later
workspace.DescendantAdded:Connect(function(descendant)
	if descendant.Name == FINISH_LINE_NAME then
		task.wait(0.1)
		setupFinishLine()
	end
end)

-- Handle new players
Players.PlayerAdded:Connect(function(player)
	player.CharacterAdded:Connect(function()
		startPlayerTimer(player)
	end)
end)

-- Clean up when player leaves
Players.PlayerRemoving:Connect(function(player)
	playerStartTimes[player.UserId] = nil
	recentWinners[player.UserId] = nil
end)

print("Win handler loaded!")
