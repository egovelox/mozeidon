package models

type Command struct {
	Command string `json:"command"        binding:"required"`
	Args    string `json:"args,omitempty"`
}

type CommandResult struct {
	Data []byte
}

type DataResult struct {
	Data string `json:"data"`
}
