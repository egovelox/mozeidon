package tabs

import (
	"github.com/spf13/cobra"

	"github.com/egovelox/mozicli/core"
)

var closeTabsCmd = &cobra.Command{
	Use:   "close",
	Short: "Select tabs to close",
	Long:  ``,
	Run: func(_ *cobra.Command, _ []string) {
		app, _ := core.NewApp()
		app.TabsClose("")
	},
}

func init() {
	TabsCmd.AddCommand(closeTabsCmd)
}
