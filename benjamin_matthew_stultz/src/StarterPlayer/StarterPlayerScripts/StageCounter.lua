--[[
	StageCounter.lua (LocalScript)

	PURPOSE: Shows current stage/checkpoint on screen
	LOCATION: Place this LocalScript in StarterPlayer > StarterPlayerScripts

	HOW IT WORKS:
	- Displays which checkpoint the player has reached
	- Updates when touching new checkpoints
	- Shows in top-left corner of screen
]]

-- SERVICES --
local Players = game:GetService("Players")

-- Get the local player
local player = Players.LocalPlayer

-- CONFIGURATION --
local COUNTER_POSITION = UDim2.new(0, 10, 0, 10)  -- Top-left corner
local COUNTER_SIZE = UDim2.new(0, 150, 0, 50)
local BACKGROUND_COLOR = Color3.fromRGB(0, 0, 0)
local TEXT_COLOR = Color3.fromRGB(255, 255, 255)
local CHECKPOINT_FOLDER_NAME = "Checkpoints"

-- VARIABLES --
local currentStage = 1
local totalStages = 0

-- FUNCTIONS --

-- Count total checkpoints
local function countCheckpoints()
	local folder = workspace:FindFirstChild(CHECKPOINT_FOLDER_NAME)
	if folder then
		local count = 0
		for _, child in pairs(folder:GetChildren()) do
			if child:IsA("BasePart") and child.Name:match("Checkpoint%d+") then
				count = count + 1
			end
		end
		return count
	end
	return 0
end

-- CREATE THE UI --

local screenGui = Instance.new("ScreenGui")
screenGui.Name = "StageGui"
screenGui.ResetOnSpawn = false
screenGui.Parent = player:WaitForChild("PlayerGui")

-- Background frame
local stageFrame = Instance.new("Frame")
stageFrame.Name = "StageFrame"
stageFrame.Position = COUNTER_POSITION
stageFrame.Size = COUNTER_SIZE
stageFrame.BackgroundColor3 = BACKGROUND_COLOR
stageFrame.BackgroundTransparency = 0.5
stageFrame.BorderSizePixel = 0
stageFrame.Parent = screenGui

-- Round corners
local corner = Instance.new("UICorner")
corner.CornerRadius = UDim.new(0, 8)
corner.Parent = stageFrame

-- Stage text
local stageLabel = Instance.new("TextLabel")
stageLabel.Name = "StageLabel"
stageLabel.Size = UDim2.new(1, 0, 1, 0)
stageLabel.Position = UDim2.new(0, 0, 0, 10)
stageLabel.BackgroundTransparency = 1
stageLabel.TextColor3 = TEXT_COLOR
stageLabel.TextSize = 28
stageLabel.Font = Enum.Font.GothamBold
stageLabel.Text = "1 / ?"
stageLabel.Parent = stageFrame

-- Title label
local titleLabel = Instance.new("TextLabel")
titleLabel.Name = "TitleLabel"
titleLabel.Size = UDim2.new(1, 0, 0, 15)
titleLabel.Position = UDim2.new(0, 0, 0, 2)
titleLabel.BackgroundTransparency = 1
titleLabel.TextColor3 = Color3.fromRGB(200, 200, 200)
titleLabel.TextSize = 12
titleLabel.Font = Enum.Font.Gotham
titleLabel.Text = "STAGE"
titleLabel.Parent = stageFrame

-- UPDATE FUNCTIONS --

local function updateDisplay()
	stageLabel.Text = currentStage .. " / " .. totalStages
end

-- Monitor checkpoints for touches
local function setupCheckpointMonitoring()
	local folder = workspace:FindFirstChild(CHECKPOINT_FOLDER_NAME)
	if not folder then
		-- Wait for it to be created
		workspace.ChildAdded:Connect(function(child)
			if child.Name == CHECKPOINT_FOLDER_NAME then
				setupCheckpointMonitoring()
			end
		end)
		return
	end

	totalStages = countCheckpoints()
	updateDisplay()

	-- Monitor each checkpoint
	for _, checkpoint in pairs(folder:GetChildren()) do
		if checkpoint:IsA("BasePart") then
			checkpoint.Touched:Connect(function(hit)
				-- Check if it's our character
				local character = player.Character
				if character and hit:IsDescendantOf(character) then
					local stageNumber = tonumber(checkpoint.Name:match("%d+"))
					if stageNumber and stageNumber > currentStage then
						currentStage = stageNumber
						updateDisplay()

						-- Visual feedback
						stageFrame.BackgroundColor3 = Color3.fromRGB(0, 255, 0)
						task.delay(0.3, function()
							stageFrame.BackgroundColor3 = BACKGROUND_COLOR
						end)
					end
				end
			end)
		end
	end

	-- Update count when new checkpoints are added
	folder.ChildAdded:Connect(function()
		totalStages = countCheckpoints()
		updateDisplay()
	end)
end

-- MAIN --

-- Reset stage on respawn
player.CharacterAdded:Connect(function()
	-- Don't reset - player keeps their checkpoint progress
	-- If you want to reset: currentStage = 1
	updateDisplay()
end)

-- Start monitoring
setupCheckpointMonitoring()

-- Also try again after a short delay (in case checkpoints load slowly)
task.delay(2, function()
	totalStages = countCheckpoints()
	updateDisplay()
end)

print("Stage counter ready!")
