/* ============================================================
   3SON POS - Supabase Client
   ============================================================ */

const SUPABASE_URL = "https://dsryxvelpbuitjmnswxc.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRzcnl4dmVsYnVpdXJqbW5zd3hjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA2NDcwODAsImV4cCI6MjA5NjIyMzA4MH0.3P8p3oZZ1WBaulyD6Adq0uE4gVKsJr2OimXR784El9o";

// ============================================================
// Minimal Supabase Client (no dependency)
// ============================================================
class POSSupabase {
  constructor(url, key) {
    this.url = url.replace(/\/$/, "");
    this.key = key;
    this._authToken = null;
    this._user = null;
    this._refreshTimer = null;
  }

  get user() { return this._user; }
  get isLoggedIn() { return !!this._authToken; }

  setAuth(token, refreshToken, user) {
    this._authToken = token || null;
    this._user = user || null;
    console.log("[3SON] setAuth called, token present:", !!token, "refreshToken present:", !!refreshToken, "user present:", !!user);
    if (token) {
      const email = user?.email || (this._user?.email) || null;
      if (email) {
        try { localStorage.setItem("3son_last_email", email); }
        catch(e) { console.error("[3SON] Failed to save last_email:", e.message); }
      }
      try {
        const data = JSON.stringify({
          token, refreshToken, user: this._user, ts: Date.now()
        });
        console.log("[3SON] Saving session:", data.substring(0, 80));
        localStorage.setItem("3son_auth", data);
        console.log("[3SON] Session saved, verify read:", !!localStorage.getItem("3son_auth"));
      } catch(e) {
        console.error("[3SON] Failed to save session:", e.message);
      }
      this._startRefreshTimer(refreshToken);
    }
  }

  clearAuth() {
    this._authToken = null;
    this._user = null;
    if (this._refreshTimer) { clearInterval(this._refreshTimer); this._refreshTimer = null; }
    localStorage.removeItem("3son_auth");
  }

  _headers() {
    const token = this._authToken || this.key;
    return {
      "Content-Type": "application/json",
      "apikey": this.key,
      "Authorization": `Bearer ${token}`
    };
  }

  _startRefreshTimer(refreshToken) {
    if (this._refreshTimer) clearInterval(this._refreshTimer);
    if (!refreshToken) return;
    let currentRefreshToken = refreshToken;
    this._refreshTimer = setInterval(async () => {
      try {
        const result = await this._refreshToken(currentRefreshToken);
        currentRefreshToken = result.refresh_token;
        this.setAuth(result.access_token, result.refresh_token, this._user || result.user);
      } catch (e) {
        console.warn("[3SON] Background token refresh failed:", e.message);
      }
    }, 30 * 60 * 1000);
  }

  // ---- AUTH METHODS ----
  async signIn(email, password) {
    const res = await fetch(`${this.url}/auth/v1/token?grant_type=password`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "apikey": this.key },
      body: JSON.stringify({ email, password })
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error_description || err.msg || "Login gagal");
    }
    const data = await res.json();
    this.setAuth(data.access_token, data.refresh_token, data.user);
    return data.user;
  }

  async signUp(email, password, displayName) {
    const res = await fetch(`${this.url}/auth/v1/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "apikey": this.key },
      body: JSON.stringify({
        email, password,
        data: { display_name: displayName || email.split("@")[0] }
      })
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.msg || "Registrasi gagal");
    }
    const data = await res.json();
    if (data.access_token) {
      this.setAuth(data.access_token, data.refresh_token, data.user);
    }
    return data;
  }

  async signOut() {
    try {
      await fetch(`${this.url}/auth/v1/logout`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "apikey": this.key, "Authorization": `Bearer ${this._authToken}` }
      });
    } catch (e) {}
    this.clearAuth();
  }

  async _refreshToken(refreshToken) {
    const res = await fetch(`${this.url}/auth/v1/token?grant_type=refresh_token`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "apikey": this.key },
      body: JSON.stringify({ refresh_token: refreshToken })
    });
    if (!res.ok) throw new Error("Refresh token gagal");
    return res.json();
  }

  async restoreSession() {
    try {
      const raw = localStorage.getItem("3son_auth");
      if (!raw) { console.log("[3SON] No stored session"); return false; }

      const saved = JSON.parse(raw);

      if (!saved.token) { console.warn("[3SON] Stored session has no token"); this.clearAuth(); return false; }

      console.log("[3SON] Restoring session, token age:", ((Date.now() - saved.ts) / 1000).toFixed(0) + "s");

      this._authToken = saved.token;
      this._user = saved.user;

      if (saved.refreshToken) {
        this._startRefreshTimer(saved.refreshToken);
      }

      this._bgValidate(saved);

      return true;
    } catch (e) {
      console.error("[3SON] Session restore crashed:", e.message);
      this.clearAuth();
      return false;
    }
  }

  async _bgValidate(saved) {
    try {
      const res = await fetch(`${this.url}/rest/v1/pos_produk?select=id&limit=1`, {
        headers: { "apikey": this.key, "Authorization": `Bearer ${saved.token}` }
      });
      if (res.ok) {
        console.log("[3SON] BG validate: token valid");
        if (saved.refreshToken) {
          const result = await this._refreshToken(saved.refreshToken);
          this.setAuth(result.access_token, result.refresh_token, result.user || this._user);
        } else {
          this.setAuth(saved.token, null, saved.user);
        }
        return;
      }
    } catch (e) {
      console.warn("[3SON] BG validate: token check failed, trying refresh:", e.message);
    }

    if (saved.refreshToken) {
      try {
        const result = await this._refreshToken(saved.refreshToken);
        this.setAuth(result.access_token, result.refresh_token, result.user || this._user);
        console.log("[3SON] BG validate: refresh OK");
        return;
      } catch (e) {
        console.error("[3SON] BG validate: refresh failed:", e.message);
      }
    }

    console.error("[3SON] BG validate: session dead, forcing logout");
    this.clearAuth();
    location.reload();
  }

  async _request(path, options = {}) {
    const url = `${this.url}/rest/v1/${path}`;
    const res = await fetch(url, {
      method: options.method || "GET",
      headers: {
        ...this._headers(),
        ...(options.headers || {})
      },
      body: options.body || undefined,
      signal: options.signal
    });
    if (!res.ok) {
      const err = await res.text();
      throw new Error(`Supabase error ${res.status}: ${err}`);
    }
    const text = await res.text();
    return text ? JSON.parse(text) : null;
  }

  // SELECT
  async select(table, query = "") {
    return this._request(`${table}?${query}`);
  }

  // INSERT
  async insert(table, data) {
    return this._request(table, {
      method: "POST",
      body: JSON.stringify(data),
      headers: { "Prefer": "return=representation" }
    });
  }

  // UPDATE
  async update(table, query, data) {
    return this._request(`${table}?${query}`, {
      method: "PATCH",
      body: JSON.stringify(data),
      headers: { "Prefer": "return=representation" }
    });
  }

  // UPSERT
  async upsert(table, data) {
    return this._request(table, {
      method: "POST",
      body: JSON.stringify(data),
      headers: {
        "Prefer": "resolution=merge-duplicates,return=representation"
      }
    });
  }

  // DELETE
  async delete(table, query) {
    return this._request(`${table}?${query}`, {
      method: "DELETE",
      headers: { "Prefer": "return=representation" }
    });
  }

  // Storage upload (base64 image)
  async uploadImage(base64data, fileName) {
    const match = base64data.match(/^data:(image\/\w+);base64,(.+)$/);
    if (!match) throw new Error("Invalid base64 image");
    const mime = match[1];
    const bytes = atob(match[2]);
    const arrayBuffer = new Uint8Array(bytes.length);
    for (let i = 0; i < bytes.length; i++) {
      arrayBuffer[i] = bytes.charCodeAt(i);
    }
    const ext = mime.split("/")[1] || "png";
    const path = `products/${fileName}.${ext}`;

    const url = `${this.url}/storage/v1/object/product-images/${path}`;
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "apikey": this.key,
        "Authorization": `Bearer ${this.key}`,
        "Content-Type": mime,
        "x-upsert": "true"
      },
      body: arrayBuffer
    });
    if (!res.ok) {
      const err = await res.text();
      console.error("Upload error:", res.status, err);
      return null;
    }

    return `${this.url}/storage/v1/object/public/product-images/${path}`;
  }
}

const db = new POSSupabase(SUPABASE_URL, SUPABASE_ANON_KEY);
