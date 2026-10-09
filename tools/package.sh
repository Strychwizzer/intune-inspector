#!/bin/sh
# Baut Intune Inspector für alle Plattformen und packt je Plattform ein ZIP nach ./dist
# Aufruf: tools/package.sh [VERSION]   (Standard: Version aus main.go)
set -e
cd "$(dirname "$0")/.."
VERSION="${1:-$(sed -n 's/^const appVersion = "\(.*\)"/\1/p' main.go)}"
rm -rf dist && mkdir -p dist/stage
build() { # GOOS GOARCH Ausgabedatei ZIP-Suffix
  out="dist/stage/$4"
  mkdir -p "$out"
  GOOS=$1 GOARCH=$2 CGO_ENABLED=0 go build -trimpath -ldflags "-s -w" -o "$out/$3" .
  cp LIESMICH.md LICENSE THIRD_PARTY_NOTICES.md config.json.beispiel "$out/"
  (cd "$out" && zip -q -9 -r "../../IntuneInspector-$VERSION-$4.zip" .)
}
build windows amd64 IntuneInspector.exe windows-x64
build windows arm64 IntuneInspector.exe windows-arm64
build darwin  arm64 IntuneInspector     macos-apple-silicon
build darwin  amd64 IntuneInspector     macos-intel
build linux   amd64 IntuneInspector     linux-x64
rm -rf dist/stage
(cd dist && sha256sum *.zip > SHA256SUMS.txt)
ls -la dist
