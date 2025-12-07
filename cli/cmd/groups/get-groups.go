package groups

import (
	"encoding/json"
	"fmt"
	"github.com/egovelox/mozeidon/core"
	"github.com/spf13/cobra"
)

var GetGroupsCmd = &cobra.Command{
	Use:   "get",
	Short: `Get all tab groups`,
	Long:  "Get all tab groups",
	Args:  cobra.NoArgs,
	Run: func(_ *cobra.Command, _ []string) {
		app, err := core.NewApp()
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
