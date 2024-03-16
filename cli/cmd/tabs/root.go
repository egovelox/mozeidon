package tabs

import (
	"fmt"

	"github.com/spf13/cobra"

	"github.com/egovelox/mozeidon/core"
)

var json bool
var recentlyClosed bool

var TabsCmd = &cobra.Command{
	Use:   "tabs",
	Short: "Tabs is a palette that contains tabs based commands",
	Long:  ``,
	Run: func(_ *cobra.Command, _ []string) {
		app, err := core.NewApp()
		if err != nil {
			fmt.Println(err)
			return
		}
		if json {
			app.TabsJson("", recentlyClosed)
		} else {
			app.Tabs("", recentlyClosed)
		}
	},
}

func init() {
	TabsCmd.Flags().BoolVarP(&json, "json", "j", false, "json output")
	TabsCmd.Flags().
		BoolVarP(&recentlyClosed, "closed", "c", false, "only recently-closed tabs")

	TabsCmd.AddCommand(SwitchTabCmd)
	TabsCmd.AddCommand(CloseTabCmd)
	TabsCmd.AddCommand(NewTabCmd)
}
