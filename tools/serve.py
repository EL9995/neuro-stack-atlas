"""Serve the site locally with caching turned off, so a normal refresh always loads the latest files.

Usage:  python3 tools/serve.py [port]      (default 8010; run from the project folder)
Plain `python3 -m http.server` lets Chrome keep old copies of the JS files, which can mix old and new
code after an edit and break pages.
"""
import http.server, os, sys

class NoCache(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header("Cache-Control", "no-store")
        super().end_headers()

if __name__ == "__main__":
    os.chdir(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 8010
    print(f"Serving on http://localhost:{port} (no cache)")
    http.server.ThreadingHTTPServer(("", port), NoCache).serve_forever()
