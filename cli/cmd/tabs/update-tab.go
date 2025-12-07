package tabs

import (
	"github.com/spf13/cobra"

	"github.com/egovelox/mozeidon/core"
)

var tabId int64
var groupId int64
var windowId int64
var tabIndex int64
var pin bool
var shouldBeUngrouped bool

var UpdateTabCmd = &cobra.Command{
	Use:   "update",
	Short: `Update a given tab`,
	Long: "Update a given tab's pin status, group-id, and/or index" +
		"\n\n" +
		"E.g to move tab 100 into the group 1757435983351019 :" +
		"\n" +
		"mozeidon tabs update --tab-id 100 --window-id 1 --group-id 1757435983351019" +
		"\n" +
		"E.g to move tab 100 at the end of the window :" +
		"\n" +
		"mozeidon tabs update --tab-id 100 --window-id 1 --index -1" +
		"\n" +
		"E.g to unpin tab 100" +
		"\n" +
		"mozeidon tabs update --tab-id 100 --window-id 1 --pin=false" +
		"\n\n" +
		"Note that you can't move pinned tabs to a position after any unpinned tabs," +
		"\n" +
		"nore move any unpinned tabs to a position before any pinned tabs." +
		"\n\n",
	Args: cobra.NoArgs,
	Run: func(cmd *cobra.Command, args []string) {
		app, err := core.NewApp()
		if err != nil {
			core.PrintError(err.Error())
			return
		}

		userProvidedPin := false
		if cmd.Flag("pin").Changed {
			userProvidedPin = true
		}

		app.TabsUpdate(tabId, windowId, tabIndex, groupId, userProvidedPin, pin, shouldBeUngrouped)

	},
}

func init() {
	UpdateTabCmd.Flags().
		Int64VarP(&tabId, "tab-id", "t", 0, "the tab id")
	UpdateTabCmd.MarkFlagRequired("tab-id")
	UpdateTabCmd.Flags().
		Int64VarP(&windowId, "window-id", "w", 0, "the tab's window id")
	UpdateTabCmd.MarkFlagRequired("window-id")
	UpdateTabCmd.Flags().
		Int64VarP(&tabIndex, "tab-index", "i", -2, "the index position to move the tab to, starting at 0. \nA value of -1 will place the tab at the end of the window.")
	UpdateTabCmd.Flags().
		Int64VarP(&groupId, "group-id", "g", -2, "the group id to move the tab into. \nThis flag cannot be used with tab-index or pin. \nA value of -1 will place the tab out of its current group.")
	UpdateTabCmd.Flags().
		BoolVarP(&pin, "pin", "p", false, "whether the tab should be pinned")
	UpdateTabCmd.Flags().
		BoolVar(&shouldBeUngrouped, "should-be-ungrouped", false, "whether the tab should remain ungrouped ( while you change the index )")
	UpdateTabCmd.MarkFlagsOneRequired("tab-index", "pin", "group-id")
	UpdateTabCmd.MarkFlagsMutuallyExclusive("group-id", "tab-index")
	UpdateTabCmd.MarkFlagsMutuallyExclusive("group-id", "pin")
	UpdateTabCmd.MarkFlagsMutuallyExclusive("group-id", "should-be-ungrouped")
}
