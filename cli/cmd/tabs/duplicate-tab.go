package tabs

import (
	"fmt"

	"github.com/spf13/cobra"

	"github.com/egovelox/mozeidon/core"
)

var duplicatedTabWindowId int64
var duplicatedTabId int64

var DuplicateTabCmd = &cobra.Command{
	Use:   "duplicate",
	Short: `Duplicate a given tab`,
	Long: "Duplicate a given tab by tab-id, and optional window-id" +
		"\n\n" +
		"e.g" +
		"\n" +
		"mozeidon tabs duplicate --tab-id 1 --window-id 1" +
		"\n\n",
	Args: cobra.NoArgs,
	Run: func(_ *cobra.Command, args []string) {
		app, err := core.NewApp()
		if err != nil {
			fmt.Println(err)
			return
		}
		app.TabsDuplicate(duplicatedTabId, duplicatedTabWindowId)
	},
}

func init() {
	DuplicateTabCmd.Flags().
		Int64VarP(&duplicatedTabId, "tab-id", "t", 0, "the tab id")
	DuplicateTabCmd.MarkFlagRequired("tab-id")
	DuplicateTabCmd.Flags().
		Int64VarP(&duplicatedTabWindowId, "window-id", "w", -1, "the tab's window id")
}
