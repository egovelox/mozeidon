package groups

import (
	"encoding/json"
	"fmt"

	"github.com/spf13/cobra"

	"github.com/egovelox/mozeidon/cmd/flags"
	"github.com/egovelox/mozeidon/core"
)

var GetGroupsCmd = &cobra.Command{
	Use:   "get",
	Short: `Get all tab groups`,
	Long:  "Get all tab groups",
	Args:  cobra.NoArgs,
	Run: func(_ *cobra.Command, _ []string) {
		app, err := core.NewAppWithProfile(flags.ProfileID)
		if err != nil {
			core.PrintError(err.Error())
			return
		}
		channelGroups := app.GroupsGet()
		groups := <-channelGroups
		groupsAsString, _ := json.Marshal(groups)
		fmt.Println(string(groupsAsString))
		<-channelGroups
	},
}

func init() {
}
