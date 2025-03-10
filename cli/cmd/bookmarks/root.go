package bookmarks

import (
	"fmt"

	"github.com/spf13/cobra"

	"github.com/egovelox/mozeidon/core"
)

var template string
var maximum int64
var chunk int64

var BookmarksCmd = &cobra.Command{
	Use:   "bookmarks",
	Short: "Get bookmarks",
	Long: "Get bookmarks" +
		"\n\n" +
		"You may get items" +
		"\n" +
		" - with a given maximum with -m" +
		"\n" +
		" - and/or divided by chunks of a given number of items using -c" +
		"\n" +
		" - using a go-template with -t",
	Run: func(_ *cobra.Command, _ []string) {
		app, err := core.NewApp()
		if err != nil {
			fmt.Println(err)
			return
		}
		if len(template) > 0 {
			app.BookmarksTemplate(template, maximum, chunk)
		} else {
			app.BookmarksJson(maximum, chunk)
		}
	},
}

func init() {
	BookmarksCmd.Flags().
		StringVarP(&template, "go-template", "t", "", "go-template to customize output")
	BookmarksCmd.Flags().
		Int64VarP(&maximum, "max", "m", 0, "the maximum number of items to return")
	BookmarksCmd.Flags().
		Int64VarP(&chunk, "chunk", "c", 0, "the number of items a chunk can contain")
}
