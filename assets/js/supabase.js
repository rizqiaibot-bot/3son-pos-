/* ============================================================
   3SON POS - Supabase Client
   ============================================================ */

const SUPABASE_URL = "https://dsryxvelpbuitjmnswxc.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_oc4vBssr6xcYb32msMjPKQ_qgCgpEM4";

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
    if (token) {
      const email = user?.email || (this._user?.email) || null;
      if (email) {
        try { localStorage.setItem("3son_last_email", email); } catch(e) {}
      }
      try {
        localStorage.setItem("3son_auth", JSON.stringify({
          token, refreshToken, user: this._user, ts: Date.now()
        }));
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
    const h = {
      "Content-Type": "application/json",
      "apikey": this.key
    };
    if (this._authToken) {
      h["Authorization"] = `Bearer ${this._authToken}`;
    }
    return h;
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
      if (!raw) return false;

      const saved = JSON.parse(raw);

      if (!saved.token) { this.clearAuth(); return false; }

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
        if (saved.refreshToken) {
          const result = await this._refreshToken(saved.refreshToken);
          this.setAuth(result.access_token, result.refresh_token, result.user || this._user);
        } else {
          this.setAuth(saved.token, null, saved.user);
        }
        return;
      }
    } catch (e) {
      console.warn("[3SON] BG validate: token check failed, trying refresh");
    }

    if (saved.refreshToken) {
      try {
        const result = await this._refreshToken(saved.refreshToken);
        this.setAuth(result.access_token, result.refresh_token, result.user || this._user);
        return;
      } catch (e) {
        console.error("[3SON] BG validate: refresh failed");
      }
    }

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
