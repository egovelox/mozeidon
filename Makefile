build-firefox-addon:
	cd firefox-addon && ./build.sh
build-native-app:
	cd native-app && go build
build-cli:
	cd cli && go build

all: build-cli build-native-app build-firefox-addon
