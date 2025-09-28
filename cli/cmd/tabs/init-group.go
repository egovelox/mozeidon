package tabs

import (
	"fmt"

	"github.com/spf13/cobra"

	"github.com/egovelox/mozeidon/browser/core/models"
	"github.com/egovelox/mozeidon/core"
)

var groupColor string
var groupTitle string
var initGroupTabId int64
var initGroupWindowId int64

var InitGroupCmd = &cobra.Command{
	Use:   "init-group",
	Short: `Init a new tab-group from a given tab`,
	Long:  `Init a new tab-group from a given tab`,
	Args:  cobra.NoArgs,
	Run: func(_ *cobra.Command, _ []string) {
		app, err := core.NewApp()
		if err != nil {
			fmt.Println(err)
			return
		}

		if groupColor != "" && !models.IsValidGroupColor(groupColor) {
			fmt.Printf("[Error] Invalid tab group color. Allowed colors are: %s\n", models.AllowedColorsString())
			return
		}

		app.InitTabGroup(initGroupTabId, initGroupWindowId, groupTitle, groupColor)
	},
}

func init() {
	InitGroupCmd.Flags().
		Int64VarP(&initGroupTabId, "id", "i", 0, "the tab id")
	InitGroupCmd.Flags().
		Int64VarP(&initGroupWindowId, "window-id", "w", -1, "the tab's window id")
	InitGroupCmd.Flags().
		StringVarP(&groupTitle, "group-title", "t", "", "the group title")
	InitGroupCmd.Flags().
		StringVarP(&groupColor, "group-color", "c", "", "the group color")
	InitGroupCmd.MarkFlagRequired("id")
}
