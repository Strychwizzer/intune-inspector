// Intune Inspector – lokaler Starter.
//
// Startet einen Webserver, der nur auf diesem Rechner (localhost) erreichbar ist,
// liefert die eingebettete Web-App aus und öffnet den Standardbrowser.
// Konfiguration, Snapshots und Notizen liegen im Ordner "IntuneInspector-Daten"
// neben der Programmdatei. Es werden keine Daten an Dritte gesendet; die App spricht
// ausschließlich direkt aus dem Browser mit Microsoft Entra ID und Microsoft Graph.
package main

import (
	"embed"
	"encoding/json"
	"errors"
	"flag"
	"fmt"
	"io"
	"io/fs"
	"log"
	"net"
	"net/http"
	"os"
	"os/exec"
	"os/signal"
	"path/filepath"
	"regexp"
	"runtime"
	"sort"
	"strings"
	"sync"
	"time"
)

//go:embed web
var webFS embed.FS

const appVersion = "1.1.0"

type Config struct {
	ClientID      string `json:"clientId"`
	DefaultTenant string `json:"defaultTenant"`
	Port          int    `json:"port"`
}

var (
	dataDir  string
	cfgPath  string
	cfgMu    sync.Mutex
	port     int
	safeName = regexp.MustCompile(`^[A-Za-z0-9._-]{1,160}$`)
)

func main() {
	portFlag := flag.Int("port", 0, "Port (Standard 8400 bzw. Wert aus config.json)")
	noBrowser := flag.Bool("no-browser", false, "Browser nicht automatisch öffnen")
	dataFlag := flag.String("data", "", "Datenordner (Standard: IntuneInspector-Daten neben der Programmdatei)")
	flag.Parse()

	exe, err := os.Executable()
	if err != nil {
		exe = "."
	}
	baseDir := filepath.Dir(exe)
	dataDir = filepath.Join(baseDir, "IntuneInspector-Daten")
	if *dataFlag != "" {
		dataDir = *dataFlag
	}
	for _, d := range []string{dataDir, filepath.Join(dataDir, "snapshots"), filepath.Join(dataDir, "notes")} {
		if err := os.MkdirAll(d, 0o700); err != nil {
			fatal("Datenordner kann nicht angelegt werden: %v", err)
		}
	}
	cfgPath = filepath.Join(dataDir, "config.json")
	// Eine config.json direkt neben der Programmdatei wird beim ersten Start übernommen
	// (praktisch, um das Paket mit fertiger Client-ID an Kollegen zu verteilen).
	if _, err := os.Stat(cfgPath); errors.Is(err, os.ErrNotExist) {
		if b, err := os.ReadFile(filepath.Join(baseDir, "config.json")); err == nil {
			_ = os.WriteFile(cfgPath, b, 0o600)
		}
	}

	cfg := loadConfig()
	port = 8400
	if cfg.Port > 0 {
		port = cfg.Port
	}
	if *portFlag > 0 {
		port = *portFlag
	}

	sub, _ := fs.Sub(webFS, "web")
	mux := http.NewServeMux()
	mux.Handle("/", noCache(http.FileServer(http.FS(sub))))
	mux.HandleFunc("/api/info", handleInfo)
	mux.HandleFunc("/api/config", handleConfig)
	mux.HandleFunc("/api/snapshots", handleSnapshots)
	mux.HandleFunc("/api/snapshots/", handleSnapshot)
	mux.HandleFunc("/api/notes/", handleNotes)

	ln, err := net.Listen("tcp", fmt.Sprintf("127.0.0.1:%d", port))
	if err != nil {
		fatal("Port %d ist bereits belegt. Läuft Intune Inspector schon?\nSonst mit anderem Port starten, z. B.:  IntuneInspector.exe -port 8401\n(Dann muss http://localhost:8401/redirect.html auch als Umleitungs-URI in der App-Registrierung stehen.)", port)
	}
	url := fmt.Sprintf("http://localhost:%d/", port)

	fmt.Println("==============================================")
	fmt.Println("  Intune Inspector " + appVersion)
	fmt.Println("==============================================")
	fmt.Println("  Läuft unter:   " + url)
	fmt.Println("  Daten:         " + dataDir)
	fmt.Println()
	fmt.Println("  Dieses Fenster offen lassen, solange die App genutzt wird.")
	fmt.Println("  Beenden: Fenster schließen oder Strg+C.")
	fmt.Println("==============================================")

	srv := &http.Server{Handler: guard(mux), ReadHeaderTimeout: 10 * time.Second}
	go func() {
		if err := srv.Serve(ln); err != nil && !errors.Is(err, http.ErrServerClosed) {
			log.Fatal(err)
		}
	}()
	if !*noBrowser {
		openBrowser(url)
	}
	stop := make(chan os.Signal, 1)
	signal.Notify(stop, os.Interrupt)
	<-stop
	_ = srv.Close()
}

func fatal(format string, a ...any) {
	fmt.Printf("\nFEHLER: "+format+"\n\n", a...)
	if runtime.GOOS == "windows" {
		fmt.Println("Taste Enter zum Schließen …")
		_, _ = fmt.Scanln()
	}
	os.Exit(1)
}

func openBrowser(url string) {
	var cmd *exec.Cmd
	switch runtime.GOOS {
	case "windows":
		cmd = exec.Command("rundll32", "url.dll,FileProtocolHandler", url)
	case "darwin":
		cmd = exec.Command("open", url)
	default:
		cmd = exec.Command("xdg-open", url)
	}
	_ = cmd.Start()
}

// guard: nur localhost-Hosts (Schutz gegen DNS-Rebinding), schreibende API-Aufrufe nur
// von der eigenen Oberfläche (Origin-Prüfung) und strikte Sicherheits-Header.
func guard(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		host := r.Host
		if h, _, err := net.SplitHostPort(host); err == nil {
			host = h
		}
		if host != "localhost" && host != "127.0.0.1" {
			http.Error(w, "forbidden host", http.StatusForbidden)
			return
		}
		if strings.HasPrefix(r.URL.Path, "/api/") && r.Method != http.MethodGet {
			origin := r.Header.Get("Origin")
			if origin != fmt.Sprintf("http://localhost:%d", port) && origin != fmt.Sprintf("http://127.0.0.1:%d", port) {
				http.Error(w, "forbidden origin", http.StatusForbidden)
				return
			}
		}
		w.Header().Set("X-Content-Type-Options", "nosniff")
		w.Header().Set("Referrer-Policy", "no-referrer")
		w.Header().Set("X-Frame-Options", "SAMEORIGIN")
		w.Header().Set("Content-Security-Policy",
			"default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; "+
				"connect-src 'self' https://login.microsoftonline.com https://graph.microsoft.com; "+
				"frame-src 'self' blob: https://login.microsoftonline.com; font-src 'self' data:; base-uri 'self'; form-action 'self'")
		next.ServeHTTP(w, r)
	})
}

func noCache(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Cache-Control", "no-store")
		next.ServeHTTP(w, r)
	})
}

func loadConfig() Config {
	cfgMu.Lock()
	defer cfgMu.Unlock()
	var c Config
	if b, err := os.ReadFile(cfgPath); err == nil {
		_ = json.Unmarshal(b, &c)
	}
	return c
}

func writeJSON(w http.ResponseWriter, v any) {
	w.Header().Set("Content-Type", "application/json; charset=utf-8")
	_ = json.NewEncoder(w).Encode(v)
}

func handleInfo(w http.ResponseWriter, r *http.Request) {
	writeJSON(w, map[string]any{
		"version":     appVersion,
		"port":        port,
		"dataDir":     dataDir,
		"redirectUri": fmt.Sprintf("http://localhost:%d/redirect.html", port),
	})
}

func handleConfig(w http.ResponseWriter, r *http.Request) {
	switch r.Method {
	case http.MethodGet:
		writeJSON(w, loadConfig())
	case http.MethodPost:
		var c Config
		if err := json.NewDecoder(io.LimitReader(r.Body, 64<<10)).Decode(&c); err != nil {
			http.Error(w, "bad json", 400)
			return
		}
		c.ClientID = strings.TrimSpace(c.ClientID)
		c.DefaultTenant = strings.TrimSpace(c.DefaultTenant)
		if c.Port == 0 {
			c.Port = loadConfig().Port
		}
		b, _ := json.MarshalIndent(c, "", "  ")
		cfgMu.Lock()
		err := os.WriteFile(cfgPath, b, 0o600)
		cfgMu.Unlock()
		if err != nil {
			http.Error(w, err.Error(), 500)
			return
		}
		writeJSON(w, c)
	default:
		http.Error(w, "method", 405)
	}
}

type snapMeta struct {
	Name      string `json:"name"`
	Size      int64  `json:"size"`
	Tenant    string `json:"tenant"`
	TenantID  string `json:"tenantId"`
	ScannedAt string `json:"scannedAt"`
	Count     int    `json:"count"`
}

func handleSnapshots(w http.ResponseWriter, r *http.Request) {
	dir := filepath.Join(dataDir, "snapshots")
	switch r.Method {
	case http.MethodGet:
		entries, _ := os.ReadDir(dir)
		list := []snapMeta{}
		for _, e := range entries {
			if e.IsDir() || !strings.HasSuffix(e.Name(), ".json") {
				continue
			}
			info, err := e.Info()
			if err != nil {
				continue
			}
			m := snapMeta{Name: e.Name(), Size: info.Size(), ScannedAt: info.ModTime().Format(time.RFC3339)}
			if b, err := os.ReadFile(filepath.Join(dir, e.Name())); err == nil {
				var head struct {
					Tenant struct {
						ID          string `json:"id"`
						DisplayName string `json:"displayName"`
						Domain      string `json:"domain"`
					} `json:"tenant"`
					ScannedAt string            `json:"scannedAt"`
					Objects   []json.RawMessage `json:"objects"`
				}
				if json.Unmarshal(b, &head) == nil {
					m.Tenant = head.Tenant.DisplayName
					if m.Tenant == "" {
						m.Tenant = head.Tenant.Domain
					}
					m.TenantID = head.Tenant.ID
					if head.ScannedAt != "" {
						m.ScannedAt = head.ScannedAt
					}
					m.Count = len(head.Objects)
				}
			}
			list = append(list, m)
		}
		sort.Slice(list, func(i, j int) bool { return list[i].ScannedAt > list[j].ScannedAt })
		writeJSON(w, list)
	case http.MethodPost:
		name := r.URL.Query().Get("name")
		if !safeName.MatchString(name) || !strings.HasSuffix(name, ".json") {
			http.Error(w, "bad name", 400)
			return
		}
		b, err := io.ReadAll(io.LimitReader(r.Body, 300<<20))
		if err != nil || !json.Valid(b) {
			http.Error(w, "bad json", 400)
			return
		}
		if err := os.WriteFile(filepath.Join(dir, name), b, 0o600); err != nil {
			http.Error(w, err.Error(), 500)
			return
		}
		writeJSON(w, map[string]string{"saved": name})
	default:
		http.Error(w, "method", 405)
	}
}

func handleSnapshot(w http.ResponseWriter, r *http.Request) {
	name := strings.TrimPrefix(r.URL.Path, "/api/snapshots/")
	if !safeName.MatchString(name) || !strings.HasSuffix(name, ".json") {
		http.Error(w, "bad name", 400)
		return
	}
	p := filepath.Join(dataDir, "snapshots", name)
	switch r.Method {
	case http.MethodGet:
		b, err := os.ReadFile(p)
		if err != nil {
			http.Error(w, "not found", 404)
			return
		}
		w.Header().Set("Content-Type", "application/json; charset=utf-8")
		_, _ = w.Write(b)
	case http.MethodDelete:
		// Nicht endgültig löschen: in den Unterordner "_entfernt" verschieben.
		trash := filepath.Join(dataDir, "snapshots", "_entfernt")
		_ = os.MkdirAll(trash, 0o700)
		if err := os.Rename(p, filepath.Join(trash, name)); err != nil {
			http.Error(w, err.Error(), 500)
			return
		}
		writeJSON(w, map[string]string{"moved": name})
	default:
		http.Error(w, "method", 405)
	}
}

func handleNotes(w http.ResponseWriter, r *http.Request) {
	tenant := strings.TrimPrefix(r.URL.Path, "/api/notes/")
	if !safeName.MatchString(tenant) {
		http.Error(w, "bad tenant", 400)
		return
	}
	p := filepath.Join(dataDir, "notes", tenant+".json")
	switch r.Method {
	case http.MethodGet:
		b, err := os.ReadFile(p)
		if err != nil {
			writeJSON(w, map[string]string{})
			return
		}
		w.Header().Set("Content-Type", "application/json; charset=utf-8")
		_, _ = w.Write(b)
	case http.MethodPost:
		b, err := io.ReadAll(io.LimitReader(r.Body, 20<<20))
		if err != nil || !json.Valid(b) {
			http.Error(w, "bad json", 400)
			return
		}
		if err := os.WriteFile(p, b, 0o600); err != nil {
			http.Error(w, err.Error(), 500)
			return
		}
		writeJSON(w, map[string]bool{"ok": true})
	default:
		http.Error(w, "method", 405)
	}
}
