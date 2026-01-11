package profiles

import (
	"encoding/json"
	"fmt"
	"os"
	"path/filepath"

	"github.com/spf13/cobra"

	"github.com/egovelox/mozeidon/cmd/flags"
	"github.com/egovelox/mozeidon/core"
	"github.com/egovelox/mozeidon/profiles"
)

var NO_VALUE = "mozeidon_NO_VALUE_mozeidon"
var alias string
var commandAlias string
var rank int

var UpdateProfileCmd = &cobra.Command{
	Use:   "update",
	Short: "Update a profile",
	Long:  "Update a profile alias, rank, or command-alias",
	Args:  cobra.NoArgs,
	Run: func(_ *cobra.Command, args []string) {
		app, err := core.NewAppWithProfile(flags.ProfileID)
		if err != nil {
			core.PrintError(err.Error())
			os.Exit(1)
		}

		// update in browser
		channelProfile := app.ProfilesUpdate(rank, alias, commandAlias)
		browserStoredProfile := <-channelProfile

		// update in profiles directory
		app.Profile.ProfileAlias = browserStoredProfile.Item.Alias
		app.Profile.ProfileCommandAlias = browserStoredProfile.Item.CommandAlias
		app.Profile.ProfileRank = int(browserStoredProfile.Item.Rank)
		profileDataDir, err := profiles.GetProfileDirectory()
		if err != nil {
			core.PrintError(fmt.Sprintf("Error getting the profile directory: %v", err))
			os.Exit(1)
		}
		jsonProfile, err := json.MarshalIndent(app.Profile, "", "  ")
		if err != nil {
			core.PrintError(fmt.Sprintf("error converting profile to json: %v", err))
			os.Exit(1)
		}
		jsonProfilePath := filepath.Join(profileDataDir, app.Profile.FileName)
		if err := os.WriteFile(jsonProfilePath, jsonProfile, 0644); err != nil {
			core.PrintError(fmt.Sprintf("error writing profile file: %v", err))
			os.Exit(1)
		}

		// Response
		browserStoredProfileAsString, _ := json.Marshal(browserStoredProfile.Item)
		fmt.Println(string(browserStoredProfileAsString))
		<-channelProfile
	},
}

func init() {
	UpdateProfileCmd.Flags().
		StringVarP(&alias, "alias", "a", NO_VALUE, "the new profile's alias value")
	UpdateProfileCmd.Flags().
		StringVarP(&commandAlias, "command-alias", "c", NO_VALUE, "the new profile's command-alias value")
	UpdateProfileCmd.Flags().
		IntVarP(&rank, "rank", "r", -200, "the new profile's rank value (integer)")
	UpdateProfileCmd.MarkFlagsOneRequired("alias", "rank", "command-alias")
}
