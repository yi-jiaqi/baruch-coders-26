--[[
	WinCelebration.lua (LocalScript)

	PURPOSE: Shows celebration UI when player completes the obby
	LOCATION: Place this LocalScript in StarterPlayer > StarterPlayerScripts

	HOW IT WORKS:
	- Listens for win event from server
	- Shows congratulations message with completion time
	- Displays confetti effect (simple particle simulation)
]]

-- SERVICES --
local Players = game:GetService("Players")
local TweenService = game:GetService("TweenService")
local ReplicatedStorage = game:GetService("ReplicatedStorage")

-- Get the local player
local player = Players.LocalPlayer

-- CREATE THE WIN UI (hidden by default) --

local screenGui = Instance.new("ScreenGui")
screenGui.Name = "WinGui"
screenGui.ResetOnSpawn = false
screenGui.Parent = player:WaitForChild("PlayerGui")

-- Dark overlay
local overlay = Instance.new("Frame")
overlay.Name = "Overlay"
overlay.Size = UDim2.new(1, 0, 1, 0)
overlay.BackgroundColor3 = Color3.fromRGB(0, 0, 0)
overlay.BackgroundTransparency = 1  -- Start invisible
overlay.BorderSizePixel = 0
overlay.Visible = false
overlay.Parent = screenGui

-- Win message frame
local winFrame = Instance.new("Frame")
winFrame.Name = "WinFrame"
winFrame.Size = UDim2.new(0, 400, 0, 250)
winFrame.Position = UDim2.new(0.5, 0, 0.5, 0)
winFrame.AnchorPoint = Vector2.new(0.5, 0.5)
winFrame.BackgroundColor3 = Color3.fromRGB(40, 40, 40)
winFrame.BorderSizePixel = 0
winFrame.Visible = false
winFrame.Parent = screenGui

-- Round corners
local corner = Instance.new("UICorner")
corner.CornerRadius = UDim.new(0, 16)
corner.Parent = winFrame

-- Gold border effect
local stroke = Instance.new("UIStroke")
stroke.Thickness = 3
stroke.Color = Color3.fromRGB(255, 215, 0)
stroke.Parent = winFrame

-- Congratulations title
local titleLabel = Instance.new("TextLabel")
titleLabel.Name = "Title"
titleLabel.Size = UDim2.new(1, 0, 0, 60)
titleLabel.Position = UDim2.new(0, 0, 0, 20)
titleLabel.BackgroundTransparency = 1
titleLabel.TextColor3 = Color3.fromRGB(255, 215, 0)
titleLabel.TextSize = 40
titleLabel.Font = Enum.Font.GothamBold
titleLabel.Text = "YOU WIN!"
titleLabel.Parent = winFrame

-- Time display
local timeLabel = Instance.new("TextLabel")
timeLabel.Name = "TimeLabel"
timeLabel.Size = UDim2.new(1, 0, 0, 40)
timeLabel.Position = UDim2.new(0, 0, 0, 90)
timeLabel.BackgroundTransparency = 1
timeLabel.TextColor3 = Color3.fromRGB(255, 255, 255)
timeLabel.TextSize = 30
timeLabel.Font = Enum.Font.Code
timeLabel.Text = "Time: 0:00.00"
timeLabel.Parent = winFrame

-- Subtitle
local subtitleLabel = Instance.new("TextLabel")
subtitleLabel.Name = "Subtitle"
subtitleLabel.Size = UDim2.new(1, 0, 0, 30)
subtitleLabel.Position = UDim2.new(0, 0, 0, 140)
subtitleLabel.BackgroundTransparency = 1
subtitleLabel.TextColor3 = Color3.fromRGB(200, 200, 200)
subtitleLabel.TextSize = 18
subtitleLabel.Font = Enum.Font.Gotham
subtitleLabel.Text = "Great job completing the obby!"
subtitleLabel.Parent = winFrame

-- Close hint
local hintLabel = Instance.new("TextLabel")
hintLabel.Name = "Hint"
hintLabel.Size = UDim2.new(1, 0, 0, 20)
hintLabel.Position = UDim2.new(0, 0, 1, -30)
hintLabel.BackgroundTransparency = 1
hintLabel.TextColor3 = Color3.fromRGB(150, 150, 150)
hintLabel.TextSize = 14
hintLabel.Font = Enum.Font.Gotham
hintLabel.Text = "Click anywhere to close"
hintLabel.Parent = winFrame

-- FUNCTIONS --

local function showWinScreen(timeString)
	-- Update the time
	timeLabel.Text = "Time: " .. timeString

	-- Show elements
	overlay.Visible = true
	winFrame.Visible = true

	-- Fade in overlay
	local overlayTween = TweenService:Create(
		overlay,
		TweenInfo.new(0.3),
		{BackgroundTransparency = 0.7}
	)
	overlayTween:Play()

	-- Scale in the win frame
	winFrame.Size = UDim2.new(0, 0, 0, 0)
	local frameTween = TweenService:Create(
		winFrame,
		TweenInfo.new(0.5, Enum.EasingStyle.Back, Enum.EasingDirection.Out),
		{Size = UDim2.new(0, 400, 0, 250)}
	)
	frameTween:Play()

	-- Create simple confetti effect
	for i = 1, 20 do
		task.spawn(function()
			local confetti = Instance.new("Frame")
			confetti.Size = UDim2.new(0, math.random(10, 20), 0, math.random(10, 20))
			confetti.Position = UDim2.new(math.random(), 0, -0.1, 0)
			confetti.BackgroundColor3 = Color3.fromHSV(math.random(), 0.8, 1)
			confetti.BorderSizePixel = 0
			confetti.Rotation = math.random(0, 360)
			confetti.Parent = screenGui

			local confettiCorner = Instance.new("UICorner")
			confettiCorner.CornerRadius = UDim.new(0, 4)
			confettiCorner.Parent = confetti

			-- Fall animation
			local fallTween = TweenService:Create(
				confetti,
				TweenInfo.new(math.random(20, 40) / 10, Enum.EasingStyle.Linear),
				{
					Position = UDim2.new(confetti.Position.X.Scale + (math.random() - 0.5) * 0.3, 0, 1.1, 0),
					Rotation = confetti.Rotation + math.random(-360, 360)
				}
			)
			fallTween:Play()
			fallTween.Completed:Connect(function()
				confetti:Destroy()
			end)
		end)
	end
end

local function hideWinScreen()
	-- Fade out
	local overlayTween = TweenService:Create(
		overlay,
		TweenInfo.new(0.3),
		{BackgroundTransparency = 1}
	)
	overlayTween:Play()

	local frameTween = TweenService:Create(
		winFrame,
		TweenInfo.new(0.3),
		{Size = UDim2.new(0, 0, 0, 0)}
	)
	frameTween:Play()
	frameTween.Completed:Connect(function()
		overlay.Visible = false
		winFrame.Visible = false
	end)
end

-- CLICK TO CLOSE --

overlay.InputBegan:Connect(function(input)
	if input.UserInputType == Enum.UserInputType.MouseButton1 or
	   input.UserInputType == Enum.UserInputType.Touch then
		hideWinScreen()
	end
end)

winFrame.InputBegan:Connect(function(input)
	if input.UserInputType == Enum.UserInputType.MouseButton1 or
	   input.UserInputType == Enum.UserInputType.Touch then
		hideWinScreen()
	end
end)

-- LISTEN FOR WIN EVENT --

local winEvent = ReplicatedStorage:WaitForChild("PlayerWonEvent", 10)

if winEvent then
	winEvent.OnClientEvent:Connect(function(completionTime, timeString)
		if completionTime then
			-- We won!
			showWinScreen(timeString)
		end
	end)
	print("Win celebration ready!")
else
	warn("Could not find PlayerWonEvent - win celebration won't work")
end
