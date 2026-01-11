package cmd

import (
	"os"

	"github.com/spf13/cobra"

	"github.com/egovelox/mozeidon/cmd/bookmark"
	"github.com/egovelox/mozeidon/cmd/bookmarks"
	"github.com/egovelox/mozeidon/cmd/flags"
	"github.com/egovelox/mozeidon/cmd/groups"
	"github.com/egovelox/mozeidon/cmd/history"
	"github.com/egovelox/mozeidon/cmd/profiles"
	"github.com/egovelox/mozeidon/cmd/tabs"
)

var rootCmd = &cobra.Command{
	Use:   "mozeidon",
	Short: "A cli to interact with moz://a firefox or chrome web-browser",
	Long: `
Mozeidon is a CLI to control a moz://a firefox or chrome instance.
- retrieve tabs, switch between them or close them.
- retrieve bookmarks, search and open them.
- retrieve history.
- retrieve tab groups.
- retrieve profiles ( aka registered browsers ).
`,
}

func init() {
	// Add persistent flag available to all subcommands
	profileIDDescription := "Profile to use ( you can pass in a profileId or a profileAlias, see profiles get command )\n" +
		"( optional, by default uses the profile with highest profileRank and most recent registeredAt )"
	rootCmd.PersistentFlags().StringVar(&flags.ProfileID, "profile-id", "", profileIDDescription)

	rootCmd.AddCommand(tabs.TabsCmd)
	rootCmd.AddCommand(bookmarks.BookmarksCmd)
	rootCmd.AddCommand(bookmark.BookmarkCmd)
	rootCmd.AddCommand(history.HistoryCmd)
	rootCmd.AddCommand(groups.GroupsCmd)
	rootCmd.AddCommand(profiles.ProfilesCmd)
}
func Execute() {
	err := rootCmd.Execute()
	if err != nil {
		os.Exit(1)
	}
}
