package cmd

import (
	"os"

	"github.com/spf13/cobra"

	"github.com/egovelox/mozeidon/cmd/bookmarks"
	"github.com/egovelox/mozeidon/cmd/tabs"
)

var rootCmd = &cobra.Command{
	Use:   "mozeidon",
	Short: "A cli to interact with moz://a firefox web-browser",
	Long: `
Mozicli is a CLI to control a moz://a firefox instance.
- retrieve tabs, switch between them or close them.
- retrieve bookmarks, search and open them.
`,
	// Uncomment the following line if app has an action associated with it:
	// Run: func(cmd *cobra.Command, args []string) { },
}

func init() {
	rootCmd.AddCommand(tabs.TabsCmd)
	rootCmd.AddCommand(bookmarks.BookmarksCmd)
}
func Execute() {
	err := rootCmd.Execute()
	if err != nil {
		os.Exit(1)
	}
}
