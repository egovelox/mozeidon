package tabs

import (
	"github.com/spf13/cobra"

	"github.com/egovelox/mozicli/core"
)

var switchTabCmd = &cobra.Command{
	Use:   "switch",
	Short: "Select a tab to switch on",
	Long:  ``,
	Run: func(_ *cobra.Command, _ []string) {
		app := core.NewApp()
		app.TabsSwitch("")
	},
}

func init() {
	TabsCmd.AddCommand(switchTabCmd)
}
