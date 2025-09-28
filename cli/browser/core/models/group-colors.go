package models

import (
	"slices"
	"strings"
)

// TabGroupColors is the list of allowed tab group colors.
var TabGroupColors = []string{
	"grey", "blue", "red", "yellow", "green", "pink", "purple", "cyan", "orange",
}

func IsValidGroupColor(color string) bool {
	return slices.Contains(TabGroupColors, color)
}

// AllowedColorsString returns all colors as a comma-separated string (for error messages).
func AllowedColorsString() string {
	return strings.Join(TabGroupColors, ", ")
}
