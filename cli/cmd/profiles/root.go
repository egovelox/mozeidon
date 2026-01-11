package profiles

import (
	"github.com/spf13/cobra"
)

var ProfilesCmd = &cobra.Command{
	Use:   "profiles",
	Short: "Manage browser profiles",
}

func init() {
	ProfilesCmd.AddCommand(GetProfilesCmd)
	ProfilesCmd.AddCommand(UpdateProfileCmd)
}
