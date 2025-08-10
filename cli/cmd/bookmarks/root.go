package bookmarks

import (
	"fmt"

	"github.com/spf13/cobra"

	"github.com/egovelox/mozeidon/core"
)

var template string
var maximum int64
var chunk int64
var md5Hash string

var BookmarksCmd = &cobra.Command{
	Use:   "bookmarks",
	Short: "Get bookmarks",
	Long: "Get bookmarks" +
		"\n\n" +
		"You can get bookmarks items" +
		"\n" +
		" - with a given maximum with -m" +
		"\n" +
		" - and/or divided by chunks of a given number of items using -c" +
		"\n" +
		"   note that you will receive multiple JSON chunks, but the whole response will not be valid JSON." +
		"\n" +
		" - using a go-template with -t" +
		"\n" +
		" - using a md5 hash with --hash" +
		"\n" +
		"   note that --hash flag will be ignored if using --go-template flag aka -t" +
		"\n" +
		"   note that: " +
		"     - if the hash is not matched, you will get bookmarks items" +
		"\n" +
		`     - if the hash is matched, you will get a simple string : "bookmarks_synchronized"` +
		"\n\n",
	Run: func(_ *cobra.Command, _ []string) {
		app, err := core.NewApp()
		if err != nil {
			fmt.Println(err)
			return
		}
		if len(template) > 0 {
			app.BookmarksTemplate(template, maximum, chunk)
		} else {
			app.BookmarksJson(maximum, chunk, md5Hash)
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
	BookmarksCmd.Flags().
		StringVar(&md5Hash, "hash", "", "a md5 hash to be compared with the bookmarks you are requesting")
}
