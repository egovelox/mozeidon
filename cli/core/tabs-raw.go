package core

import (
	"encoding/json"
	"fmt"
)

func (a *App) TabsRaw(query string, recentlyClosed bool) {
	// TODO: handle error

	channel := a.TabsGet(recentlyClosed)
	tabs := <-channel
	tabsAsString, _ := json.Marshal(tabs)

	fmt.Println(string(tabsAsString))
	<-channel

}
