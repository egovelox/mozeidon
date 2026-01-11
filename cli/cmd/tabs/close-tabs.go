package tabs

import (
	"github.com/spf13/cobra"

	"github.com/egovelox/mozeidon/cmd/flags"
	"github.com/egovelox/mozeidon/core"
)

var CloseTabCmd = &cobra.Command{
	Use:   "close",
	Short: `Close one or more tabs`,
	Long:  "close one or more tabs by id(s)\n\nRequired argument(s):\nOne or more string, each composed of {windowId}:{tabId} \ne.g\n  mozeidon tabs close 3:112 3:113\n\n",
	Args:  cobra.MinimumNArgs(1),
	Run: func(_ *cobra.Command, args []string) {
		app, err := core.NewAppWithProfile(flags.ProfileID)
		if err != nil {
			core.PrintError(err.Error())
			return
		}
		app.TabsClose(args)
	},
}

func init() {
}
