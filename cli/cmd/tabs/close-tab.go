package tabs

import (
	"fmt"

	"github.com/spf13/cobra"

	"github.com/egovelox/mozicli/core"
)

var CloseTabCmd = &cobra.Command{
	Use:   "close",
	Short: "close a tab by id",
	Long:  ``,
	Args:  cobra.MinimumNArgs(1),
	Run: func(_ *cobra.Command, args []string) {
		app, err := core.NewApp()
		if err != nil {
			fmt.Println(err)
			return
		}
		app.TabsClose(args)
	},
}

func init() {
}
