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
	"time"
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

// isIpcSocketAlive checks if the IPC socket file for a profile exists.
// This handles containerized environments (Flatpak, Docker, etc.) where the
// native-app runs in a different PID namespace. The PID written to the profile
// file is the container-internal PID, which doesn't exist on the host, causing
// isProcessRunning to return false even though the native-app is running.
// The IPC socket in /tmp is shared between host and container, so checking
// for the socket file is a reliable fallback.
//
// We only check file existence rather than attempting a connection because
// the golang-ipc library uses an encrypted handshake — connecting and
// disconnecting here would disrupt the server's state and cause the real
// CLI connection to fail.
func isIpcSocketAlive(ipcName string) bool {
	socketPath := "/tmp/" + ipcName + ".sock"
	_, err := os.Stat(socketPath)
	return err == nil
}

// findOrphanedSockets returns IPC socket names that have no corresponding profile file.
// This can happen in containerized environments where the native-app fails to write
// the profile file, or when the profile was deleted but the socket persists.
func findOrphanedSockets(profileDir string, existingProfiles map[string]bool) []string {
	var orphaned []string
	socketPattern := "/tmp/mozeidon_native_app_*.sock"
	matches, err := filepath.Glob(socketPattern)
	if err != nil {
		return orphaned
	}

	for _, sockPath := range matches {
		// Extract ipcName from socket path: /tmp/{ipcName}.sock
		ipcName := strings.TrimSuffix(filepath.Base(sockPath), ".sock")
		if !existingProfiles[ipcName] {
			orphaned = append(orphaned, ipcName)
		}
	}
	return orphaned
}

// createProfileFromSocket creates a minimal profile for an orphaned socket.
// The socket name format is: mozeidon_native_app_{PID}_{PROFILE_ID_SHORT}
// This enables CLI communication when the native-app is running but didn't
// write a profile file (common in Flatpak/containerized setups).
func createProfileFromSocket(profileDir string, ipcName string) (*Profile, error) {
	// Parse socket name: mozeidon_native_app_{PID}_{PROFILE_ID_SHORT}
	parts := strings.Split(ipcName, "_")
	if len(parts) < 4 {
		return nil, fmt.Errorf("invalid socket name format: %s", ipcName)
	}

	pidStr := parts[3]                      // e.g., "262"
	profileIdShort := parts[4]              // e.g., "c261f255"
	pid, _ := strconv.Atoi(pidStr)
	fileName := fmt.Sprintf("%s_%s.json", pidStr, profileIdShort)

	profile := &Profile{
		IpcName:        ipcName,
		FileName:       fileName,
		BrowserName:    "Unknown",
		BrowserEngine:  "unknown",
		BrowserVersion: "unknown",
		ProfileId:      fmt.Sprintf("%s-0000-0000-0000-000000000000", profileIdShort),
		ProfileName:    "Auto-created",
		ProfileAlias:   "",
		ProfileCommandAlias: "",
		ProfileRank:    1,
		InstanceId:     "00000000-0000-0000-0000-000000000000",
		UserAgent:      "Mozilla/5.0",
		Pid:            pid,
		RegisteredAt:   time.Now().UTC().Format(time.RFC3339),
	}

	// Write the profile file
	profilePath := filepath.Join(profileDir, fileName)
	data, err := json.MarshalIndent(profile, "", "  ")
	if err != nil {
		return nil, fmt.Errorf("error marshaling profile: %w", err)
	}

	if err := os.MkdirAll(profileDir, 0755); err != nil {
		return nil, fmt.Errorf("error creating profile directory: %w", err)
	}

	if err := os.WriteFile(profilePath, data, 0644); err != nil {
		return nil, fmt.Errorf("error writing profile file: %w", err)
	}

	return profile, nil
}

// GetAllProfiles returns all active (running) profiles and removes inactive profiles.
// If no profiles exist but IPC sockets do, it creates minimal profiles from the socket
// names to enable CLI communication (handles cases where native-app doesn't write profiles).
func GetAllProfiles() ([]Profile, error) {
	profileDir, err := GetProfileDirectory()

	if err != nil {
		return nil, fmt.Errorf("error getting %s directory: %w", mozeidonProfilesDir, err)
	}

	// Check if directory exists, create if needed
	if _, err := os.Stat(profileDir); os.IsNotExist(err) {
		if err := os.MkdirAll(profileDir, 0755); err != nil {
			return nil, fmt.Errorf("error creating %s directory: %w", mozeidonProfilesDir, err)
		}
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

		// Only include if native-app is still running.
		// First try PID check (works when CLI and native-app share a PID namespace).
		// Fall back to IPC socket check for containerized environments (Flatpak,
		// Docker, etc.) where the native-app's PID is from a different namespace.
		if isProcessRunning(profile.Pid) || isIpcSocketAlive(profile.IpcName) {
			profiles = append(profiles, profile)
		} else {
			// remove file if native-app is not running
			err := os.Remove(filePath)
			if err != nil {
				return nil, fmt.Errorf("error deleting file in %s directory: %w", mozeidonProfilesDir, err)
			}
		}
	}

	// WORKAROUND: If no profiles found but sockets exist, create profiles from sockets.
	// This handles containerized environments (Flatpak, Docker) where the native-app
	// creates the IPC socket but fails to write the profile JSON file.
	// See: https://github.com/egovelox/mozeidon/issues/XXX (pending investigation)
	if len(profiles) == 0 {
		existingIpcNames := make(map[string]bool)
		for _, p := range profiles {
			existingIpcNames[p.IpcName] = true
		}

		orphanedSockets := findOrphanedSockets(profileDir, existingIpcNames)
		for _, ipcName := range orphanedSockets {
			if profile, err := createProfileFromSocket(profileDir, ipcName); err == nil {
				profiles = append(profiles, *profile)
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
