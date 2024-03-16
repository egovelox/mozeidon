package bookmarks

import (
	"fmt"

	"github.com/spf13/cobra"

	"github.com/egovelox/mozicli/core"
)

var json bool

var BookmarksCmd = &cobra.Command{
	Use:   "bookmarks",
	Short: "Bookmarks is a palette that contains bookmarks based commands",
	Long:  ``,
	Run: func(_ *cobra.Command, _ []string) {
		app, err := core.NewApp()
		if err != nil {
			fmt.Println(err)
			return
		}
		if json {
			app.BookmarksJson("")
		} else {
			app.Bookmarks("")
		}
	},
}

func init() {
	BookmarksCmd.Flags().BoolVarP(&json, "json", "j", false, "json output")
}
