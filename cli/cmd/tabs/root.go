package tabs

import (
	"github.com/spf13/cobra"

	"github.com/egovelox/mozicli/core"
)

// NetCmd represents the net command
var TabsCmd = &cobra.Command{
	Use:   "tabs",
	Short: "Tabs is a palette that contains tabs based commands",
	Long:  ``,
	Run: func(_ *cobra.Command, _ []string) {
		app := core.NewApp()
		app.Tabs("")
	},
}

func init() {
}
