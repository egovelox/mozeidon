package profiles

import (
	"encoding/json"
	"fmt"
	"os"
	"path/filepath"
	"sort"
	"strconv"
	"strings"
	"syscall"
)

// Profile represents a running native-app instance
type Profile struct {
	IpcName             string `json:"ipcName"`
	FileName            string `json:"fileName"`
	BrowserName         string `json:"browserName"`
	BrowserEngine       string `json:"browserEngine"`
	BrowserVersion      string `json:"browserVersion"`
	ProfileId           string `json:"profileId"`
	ProfileName         string `json:"profileName"`
	ProfileAlias        string `json:"profileAlias"`
	ProfileCommandAlias string `json:"profileCommandAlias"`
	ProfileRank         int    `json:"profileRank"`
	InstanceId          string `json:"instanceId"`
	UserAgent           string `json:"userAgent"`
	Pid                 int    `json:"pid"`
	RegisteredAt        string `json:"registeredAt"`
}

var mozeidonProfilesDir = "mozeidon_profiles"

// GetProfileDirectory returns the platform-specific directory for profile files
func GetProfileDirectory() (string, error) {
	configDir, err := os.UserConfigDir()
	if err != nil {
		return "", err
	}
	profilesDir := filepath.Join(configDir, mozeidonProfilesDir)
	return profilesDir, err
}

// extractPidFromFilename extracts PID from filename format: {PID}_{browser-profile}_{shortId}.json
func extractPidFromFilename(filename string) (int, error) {
	// Remove .json extension
	name := strings.TrimSuffix(filename, ".json")

	// Split by underscore
	parts := strings.SplitN(name, "_", 2)
	if len(parts) < 1 {
		return 0, fmt.Errorf("invalid filename format: %s", filename)
	}

	// Parse PID from first part
	pid, err := strconv.Atoi(parts[0])
	if err != nil {
		return 0, fmt.Errorf("invalid PID in filename %s: %w", filename, err)
	}

	return pid, nil
}

// isProcessRunning checks if a process with the given PID is running
func isProcessRunning(pid int) bool {
	// Try to send signal 0 (null signal) to check if process exists
	process, err := os.FindProcess(pid)
	if err != nil {
		return false
	}

	// On Unix, signal 0 checks if process exists without actually sending a signal
	err = process.Signal(syscall.Signal(0))
	if err != nil {
		return false
	}

	return true
}

// GetAllProfiles returns all active (running) profiles and removes inactive profiles.
func GetAllProfiles() ([]Profile, error) {
	profileDir, err := GetProfileDirectory()

	if err != nil {
		return nil, fmt.Errorf("error getting %s directory: %w", mozeidonProfilesDir, err)
	}

	// Check if directory exists
	if _, err := os.Stat(profileDir); os.IsNotExist(err) {
		// Directory doesn't exist, return empty list
		return []Profile{}, nil
	}

	entries, err := os.ReadDir(profileDir)
	if err != nil {
		return nil, fmt.Errorf("error reading %s directory: %w", mozeidonProfilesDir, err)
	}

	// create an empty slice ( not a nil slice )
	profiles := []Profile{}

	for _, entry := range entries {
		if entry.IsDir() {
			continue
		}

		// Only process .json files
		if filepath.Ext(entry.Name()) != ".json" {
			continue
		}

		filePath := filepath.Join(profileDir, entry.Name())

		// Read and parse the file
		data, err := os.ReadFile(filePath)
		if err != nil {
			// Can't read file, skip it
			continue
		}

		var profile Profile
		if err := json.Unmarshal(data, &profile); err != nil {
			// Invalid JSON, skip it
			continue
		}

		// Only include if process is still running
		if isProcessRunning(profile.Pid) {
			profiles = append(profiles, profile)
		} else {
			// remove file is process is not running
			err := os.Remove(filePath)
			if err != nil {
				return nil, fmt.Errorf("error deleting file in %s directory: %w", mozeidonProfilesDir, err)
			}
		}
	}

	return profiles, nil
}

// GetPreferredProfile returns the preferred profile from a list of profiles.
// Sorts by most recent RegisteredAt, then picks the one with highest ProfileRank.
// Returns an error if the profiles list is empty.
func GetPreferredProfile(profiles *[]Profile) (*Profile, error) {
	if profiles == nil || len(*profiles) == 0 {
		return nil, fmt.Errorf("no profiles available in %s directory", mozeidonProfilesDir)
	}

	// Sort profiles by RegisteredAt (most recent first)
	sort.Slice(*profiles, func(i, j int) bool {
		return (*profiles)[i].RegisteredAt > (*profiles)[j].RegisteredAt
	})

	// Find the profile with highest ProfileRank
	preferredProfile := &(*profiles)[0]
	for i := range *profiles {
		if (*profiles)[i].ProfileRank > preferredProfile.ProfileRank {
			preferredProfile = &(*profiles)[i]
		}
	}

	return preferredProfile, nil
}

func GetProfileById(profileId string) (*Profile, error) {

	allProfiles, err := GetAllProfiles()
	if err != nil {
		return nil, fmt.Errorf("error getting profiles: %w", err)
	}

	if profileId == "" {
		// No ID provided, use preferred
		return GetPreferredProfile(&allProfiles)
	}

	// Find by profileId
	for i := range allProfiles {
		if allProfiles[i].ProfileId == profileId {
			return &allProfiles[i], nil
		}
	}
	// Find by profileAlias
	for i := range allProfiles {
		if allProfiles[i].ProfileAlias == profileId {
			return &allProfiles[i], nil
		}
	}

	return nil, fmt.Errorf(
		"No profileId or profileAlias in %s directory matching with received value : %s",
		mozeidonProfilesDir,
		profileId)
}
