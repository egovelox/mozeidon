package tabs

import (
	"github.com/spf13/cobra"
)

var TabsCmd = &cobra.Command{
	Use: "tabs",
}

func init() {
	TabsCmd.AddCommand(GetTabsCmd)
	TabsCmd.AddCommand(SwitchTabCmd)
	TabsCmd.AddCommand(CloseTabCmd)
	TabsCmd.AddCommand(NewTabCmd)
	TabsCmd.AddCommand(UpdateTabCmd)
	TabsCmd.AddCommand(DuplicateTabCmd)
}
