package core

import (
	"encoding/json"
	"fmt"

	"github.com/egovelox/mozeidon/browser/core/models"
)

func (a *App) TabsJson(recentlyClosed bool, latest10First bool, withGroups bool) {
	// TODO: handle error

	channelTabs := a.TabsGet(recentlyClosed, latest10First)
	tabs := <-channelTabs

	if withGroups {
		channelGroups := a.GroupsGet()
		groups := <-channelGroups
		res := models.TabsWithGroups{
			Items:  tabs.Items,
			Groups: groups.Items,
		}
		tabsWithGroupsAsString, _ := json.Marshal(res)
		fmt.Println(string(tabsWithGroupsAsString))
		<-channelTabs
		<-channelGroups
		return
	}

	tabsAsString, _ := json.Marshal(tabs)
	fmt.Println(string(tabsAsString))
	<-channelTabs
}
