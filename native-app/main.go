package main

// TODO: add in readme
// To learn about native-messaging protocol (common to browsers like Chrome or Firefox)
// see https://developer.chrome.com/docs/extensions/develop/concepts/native-messaging#native-messaging-host-protocol

import (
	"encoding/json"
	"log"
	"os"

	"github.com/james-barrow/golang-ipc"
	"github.com/rickypc/native-messaging-host"
)

func main() {
	/*
			   Listen to, and handle incoming ipc message :
		    - forward each incoming message to the web-browser
		    - send back each browser response as outgoing ipc message
	*/

	proxy("mozicli_host")
}

func proxy(ipcName string) {
	ipcConfig := &ipc.ServerConfig{

		Encryption:        true, // allows encryption to be switched off (bool - default is true)
		UnmaskPermissions: true, // make the socket writeable for other users (default is false)
	}
	ipcServer, err := ipc.StartServer(ipcName, ipcConfig)
	if err != nil {
		log.Fatalf("Error starting %s ipc-server: %v", ipcName, err)
	}

	browserMessagingClient := (&host.Host{}).Init()

	// Listen to, and handle incoming message
	// TODO: log errors in a file ?
	for {
		message, _ := ipcServer.Read()
		if message.MsgType > 0 {

			// Parse incoming message
			incomingMessage := IpcIncomingMessage{}
			json.Unmarshal(message.Data, &incomingMessage)

			// Send incoming message to browser
			request := &host.H{"payload": incomingMessage}
			if err := browserMessagingClient.PostMessage(os.Stdout, request); err != nil {
				os.Exit(1)
			}

			// Wait for browser message
			response := &host.H{}
			if err := browserMessagingClient.OnMessage(os.Stdin, response); err != nil {
				os.Exit(1)
			}

			responseMessage, _ := json.Marshal(response)
			err = ipcServer.Write(1, responseMessage)
		}
	}
}

type IpcIncomingMessage struct {
	Command string `json:"command"        binding:"required"`
	Args    string `json:"args,omitempty"`
}
