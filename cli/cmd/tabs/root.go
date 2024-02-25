package tabs

import (
	"github.com/spf13/cobra"
)

// NetCmd represents the net command
var TabsCmd = &cobra.Command{
	Use:   "tabs",
	Short: "Tabs is a palette that contains tabs based commands",
	Long:  ``,
	Run: func(cmd *cobra.Command, _ []string) {
		cmd.Help()
	},
}

func init() {
}
