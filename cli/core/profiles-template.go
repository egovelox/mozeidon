package core

import (
	"os"
	goTemplates "text/template"

	"github.com/egovelox/mozeidon/profiles"
)

type ProfilesTemplateItems struct {
	Items []profiles.Profile
}

func ProfilesTemplate(template string) {
	allProfiles, err := profiles.GetAllProfiles()
	if err != nil {
		PrintError("[Error] Failed to get profiles: " + err.Error())
		os.Exit(1)
	}

	data := ProfilesTemplateItems{
		Items: allProfiles,
	}

	t, err := goTemplates.New("profiles-template").Parse(template)
	if err != nil {
		PrintError("[Error] Invalid template: " + err.Error())
		os.Exit(1)
	}

	if err := t.Execute(os.Stdout, data); err != nil {
		PrintError("[Error] Failed to execute template: " + err.Error())
		os.Exit(1)
	}
}
