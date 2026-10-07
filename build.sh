#!/bin/sh
# Baut Intune Inspector für alle Plattformen nach ./dist
set -e
mkdir -p dist
GOOS=windows GOARCH=amd64 go build -trimpath -ldflags "-s -w" -o dist/IntuneInspector.exe .
GOOS=windows GOARCH=arm64 go build -trimpath -ldflags "-s -w" -o dist/IntuneInspector-Windows-ARM64.exe .
GOOS=darwin  GOARCH=arm64 go build -trimpath -ldflags "-s -w" -o dist/IntuneInspector-macOS-AppleSilicon .
GOOS=darwin  GOARCH=amd64 go build -trimpath -ldflags "-s -w" -o dist/IntuneInspector-macOS-Intel .
GOOS=linux   GOARCH=amd64 go build -trimpath -ldflags "-s -w" -o dist/IntuneInspector-Linux .
echo "Fertig: dist/"
