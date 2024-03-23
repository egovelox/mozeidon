package tabs

import (
	"fmt"

	"github.com/spf13/cobra"

	"github.com/egovelox/mozeidon/core"
)

var recentlyClosed bool
var template string

var GetTabsCmd = &cobra.Command{
	Use:   "get",
	Short: `Get all opened tabs`,
	Long: "Get all opened tabs" +
		"\n\n" +
		"You may get items:" +
		"\n" +
		"- using a go-template with -t" +
		"\n" +
		"- recently-closed tabs with -c" +
		"\n\n",
	Run: func(_ *cobra.Command, _ []string) {
		app, err := core.NewApp()
		if err != nil {
			fmt.Println(err)
			return
		}
		if len(template) > 0 {
			app.TabsTemplate(template)
		} else {
			app.TabsJson("", recentlyClosed)
		}
	},
}

func init() {
	GetTabsCmd.Flags().
		StringVarP(&template, "go-template", "t", "", "go-template to customize output")
	GetTabsCmd.Flags().
		BoolVarP(&recentlyClosed, "closed", "c", false, "only recently-closed tabs")
}
