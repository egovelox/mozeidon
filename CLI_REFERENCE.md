# Mozeidon CLI Reference

Mozeidon is a CLI tool to control browsers from the Firefox or Chromium families (including Firefox, Chrome, Edge, Brave, Zen, and others). It allows you to interact with tabs, bookmarks, history, and tab groups through the command line.

## Table of Contents

- [Commands](#commands)
  - [Tabs](#tabs)
  - [Bookmarks](#bookmarks)
  - [Bookmark (CRUD)](#bookmark-crud)
  - [History](#history)
  - [Groups](#groups)

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

---

## Tabs

Manage browser tabs.

### `tabs get`

Get all opened tabs.

**Usage:**
```bash
mozeidon tabs get [flags]
```

**Flags:**
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

## Bookmark (CRUD)

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

Manage tab groups (Chrome/Chromium only).

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

## Notes

### Go Templates

Many commands support Go templates for custom output formatting using the `-t` or `--go-template` flag.

**Example Template:**
```bash
mozeidon tabs get -t '{{range .Items}}Title: {{.Title}}
URL: {{.Url}}
---
{{end}}'
```

### JSON Output

By default, most commands return JSON-formatted output for easy parsing and integration with other tools.

### Exit Codes

- `0` - Success
- `1` - Error

---

## Examples

### Common Workflows

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
