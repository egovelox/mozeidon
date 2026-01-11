package core

import (
	"encoding/json"
	"fmt"
	"os"

	"github.com/egovelox/mozeidon/profiles"
)

type ProfilesResponse struct {
	Data []profiles.Profile `json:"data"`
}

func ProfilesJson() {
	allProfiles, err := profiles.GetAllProfiles()
	if err != nil {
		PrintError("[Error] Failed to get profiles: " + err.Error())
		os.Exit(1)
	}

	response := ProfilesResponse{
		Data: allProfiles,
	}

	jsonData, err := json.Marshal(response)
	if err != nil {
		PrintError("[Error] Failed to marshal profiles: " + err.Error())
		os.Exit(1)
	}

	fmt.Println(string(jsonData))
}
