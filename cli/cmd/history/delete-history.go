package history

import (
	"fmt"

	"github.com/spf13/cobra"

	"github.com/egovelox/mozeidon/core"
)

var url string
var all bool

var DeleteHistoryCmd = &cobra.Command{
	Use:   "delete",
	Short: `Delete history`,
	Long:  "Delete all history or by url",
	Args:  cobra.NoArgs,
	Run: func(_ *cobra.Command, _ []string) {
		app, err := core.NewApp()
		if err != nil {
			fmt.Println(err)
			return
		}
		app.HistoryDelete(url, all)
	},
}

func init() {
	DeleteHistoryCmd.Flags().
		StringVarP(&url, "url", "u", "", "url to delete")
	DeleteHistoryCmd.Flags().
		BoolVarP(&all, "all", "a", false, "delete all history")
	DeleteHistoryCmd.MarkFlagsOneRequired("url", "all")
	DeleteHistoryCmd.MarkFlagsMutuallyExclusive("url", "all")
}
