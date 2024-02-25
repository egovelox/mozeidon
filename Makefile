build-background:
	cd background && yarn run build
build-native-app:
	cd native-app && go build
build-cli:
	cd cli && go build

all: build-cli build-native-app build-background
