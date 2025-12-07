package core

import (
	"encoding/json"
	"fmt"
	"strings"

	"github.com/egovelox/mozeidon/browser/core/models"
)

func PrintError(message string) {
	errorJSON, _ := json.Marshal(map[string]string{"error": message})
	fmt.Println(string(errorJSON))
}

func checkForError(resultData []byte) bool {
	data := models.DataResult{}
	json.Unmarshal(resultData, &data)

	if strings.HasPrefix(string(data.Data), "[Error]") {
		PrintError(string(data.Data))
		return true
	}

	return false
}
