package groups

import (
	"fmt"

	"github.com/spf13/cobra"

	"github.com/egovelox/mozeidon/browser/core/models"
	"github.com/egovelox/mozeidon/cmd/flags"
	"github.com/egovelox/mozeidon/core"
)

var groupId int64
var index int64
var collapsed bool
var groupColor string
var groupTitle string

var UpdateGroupCmd = &cobra.Command{
	Use:   "update",
	Short: `Update a given group`,
	Long:  "Update a given group's collapsed status and/or color and/or title or index",
	Args:  cobra.NoArgs,
	Run: func(cmd *cobra.Command, args []string) {
		app, err := core.NewAppWithProfile(flags.ProfileID)
		if err != nil {
			core.PrintError(err.Error())
			return
		}

		if groupColor != "" && !models.IsValidGroupColor(groupColor) {
			core.PrintError(fmt.Sprintf("Invalid tab group color. Allowed colors are: %s", models.AllowedColorsString()))
			return
		}

		if index < -1 {
			core.PrintError("Invalid index. When provided, it must be positive")
			return
		}

		userProvidedCollapsed := false
		if cmd.Flag("collapsed").Changed {
			userProvidedCollapsed = true
		}

		if index >= 0 {
			app.GroupsMove(groupId, index)
		} else {
			app.GroupsUpdate(groupId, groupTitle, groupColor, userProvidedCollapsed, collapsed)
		}

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
	UpdateGroupCmd.Flags().
		Int64VarP(&index, "index", "i", -1, "the group's first tab index")
	UpdateGroupCmd.MarkFlagsOneRequired("title", "color", "collapsed", "index")
	UpdateGroupCmd.MarkFlagsMutuallyExclusive("index", "title")
	UpdateGroupCmd.MarkFlagsMutuallyExclusive("index", "color")
	UpdateGroupCmd.MarkFlagsMutuallyExclusive("index", "collapsed")
}
