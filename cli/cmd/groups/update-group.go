package groups

import (
	"fmt"

	"github.com/spf13/cobra"

	"github.com/egovelox/mozeidon/browser/core/models"
	"github.com/egovelox/mozeidon/core"
)

var groupId int64
var collapsed bool
var groupColor string
var groupTitle string

var UpdateGroupCmd = &cobra.Command{
	Use:   "update",
	Short: `Update a given group`,
	Long:  "Update a given group's collapsed status and/or color and/or title",
	Args:  cobra.NoArgs,
	Run: func(cmd *cobra.Command, args []string) {
		app, err := core.NewApp()
		if err != nil {
			fmt.Println(err)
			return
		}

		if groupColor != "" && !models.IsValidGroupColor(groupColor) {
			fmt.Printf("[Error] Invalid tab group color. Allowed colors are: %s\n", models.AllowedColorsString())
			return
		}

		userProvidedCollapsed := false
		if cmd.Flag("collapsed").Changed {
			userProvidedCollapsed = true
		}

		app.GroupsUpdate(groupId, groupTitle, groupColor, userProvidedCollapsed, collapsed)

	},
}

func init() {
	UpdateGroupCmd.Flags().
		Int64VarP(&groupId, "group-id", "g", 0, "the group id")
	UpdateGroupCmd.MarkFlagRequired("group-id")
	UpdateGroupCmd.Flags().
		StringVarP(&groupTitle, "title", "t", "", "the group title")
	UpdateGroupCmd.Flags().
		StringVarP(&groupColor, "color", "c", "", "the group color")
	UpdateGroupCmd.Flags().
		BoolVar(&collapsed, "collapsed", false, "whether the group should be collapsed")
	UpdateGroupCmd.MarkFlagsOneRequired("title", "color", "collapsed")
}
