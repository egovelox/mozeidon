package core

import (
	"encoding/json"
	"fmt"

	"github.com/egovelox/mozeidon/browser/core/models"
)

func (a *App) TabsJson(recentlyClosed bool, latest10First bool, withGroups bool, withWindows bool) {
	channelTabs := a.TabsGet(recentlyClosed, latest10First)
	tabs := <-channelTabs // note: the program may have exited if TabsGet encountered an error

	if withWindows && withGroups {
		channelWindows := a.WindowsGet()
		windows := <-channelWindows // note: the program may have exited if WindowsGet encountered an error
		channelGroups := a.GroupsGet()
		groups := <-channelGroups // note: the program may have exited if GroupsGet encountered an error
		res := models.TabsWithGroupsAndWindows{
			Items:   tabs.Items,
			Groups:  groups.Items,
			Windows: windows.Items,
		}
		tabsWithGroupsAndWindowsAsString, _ := json.Marshal(res)
		fmt.Println(string(tabsWithGroupsAndWindowsAsString))
		<-channelTabs
		<-channelWindows
		<-channelGroups
		return
	}

	if withWindows && !withGroups {
		channelWindows := a.WindowsGet()
		windows := <-channelWindows // note: the program may have exited if WindowsGet encountered an error
		res := models.TabsWithWindows{
			Items:   tabs.Items,
			Windows: windows.Items,
		}
		tabsWithWindowsAsString, _ := json.Marshal(res)
		fmt.Println(string(tabsWithWindowsAsString))
		<-channelTabs
		<-channelWindows
		return
	}

	if withGroups && !withWindows {
		channelGroups := a.GroupsGet()
		groups := <-channelGroups // note: the program may have exited if GroupsGet encountered an error
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
