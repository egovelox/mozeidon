package tabs

import (
	"fmt"

	"github.com/spf13/cobra"

	"github.com/egovelox/mozeidon/core"
)

var json bool
var recentlyClosed bool
var template string

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
		if len(template) > 0 {
			app.TabsTemplate(template)
		} else if json {
			app.TabsJson("", recentlyClosed)
		} else {
			app.Tabs("", recentlyClosed)
		}
	},
}

func init() {
	TabsCmd.Flags().
		StringVarP(&template, "go-template", "t", "", "go-template to customize output")
	TabsCmd.Flags().BoolVarP(&json, "json", "j", false, "json output")
	TabsCmd.Flags().
		BoolVarP(&recentlyClosed, "closed", "c", false, "only recently-closed tabs")

	TabsCmd.AddCommand(SwitchTabCmd)
	TabsCmd.AddCommand(CloseTabCmd)
	TabsCmd.AddCommand(NewTabCmd)
}
