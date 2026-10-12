"""Serve the portfolio with the same page routes used in deployment."""

from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import urlsplit


class PortfolioHandler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(Path(__file__).parent), **kwargs)

    def do_GET(self):
        self.rewrite_page_route()
        super().do_GET()

    def do_HEAD(self):
        self.rewrite_page_route()
        super().do_HEAD()

    def rewrite_page_route(self):
        url = urlsplit(self.path)
        routes = {"/admin": "/admin.html", "/dashboard": "/dashboard.html"}
        target = routes.get(url.path.rstrip("/"))
        if target:
            self.path = target + ("?" + url.query if url.query else "")


if __name__ == "__main__":
    print("Portfolio running at http://localhost:8000/", flush=True)
    ThreadingHTTPServer(("127.0.0.1", 8000), PortfolioHandler).serve_forever()
