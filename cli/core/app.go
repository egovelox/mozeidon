package core

import (
	"github.com/spf13/viper"

	"github.com/egovelox/mozicli/browser/core"
)

type App struct {
	browser *core.BrowserService
	viper   *viper.Viper
}

func NewApp() (*App, error) {
	viper, err := InitConfig()

	if err != nil {
		return nil, err
	}

	browser := core.NewBrowserService()

	return &App{browser: browser, viper: viper}, nil
}
