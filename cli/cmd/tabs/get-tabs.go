package tabs

import (
	"github.com/spf13/cobra"

	"github.com/egovelox/mozeidon/cmd/flags"
	"github.com/egovelox/mozeidon/core"
)

var recentlyClosed bool
var template string
var latest10First bool
var withGroups bool
var withWindows bool

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
		"\n" +
		"- with tab groups with -g" +
		"\n" +
		"- with windows indormation with -w" +
		"\n\n",
	Run: func(_ *cobra.Command, _ []string) {
		app, err := core.NewAppWithProfile(flags.ProfileID)
		if err != nil {
			core.PrintError(err.Error())
			return
		}
		if len(template) > 0 {
			app.TabsTemplate(template, recentlyClosed, latest10First)
		} else {
			app.TabsJson(recentlyClosed, latest10First, withGroups, withWindows)
		}
	},
}

func init() {
	GetTabsCmd.Flags().
		StringVarP(&template, "go-template", "t", "", "go-template to customize output")
	GetTabsCmd.Flags().
		BoolVarP(&recentlyClosed, "closed", "c", false, "only recently-closed tabs")
	GetTabsCmd.Flags().
		BoolVarP(&latest10First, "latest-first", "l", true, "order 10 latest accessed tabs first")
	GetTabsCmd.Flags().
		BoolVarP(&withGroups, "with-groups", "g", false, "add tab groups")
	GetTabsCmd.Flags().
		BoolVarP(&withWindows, "with-windows", "w", false, "add windows information")
	GetTabsCmd.MarkFlagsMutuallyExclusive("closed", "latest-first")
	GetTabsCmd.MarkFlagsMutuallyExclusive("go-template", "with-groups")
	GetTabsCmd.MarkFlagsMutuallyExclusive("go-template", "with-windows")
}
