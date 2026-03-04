--[[
	TimerDisplay.lua (LocalScript)

	PURPOSE: Shows a live timer on screen while playing
	LOCATION: Place this LocalScript in StarterPlayer > StarterPlayerScripts

	HOW IT WORKS:
	- Creates a timer display in the top-right corner
	- Updates every frame to show elapsed time
	- Resets when player respawns
]]

-- SERVICES --
local Players = game:GetService("Players")
local RunService = game:GetService("RunService")
local ReplicatedStorage = game:GetService("ReplicatedStorage")

-- Get the local player
local player = Players.LocalPlayer

-- CONFIGURATION --
local TIMER_POSITION = UDim2.new(1, -160, 0, 10)  -- Top-right corner
local TIMER_SIZE = UDim2.new(0, 150, 0, 50)
local BACKGROUND_COLOR = Color3.fromRGB(0, 0, 0)
local TEXT_COLOR = Color3.fromRGB(255, 255, 255)

-- VARIABLES --
local startTime = tick()

-- FUNCTIONS --

-- Format time as M:SS.mm
local function formatTime(seconds)
	local minutes = math.floor(seconds / 60)
	local secs = seconds % 60
	return string.format("%d:%05.2f", minutes, secs)
end

-- CREATE THE UI --

-- ScreenGui is a container for all UI elements
local screenGui = Instance.new("ScreenGui")
screenGui.Name = "TimerGui"
screenGui.ResetOnSpawn = false  -- Keep showing after respawn
screenGui.Parent = player:WaitForChild("PlayerGui")

-- Background frame
local timerFrame = Instance.new("Frame")
timerFrame.Name = "TimerFrame"
timerFrame.Position = TIMER_POSITION
timerFrame.Size = TIMER_SIZE
timerFrame.AnchorPoint = Vector2.new(1, 0)  -- Anchor to top-right
timerFrame.BackgroundColor3 = BACKGROUND_COLOR
timerFrame.BackgroundTransparency = 0.5
timerFrame.BorderSizePixel = 0
timerFrame.Parent = screenGui

-- Round the corners
local corner = Instance.new("UICorner")
corner.CornerRadius = UDim.new(0, 8)
corner.Parent = timerFrame

-- Timer text
local timerLabel = Instance.new("TextLabel")
timerLabel.Name = "TimerLabel"
timerLabel.Size = UDim2.new(1, 0, 1, 0)
timerLabel.BackgroundTransparency = 1
timerLabel.TextColor3 = TEXT_COLOR
timerLabel.TextSize = 28
timerLabel.Font = Enum.Font.Code
timerLabel.Text = "0:00.00"
timerLabel.Parent = timerFrame

-- Small "Time" label above
local titleLabel = Instance.new("TextLabel")
titleLabel.Name = "TitleLabel"
titleLabel.Size = UDim2.new(1, 0, 0, 15)
titleLabel.Position = UDim2.new(0, 0, 0, 2)
titleLabel.BackgroundTransparency = 1
titleLabel.TextColor3 = Color3.fromRGB(200, 200, 200)
titleLabel.TextSize = 12
titleLabel.Font = Enum.Font.Gotham
titleLabel.Text = "TIME"
titleLabel.Parent = timerFrame

-- Adjust main timer position
timerLabel.Position = UDim2.new(0, 0, 0, 10)

-- UPDATE LOOP --

-- Update the timer every frame
RunService.RenderStepped:Connect(function()
	local elapsed = tick() - startTime
	timerLabel.Text = formatTime(elapsed)
end)

-- Reset timer when player respawns
player.CharacterAdded:Connect(function()
	startTime = tick()
end)

-- LISTEN FOR WIN EVENT --

-- Wait for the win event to exist
local winEvent = ReplicatedStorage:WaitForChild("PlayerWonEvent", 10)

if winEvent then
	winEvent.OnClientEvent:Connect(function(completionTime, message)
		if completionTime then
			-- We won! Flash the timer green
			timerFrame.BackgroundColor3 = Color3.fromRGB(0, 255, 0)
			task.delay(2, function()
				timerFrame.BackgroundColor3 = BACKGROUND_COLOR
			end)
		end
	end)
end

print("Timer display ready!")
