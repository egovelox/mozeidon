package core

import (
	"encoding/json"
	"fmt"
)

func (a *App) TabsJson(recentlyClosed bool, latest10First bool) {
	// TODO: handle error

	channel := a.TabsGet(recentlyClosed, latest10First)
	tabs := <-channel
	tabsAsString, _ := json.Marshal(tabs)

	fmt.Println(string(tabsAsString))
	<-channel

}
