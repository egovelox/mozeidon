package tabs

import (
	"github.com/spf13/cobra"

	"github.com/egovelox/mozeidon/cmd/flags"
	"github.com/egovelox/mozeidon/core"
)

var open bool

var SwitchTabCmd = &cobra.Command{
	Use:   "switch",
	Short: `Switch to a given tab`,
	Long: "Switch to a given tab by id" +
		"\n\n" +
		"Required argument:" +
		"\n" +
		"A string composed of {windowId}:{tabId}" +
		"\n" +
		"e.g" +
		"\n" +
		"mozeidon tabs switch 1:100" +
		"\n\n",
	Args: cobra.ExactArgs(1),
	Run: func(_ *cobra.Command, args []string) {
		app, err := core.NewAppWithProfile(flags.ProfileID)
		if err != nil {
			core.PrintError(err.Error())
			return
		}
		app.TabsSwitch(args[0], open)
	},
}

func init() {
	SwitchTabCmd.Flags().
		BoolVarP(&open, "open", "o", false, "open firefox browser window ( only for MacOS )")
}
