# Mozeidon CLI Reference

Mozeidon is a CLI tool to control browsers from the Firefox or Chromium families (including Firefox, Chrome, Edge, Brave, Zen, and others). It allows you to interact with tabs, bookmarks, history, and tab groups through the command line.

## Table of Contents

- [Error Output Format](#error-output-format)
- [Commands](#commands)
  - [Profile-id](#profile-id-global-flag)
  - [Tabs](#tabs)
  - [Bookmarks](#bookmarks)
  - [Bookmark Operations](#bookmark-operations)
  - [History](#history)
  - [Groups](#groups)
  - [Profiles](#profiles)

---

## Error Output Format

Mozeidon uses **two different error formats** depending on when the error occurs:

### **Argument Parsing Errors** (Plain Text)
When you provide invalid command-line arguments (wrong flag types, missing required values, etc.), errors are displayed in **plain text** with usage information:

```
Error: invalid argument "94798031a" for "-w, --window-id" flag: strconv.ParseInt: parsing "94798031a": invalid syntax
Usage:
  mozeidon tabs init-group [flags]
```

These errors occur **before** the command executes and are handled by the CLI framework (Cobra).

### **Runtime Errors** (JSON)
When errors occur **during command execution** (connection failures, invalid IDs, browser API errors, etc.), they are output in **JSON format** for easy parsing:

E.g unknown resource inside the web-browser :
```json
{"error": "[Error] No group with id: 1757435983351012"}
```
E.g connection problem between CLI and native-app :
```json
{"error": "[Error] Cannot connect via ipc with host: mozeidon_native_app"}
```


This distinction allows scripts to:
- Parse structured JSON errors from runtime failures
- Display human-readable syntax errors for invalid command usage

---

## Commands

### Root Command

```bash
mozeidon
```

**Description:** A CLI to interact with browsers from the Firefox or Chromium families (Firefox, Chrome, Edge, Brave, Zen, etc.).

**Features:**
- Retrieve tabs, switch between them, or close them
- Retrieve bookmarks, search and open them
- Retrieve history
- Retrieve and manage tab groups
- Retrieve and manage profiles ( i.e different mozeidon extensions running at the same time )

---

### Profile Id Global Flag

The `mozeidon` CLI ( since version `4.0.0` ) on any command, globally accepts an optional `--profile-id <string>` flag. 

It's meant to inform the CLI which profile ( i.e browser instance ) you want to use for your command.

Note : 
- the `mozeidon profiles get` command will give you the available profiles ( one profile for each **running** web-browser where the mozeidon browser-extension is **activated**. )
- the `--profile-id` global-flag is optional : when it's missing, your command will target the default profile : the profile with the most recent `registeredAt` and highest `rank`. You can change the `rank` on your profiles ( see `mozeidon profiles update` ) precisely to make one or the other profile the default profile.

```sh
# get all current profiles
mozeidon profiles get

# output for two connected profiles, please note that :
# - Firefox ( profileRank 3 ) will be the default profile ( higher rank than Zen with profileRank 1 )
# - Zen profileName cannot be recognized as `Zen` by the CLI, that's why values for profileAlias and profileCommandAlias were set with the `profiles update` command. 
{
  "data": [
    {
      "ipcName": "mozeidon_native_app_57604_e9b50fac",
      "fileName": "57604_e9b50fac.json",
      "browserName": "Firefox",
      "browserEngine": "gecko",
      "browserVersion": "146.0.1",
      "profileId": "e9b50fac-c364-45c4-822f-4738fd540756",
      "profileName": "Firefox",
      "profileAlias": "",
      "profileCommandAlias": "",
      "profileRank": 3,
      "instanceId": "fa7e54a8-8f84-46ff-bd7a-f14aa86a66df",
      "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:146.0) Gecko/20100101 Firefox/146.0",
      "pid": 57604,
      "registeredAt": "2026-01-23T00:00:00.000Z"
    },
    {
      "ipcName": "mozeidon_native_app_59284_94e12d30",
      "fileName": "59284_94e12d30.json",
      "browserName": "firefox",
      "browserEngine": "gecko",
      "browserVersion": "145.0.2",
      "profileId": "94e12d30-cba2-45fe-9e50-53b10bc68d9b",
      "profileName": "firefox",
      "profileAlias": "Zen",
      "profileCommandAlias": "Zen",
      "profileRank": 1,
      "instanceId": "5fab1f7a-8296-46d3-89b7-87b20fe54c4a",
      "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:145.0) Gecko/20100101 Firefox/145.0",
      "pid": 59284,
      "registeredAt": "2026-01-23T01:00:00.000Z"
    }
  ]
}

```
Then :

```sh
# --profile-id is missing, so get all tabs for default profile
mozeidon tabs get
```

```sh
# get all tabs for Zen (using the profile's alias : Zen)
mozeidon --profile-id "Zen" tabs get
```

```sh
# same than above, the flag is global so it can be in any position.
mozeidon tabs get --profile-id "Zen"

# same again, but using the profile's id ( might be less convenient than using the profile's alias )
mozeidon tabs get --profile-id 94e12d30-cba2-45fe-9e50-53b10bc68d9b
```

## Tabs

Manage browser tabs.

### `tabs get`

Get all opened tabs.

**Usage:**
```bash
mozeidon tabs get [flags]
```

**Optional Flags:**
- `-t, --go-template <template>` - Go template to customize output
- `-c, --closed` - Get only recently-closed tabs
- `-l, --latest-first` - Order 10 latest accessed tabs first (default: `true`)
- `-g, --with-groups` - Add tab groups information

**Mutually Exclusive:**
- `--closed` and `--latest-first`
- `--go-template` and `--with-groups`

**Examples:**
```bash
# Get all tabs as JSON
mozeidon tabs get

# Get recently closed tabs
mozeidon tabs get --closed

# Get tabs with groups
mozeidon tabs get --with-groups

# Get tabs without ordering latest first
mozeidon tabs get --latest-first=false

# Custom output with Go template
mozeidon tabs get -t '{{range .Items}}{{.Title}}: {{.Url}}{{"\n"}}{{end}}'
```

---

### `tabs switch`

Switch to a given tab by ID.

**Usage:**
```bash
mozeidon tabs switch <windowId>:<tabId> [flags]
```

**Arguments:**
- `<windowId>:<tabId>` - Window and tab ID in the format `{windowId}:{tabId}`

**Flags:**
- `-o, --open` - Open `firefox` browser window ( only firefox, and only for MacOS ).  
    Same as `mozeidon tabs switch <windowId>:<tabId> && open -a firefox`.  
    Meaning that you can adapt it yourself for e.g `chrome` :  
    `mozeidon tabs switch <windowId>:<tabId> && open -a 'Google Chrome'`

**Examples:**
```bash
# Switch to tab 100 in window 1
mozeidon tabs switch 1:100
```

---

### `tabs close`

Close one or more tabs by ID.

**Usage:**
```bash
mozeidon tabs close <windowId>:<tabId> [<windowId>:<tabId>...] 
```

**Arguments:**
- `<windowId>:<tabId>` - One or more tab identifiers

**Examples:**
```bash
# Close a single tab
mozeidon tabs close 3:112

# Close multiple tabs
mozeidon tabs close 3:112 3:113 3:114
```

---

### `tabs new`

Open a new tab.

**Usage:**
```bash
mozeidon tabs new [url|keywords...]
```

**Arguments:**
- `url` - A URL to open
- `keywords...` - Space-separated search keywords

**Examples:**
```bash
# Open a URL
mozeidon tabs new https://mozilla.org

# Search with keywords
mozeidon tabs new what is mozeidon add-on extension
```

---

### `tabs update`

Update a tab's pin status, group ID, and/or index position.

**Usage:**
```bash
mozeidon tabs update --tab-id <id> --window-id <id> [flags]
```

**Required Flags:**
- `-t, --tab-id <id>` - The tab ID
- `-w, --window-id <id>` - The tab's window ID

**Optional Flags (at least one required):**
- `-i, --tab-index <index>` - Index position to move the tab to (starting at 0, `-1` = end of window)
- `-g, --group-id <id>` - Group ID to move the tab into (`-1` = remove from group)
- `-p, --pin` - Whether the tab should be pinned
- `--should-be-ungrouped` - Whether the tab should remain ungrouped (when changing index)

**Mutually Exclusive:**
- `--group-id` and `--tab-index`
- `--group-id` and `--pin`
- `--group-id` and `--should-be-ungrouped`

**Examples:**
```bash
# Move tab 100 into group
mozeidon tabs update --tab-id 100 --window-id 1 --group-id 1757435983351019

# Move tab to end of window
mozeidon tabs update --tab-id 100 --window-id 1 --index -1

# Unpin a tab
mozeidon tabs update --tab-id 100 --window-id 1 --pin=false

# Move tab to position 5
mozeidon tabs update --tab-id 100 --window-id 1 --index 5
```

**Note:** You can't move pinned tabs after unpinned tabs, nor move unpinned tabs before pinned tabs.

---

### `tabs duplicate`

Duplicate a given tab.

**Usage:**
```bash
mozeidon tabs duplicate --tab-id <id> [flags]
```

**Required Flags:**
- `-t, --tab-id <id>` - The tab ID

**Optional Flags:**
- `-w, --window-id <id>` - The tab's window ID (default: `-1`)

**Examples:**
```bash
# Duplicate tab 1 in window 1
mozeidon tabs duplicate --tab-id 1 --window-id 1

# Duplicate tab without specifying window
mozeidon tabs duplicate --tab-id 1
```

---

### `tabs init-group`

Initialize a new tab group from a given tab.

**Usage:**
```bash
mozeidon tabs init-group --id <tabId> [flags]
```

**Required Flags:**
- `-i, --id <id>` - The tab ID

**Optional Flags:**
- `-w, --window-id <id>` - The tab's window ID (default: `-1`)
- `-t, --group-title <title>` - The group title
- `-c, --group-color <color>` - The group color

**Allowed Colors:**
`grey`, `blue`, `red`, `yellow`, `green`, `pink`, `purple`, `cyan`, `orange`

**Examples:**
```bash
# Create a new group with a blue color
mozeidon tabs init-group --id 100 --group-title "Development" --group-color blue

# Create a group without color/title
mozeidon tabs init-group --id 100 --window-id 1
```

---

## Bookmarks

Retrieve bookmarks from the browser.

### `bookmarks`

Get bookmarks.

**Usage:**
```bash
mozeidon bookmarks [flags]
```

**Flags:**
- `-m, --max <number>` - Maximum number of bookmarks to return
- `-c, --chunk <number>` - Divide results into chunks of given size (note: output will not be valid JSON)
- `-t, --go-template <template>` - Go template to customize output
- `--hash <md5>` - MD5 hash for synchronization check

**Notes:**
- The `--hash` flag is ignored if using `--go-template`
- If the hash matches, returns `"bookmarks_synchronized"` string
- If the hash doesn't match, returns bookmark items

**Examples:**
```bash
# Get all bookmarks
mozeidon bookmarks

# Get maximum 100 bookmarks
mozeidon bookmarks --max 100

# Get bookmarks in chunks of 50
mozeidon bookmarks --chunk 50

# Check if bookmarks are synchronized
mozeidon bookmarks --hash a1b2c3d4e5f6...

# Custom template output
mozeidon bookmarks -t '{{range .Items}}{{.Title}}: {{.Url}}{{"\n"}}{{end}}'
```

---

## Bookmark Operations

Create, update, and delete individual bookmarks.

### `bookmark new`

Create a new bookmark.

**Usage:**
```bash
mozeidon bookmark new --title <title> --url <url> [flags]
```

**Required Flags:**
- `-t, --title <title>` - The new bookmark's title
- `-u, --url <url>` - The new bookmark's URL

**Optional Flags:**
- `-f, --folder-path <path>` - The bookmark's folder path

**Folder Path Format:**
- Must start and end with `/` character
- Starts from the root `/` (bookmark toolbar)
- Example: `/Development/Tools/`
- If omitted, bookmark is created in the browser's default location (e.g., "Other Bookmarks" in Firefox)

**Examples:**
```bash
# Create a simple bookmark
mozeidon bookmark new --title "Mozilla" --url "https://mozilla.org"

# Create bookmark in a specific folder
mozeidon bookmark new --title "GitHub" --url "https://github.com" --folder-path "/Development/"
```

---

### `bookmark update`

Update an existing bookmark.

**Usage:**
```bash
mozeidon bookmark update <id> [flags]
```

**Arguments:**
- `<id>` - The bookmark ID (string)

**Flags (at least one required):**
- `-t, --title <title>` - New title (must be non-empty)
- `-u, --url <url>` - New URL (must be non-empty)
- `-f, --folder-path <path>` - New folder path (must be non-empty)

**Examples:**
```bash
# Update bookmark title
mozeidon bookmark update abc123 --title "New Title"

# Update bookmark URL
mozeidon bookmark update abc123 --url "https://new-url.com"

# Move bookmark to different folder
mozeidon bookmark update abc123 --folder-path "/Work/"

# Update multiple properties
mozeidon bookmark update abc123 --title "Updated" --url "https://example.com"
```

---

### `bookmark delete`

Delete a bookmark by ID.

**Usage:**
```bash
mozeidon bookmark delete <id>
```

**Arguments:**
- `<id>` - The bookmark ID (string)

**Examples:**
```bash
mozeidon bookmark delete abc123
```

---

## History

Manage browser history.

### `history`

Get browser history.

**Usage:**
```bash
mozeidon history [flags]
```

**Flags:**
- `-m, --max <number>` - Maximum number of history items to return
- `-c, --chunk <number>` - Divide results into chunks of given size
- `-t, --go-template <template>` - Go template to customize output

**Examples:**
```bash
# Get all history
mozeidon history

# Get last 50 items
mozeidon history --max 50

# Get history in chunks
mozeidon history --chunk 100

# Custom template
mozeidon history -t '{{range .Items}}{{.Title}} - {{.LastVisitTime}}{{"\n"}}{{end}}'
```

---

### `history delete`

Delete browser history.

**Usage:**
```bash
mozeidon history delete [flags]
```

**Flags (one required):**
- `-u, --url <url>` - Delete history for a specific URL
- `-a, --all` - Delete all history

**Mutually Exclusive:**
- `--url` and `--all`

**Examples:**
```bash
# Delete history for a specific URL
mozeidon history delete --url "https://example.com"

# Delete all history
mozeidon history delete --all
```

---

## Groups

Manage tab groups.

### `groups get`

Get all tab groups.

**Usage:**
```bash
mozeidon groups get
```

**Examples:**
```bash
# Get all tab groups as JSON
mozeidon groups get
```

---

### `groups update`

Update a tab group's properties or position.

**Usage:**
```bash
mozeidon groups update --group-id <id> [flags]
```

**Required Flags:**
- `-g, --group-id <id>` - The group ID

**Optional Flags (at least one required):**
- `-t, --title <title>` - The group title
- `-c, --color <color>` - The group color
- `--collapsed` - Whether the group should be collapsed
- `-i, --index <number>` - The group's first tab index (must be ≥ 0)

**Allowed Colors:**
`grey`, `blue`, `red`, `yellow`, `green`, `pink`, `purple`, `cyan`, `orange`

**Mutually Exclusive:**
- `--index` and `--title`
- `--index` and `--color`
- `--index` and `--collapsed`

**Examples:**
```bash
# Update group title
mozeidon groups update --group-id 1757435983351019 --title "Work Tabs"

# Change group color
mozeidon groups update --group-id 1757435983351019 --color blue

# Collapse a group
mozeidon groups update --group-id 1757435983351019 --collapsed

# Move group to index 0
mozeidon groups update --group-id 1757435983351019 --index 0

# Update multiple properties (except index)
mozeidon groups update --group-id 1757435983351019 --title "Dev" --color green
```
---

## Profiles

Manage browser profiles.

Each profile is a set of information related to a browser-instance where the `mozeidon` web-browser extension is active and running.

The `ipcName` value is the name of the ipc-connection the CLI will use to communicate with the `mozeidon-native-app` ( linked to the browser-extension )

The `pid` value is the process id ( on your operating system ) of the `mozeidon-native-app` instance linked to the browser-extension.

Etc.

### `profiles get`

Get all profiles.

**Usage:**
```bash
mozeidon profiles get
```

**Examples:**
```bash
# Get all profiles as JSON
mozeidon profiles get

# JSON output
{
  "data": [
    {
      "ipcName": "mozeidon_native_app_57604_e9b50fac",
      "fileName": "57604_e9b50fac.json",
      "browserName": "Firefox",
      "browserEngine": "gecko",
      "browserVersion": "146.0.1",
      "profileId": "e9b50fac-c364-45c4-822f-4738fd540756",
      "profileName": "Firefox",
      "profileAlias": "firefox",
      "profileCommandAlias": "Firefox",
      "profileRank": 3,
      "instanceId": "fa7e54a8-8f84-46ff-bd7a-f14aa86a66df",
      "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:146.0) Gecko/20100101 Firefox/146.0",
      "pid": 57604,
      "registeredAt": "2026-01-23T21:13:31.668Z"
    },
    {
      "ipcName": "mozeidon_native_app_59284_94e12d30",
      "fileName": "59284_94e12d30.json",
      "browserName": "firefox",
      "browserEngine": "gecko",
      "browserVersion": "145.0.2",
      "profileId": "94e12d30-cba2-45fe-9e50-53b10bc68d9b",
      "profileName": "firefox",
      "profileAlias": "zen",
      "profileCommandAlias": "Zen",
      "profileRank": 1,
      "instanceId": "5fab1f7a-8296-46d3-89b7-87b20fe54c4a",
      "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:145.0) Gecko/20100101 Firefox/145.0",
      "pid": 59284,
      "registeredAt": "2026-01-23T21:14:05.015Z"
    },
    {
      "ipcName": "mozeidon_native_app_60998_4f88678a",
      "fileName": "60998_4f88678a.json",
      "browserName": "Google Chrome",
      "browserEngine": "chromium",
      "browserVersion": "142",
      "profileId": "4f88678a-eef9-4d9c-ad61-04c502126d7b",
      "profileName": "Google Chrome",
      "profileAlias": "chrome",
      "profileCommandAlias": "Google Chrome",
      "profileRank": 1,
      "instanceId": "6bfe8b6b-3196-4a13-ab09-e828543aa8a4",
      "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36",
      "pid": 60998,
      "registeredAt": "2026-01-23T21:15:01.014Z"
    }
  ]

```

```bash
# Get all profiles formatted with a go-template
mozeidon profiles get --go-template '{{range .Items}}{{.ProfileId}} with ipc {{.IpcName}} : {{.ProfileName}} {{"\n"}}{{end}}'

# text output :
e9b50fac-c364-45c4-822f-4738fd540756 with ipc mozeidon_native_app_57604_e9b50fac : firefox
94e12d30-cba2-45fe-9e50-53b10bc68d9b with ipc mozeidon_native_app_59284_94e12d30 : zen
4f88678a-eef9-4d9c-ad61-04c502126d7b with ipc mozeidon_native_app_60998_4f88678a : chrome

```
---

### `profiles update`

Update a tab group's properties or position.

**Usage:**
```bash
mozeidon profiles update [flags]
```

**Optional Flags (at least one required):**
- `-r, --rank <number>` - The profile's rank ( i.e higher priority over other profiles )
- `-a, --alias <string>` - The profile's alias ( useful when you need to customize the name of a given profile )
- `-c, --command-alias <string>` - The profile's command alias ( useful when you need to associate a value to be later used in a command )
- `--profile-id <string>` - The profile's id ( if missing, the current default profile will be updated )

**Examples:**

Let's first give an practical example :  
You have a script where your first get profiles,  
then for each profile you can get the ProfileCommandAlias value,
then you're able to dynamically switch to each browser window with e.g `open -a $ProfileCommandAlias`

```bash
# Update a profile's command-alias
mozeidon profiles update --profile-id 4f88678a-eef9-4d9c-ad61-04c502126d7b -c "Google Chrome"

# Update a profile's alias and rank
mozeidon profiles update --profile-id 4f88678a-eef9-4d9c-ad61-04c502126d7b -a "Firefox Dev Edition" -r 10
```

---

## Notes

### Go Templates

Many commands support Go templates for custom output formatting using the `-t` or `--go-template` flag.

**Example Template:**
```bash
mozeidon tabs get -t '{{range .Items}}Title: {{.Title}}
URL: {{.Url}}
---
{{end}}'

# text output

Title: Andrea Motis | Collection of Greatest Performances - YouTube
URL: https://www.youtube.com/watch?v=BVfonxKQo0s
---
Title: Jacky Terrasson | Live Studio Session - YouTube
URL: https://www.youtube.com/watch?v=7FKQI7yuQ8U&list=RD7FKQI7yuQ8U&start_radio=1
---
Title: Zines | Learn Temporal
URL: https://learn.temporal.io/zines/
---

```

### JSON Output

By default, most commands return JSON-formatted output for easy parsing and integration with other tools.

### Exit Codes

- `0` - Success
- `1` - Error

---

## Examples

### Common Workflows

Note: to keep it simple, we omit the `--profile-id` flag in all commands below.  
You need to add it if you need to target a specific profile.  
See [Profiles](#profiles).


**List all tabs and switch to a specific one:**
```bash
# Get tabs
mozeidon tabs get | jq

# Switch to a tab
mozeidon tabs switch 1:42
```

**Organize tabs into a group:**
```bash
# Create a group from a tab
mozeidon tabs init-group --id 100 --group-title "Research" --group-color blue

# Move another tab into the group (use group-id from previous command)
mozeidon tabs update --tab-id 101 --window-id 1 --group-id 1234567890
```

**Bookmark management:**
```bash
# Create a bookmark
mozeidon bookmark new --title "Example" --url "https://example.com" --folder-path "/Links/"

# Update it later
mozeidon bookmark update abc123 --title "Example Site"

# Delete it
mozeidon bookmark delete abc123
```

**Clean up history:**
```bash
# Delete specific URL from history
mozeidon history delete --url "https://example.com"

# Or delete everything
mozeidon history delete --all
```
