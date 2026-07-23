/* ============================================================
   3SON POS - Application Core (ES6)
   Point of Sale Frozen Food Bekasi
   ============================================================ */

// =====================================================
// UTILITY
// =====================================================
const formatRupiah = (amount) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
};

const formatNumber = (amount) => {
  if (!amount && amount !== 0) return "";
  return new Intl.NumberFormat("id-ID").format(amount);
};

// =====================================================
// MANAGER: ProductManager
// =====================================================
class ProductManager {
  constructor() {
    this.produk = [];
    this.kategori = [];
    this.invoiceSlots = [];
    this.activeCategory = "favorit";
    this._overrides = {};
  }

  async load() {
    try {
      const res = await fetch("data/produk.json");
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      this.produk = data.produk;
      this.kategori = data.kategori;
      this.invoiceSlots = data.invoiceSlots || [];
    } catch (err) {
      console.warn("Fetch JSON gagal, gunakan data embed:", err.message);
      this._loadFallback();
    }
    this._loadOverrides();
    this._applyOverrides();
  }

  _loadOverrides() {
    try {
      const raw = localStorage.getItem("3son_product_overrides");
      this._overrides = raw ? JSON.parse(raw) : {};
    } catch (e) {
      this._overrides = {};
    }
  }

  _saveOverrides() {
    localStorage.setItem("3son_product_overrides", JSON.stringify(this._overrides));
  }

  _applyOverrides() {
    Object.keys(this._overrides).forEach(id => {
      const prod = this.produk.find(p => p.id === id);
      if (prod) Object.assign(prod, this._overrides[id]);
    });
  }

  saveProduct(id, data) {
    this._overrides[id] = { ...this._overrides[id], ...data };
    this._saveOverrides();
    const prod = this.produk.find(p => p.id === id);
    if (prod) Object.assign(prod, data);
  }

  async resetOverrides() {
    this._overrides = {};
    localStorage.removeItem("3son_product_overrides");
    await this.load();
    return this;
  }

  getOverrides() {
    return { ...this._overrides };
  }

  _loadFallback() {
    this.kategori = [
      { id: "favorit", nama: "Favorit" },
      { id: "bakso", nama: "Bakso" },
      { id: "olahan-ikan", nama: "Olahan Ikan" },
      { id: "dimsum", nama: "Dimsum" },
      { id: "pempek", nama: "Pempek" },
      { id: "sosis", nama: "Sosis" },
      { id: "kentang", nama: "Kentang" },
      { id: "nugget", nama: "Nugget" },
      { id: "lainnya", nama: "Lainnya" }
    ];
    this.produk = [
      { id:"p001",nama:"Bakso Tuna Besar Isi 50",harga:0,stok:0,kategori:"bakso",favorit:false,gambar:"assets/img/default-product.svg" },
      { id:"p002",nama:"Bakso Super",harga:0,stok:0,kategori:"bakso",favorit:true,gambar:"assets/img/default-product.svg" },
      { id:"p003",nama:"Otak-Otak Panjang",harga:0,stok:0,kategori:"olahan-ikan",favorit:true,gambar:"assets/img/default-product.svg" },
      { id:"p004",nama:"Otak-Otak Bulat",harga:0,stok:0,kategori:"olahan-ikan",favorit:false,gambar:"assets/img/default-product.svg" },
      { id:"p005",nama:"Bakwan Ikan",harga:0,stok:0,kategori:"olahan-ikan",favorit:false,gambar:"assets/img/default-product.svg" },
      { id:"p006",nama:"Fish Stick",harga:0,stok:0,kategori:"olahan-ikan",favorit:false,gambar:"assets/img/default-product.svg" },
      { id:"p007",nama:"Fish Roll",harga:0,stok:0,kategori:"olahan-ikan",favorit:true,gambar:"assets/img/default-product.svg" },
      { id:"p008",nama:"Kaki Naga",harga:0,stok:0,kategori:"olahan-ikan",favorit:true,gambar:"assets/img/default-product.svg" },
      { id:"p009",nama:"Ekado",harga:0,stok:0,kategori:"dimsum",favorit:false,gambar:"assets/img/default-product.svg" },
      { id:"p010",nama:"Siomay",harga:0,stok:0,kategori:"dimsum",favorit:true,gambar:"assets/img/default-product.svg" },
      { id:"p011",nama:"Siomay Mini",harga:0,stok:0,kategori:"dimsum",favorit:false,gambar:"assets/img/default-product.svg" },
      { id:"p012",nama:"Lumpia Ikan",harga:0,stok:0,kategori:"dimsum",favorit:false,gambar:"assets/img/default-product.svg" },
      { id:"p013",nama:"Keong Mas",harga:0,stok:0,kategori:"dimsum",favorit:false,gambar:"assets/img/default-product.svg" },
      { id:"p014",nama:"Tahu Bakso",harga:0,stok:0,kategori:"dimsum",favorit:false,gambar:"assets/img/default-product.svg" },
      { id:"p015",nama:"Siomay Ayam",harga:0,stok:0,kategori:"dimsum",favorit:false,gambar:"assets/img/default-product.svg" },
      { id:"p016",nama:"Kekian",harga:0,stok:0,kategori:"olahan-ikan",favorit:true,gambar:"assets/img/default-product.svg" },
      { id:"p017",nama:"Nugget Ikan",harga:0,stok:0,kategori:"nugget",favorit:false,gambar:"assets/img/default-product.svg" },
      { id:"p018",nama:"Pempek Selam Kecil",harga:0,stok:0,kategori:"pempek",favorit:false,gambar:"assets/img/default-product.svg" },
      { id:"p019",nama:"Pempek Lenjer",harga:0,stok:0,kategori:"pempek",favorit:false,gambar:"assets/img/default-product.svg" },
      { id:"p020",nama:"Sosis",harga:0,stok:0,kategori:"sosis",favorit:false,gambar:"assets/img/default-product.svg" },
      { id:"p021",nama:"Kentang",harga:0,stok:0,kategori:"kentang",favorit:false,gambar:"assets/img/default-product.svg" },
      { id:"p022",nama:"Nugget Ayam",harga:0,stok:0,kategori:"nugget",favorit:false,gambar:"assets/img/default-product.svg" },
      { id:"p023",nama:"Kebab",harga:0,stok:0,kategori:"lainnya",favorit:false,gambar:"assets/img/default-product.svg" },
      { id:"p024",nama:"Dimsum Ayam",harga:0,stok:0,kategori:"dimsum",favorit:false,gambar:"assets/img/default-product.svg" },
      { id:"p025",nama:"Dimsum Udang",harga:0,stok:0,kategori:"dimsum",favorit:false,gambar:"assets/img/default-product.svg" },
      { id:"p026",nama:"Dimsum Besar",harga:0,stok:0,kategori:"dimsum",favorit:false,gambar:"assets/img/default-product.svg" },
      { id:"p027",nama:"Gyoza",harga:0,stok:0,kategori:"dimsum",favorit:false,gambar:"assets/img/default-product.svg" },
      { id:"p028",nama:"Eggroll",harga:0,stok:0,kategori:"dimsum",favorit:false,gambar:"assets/img/default-product.svg" },
      { id:"p029",nama:"Bakpao",harga:0,stok:0,kategori:"dimsum",favorit:false,gambar:"assets/img/default-product.svg" },
      { id:"p030",nama:"Steam Goat",harga:0,stok:0,kategori:"lainnya",favorit:false,gambar:"assets/img/default-product.svg" }
    ];
    this.invoiceSlots = [
      { no:1, productId:"p001", nama:"Bakso Tuna Besar Isi 50" },
      { no:2, productId:"p002", nama:"Bakso Super" },
      { no:3, productId:"p003", nama:"Otak-Otak Panjang" },
      { no:4, productId:"p004", nama:"Otak-Otak Bulat" },
      { no:5, productId:"p005", nama:"Bakwan Ikan" },
      { no:6, productId:"p006", nama:"Fish Stick" },
      { no:7, productId:"p007", nama:"Fish Roll" },
      { no:8, productId:"p008", nama:"Kaki Naga" },
      { no:9, productId:"p009", nama:"Ekado" },
      { no:10, productId:"p010", nama:"Siomay" },
      { no:11, productId:"p011", nama:"Siomay Mini" },
      { no:12, productId:"p012", nama:"Lumpia Ikan" },
      { no:13, productId:"p013", nama:"Keong Mas" },
      { no:14, productId:"p014", nama:"Tahu Bakso" },
      { no:15, productId:"p015", nama:"Siomay Ayam" },
      { no:16, productId:"p016", nama:"Kekian" },
      { no:17, productId:"p017", nama:"Nugget Ikan" },
      { no:18, productId:"p018", nama:"Pempek Selam Kecil" },
      { no:19, productId:"p019", nama:"Pempek Lenjer" },
      { no:20, productId:"p020", nama:"Sosis" },
      { no:21, productId:"p021", nama:"Kentang" },
      { no:22, productId:"p022", nama:"Nugget Ayam" },
      { no:23, productId:"p023", nama:"Kebab" },
      { no:24, productId:"p024", nama:"Dimsum Ayam" },
      { no:25, productId:"p025", nama:"Dimsum Udang" },
      { no:26, productId:"p026", nama:"Dimsum Besar" },
      { no:27, productId:"p027", nama:"Gyoza" },
      { no:28, productId:"p028", nama:"Eggroll" },
      { no:29, productId:"p029", nama:"Bakpao" },
      { no:30, productId:"p030", nama:"Steam Goat" },
      { no:31, productId:null, nama:"" },
      { no:32, productId:null, nama:"" },
      { no:33, productId:null, nama:"" },
      { no:34, productId:null, nama:"Ongkir" }
    ];
  }

  getByCategory(catId) {
    if (catId === "favorit") return this.produk.filter(p => p.favorit);
    return this.produk.filter(p => p.kategori === catId);
  }

  search(query, category) {
    const base = this.getByCategory(category);
    if (!query.trim()) return base;
    const q = query.toLowerCase();
    return base.filter(p => p.nama.toLowerCase().includes(q));
  }

  countByCategory(catId) {
    if (catId === "favorit") return this.produk.filter(p => p.favorit).length;
    return this.produk.filter(p => p.kategori === catId).length;
  }

  findById(id) {
    return this.produk.find(p => p.id === id);
  }
}


// =====================================================
// MANAGER: CartManager
// =====================================================
class CartManager {
  constructor() {
    this.items = [];
    this.diskon = 0;
    this.ongkir = 0;
  }

  addItem(produk) {
    const existing = this.items.find(i => i.id === produk.id);
    if (existing) { existing.qty += 1; }
    else { this.items.push({ id: produk.id, nama: produk.nama, harga: produk.harga, qty: 1 }); }
    return true;
  }

  removeItem(id) { this.items = this.items.filter(i => i.id !== id); }

  updateQty(id, delta) {
    const item = this.items.find(i => i.id === id);
    if (!item) return;
    item.qty += delta;
    if (item.qty <= 0) this.removeItem(id);
  }

  clear() { this.items = []; this.diskon = 0; this.ongkir = 0; }

  get subtotal() { return this.items.reduce((s, i) => s + (i.harga * i.qty), 0); }
  get grandTotal() { return Math.max(0, this.subtotal - this.diskon + this.ongkir); }
  get itemCount() { return this.items.reduce((s, i) => s + i.qty, 0); }
  get isEmpty() { return this.items.length === 0; }

  findById(id) { return this.items.find(i => i.id === id); }
}

// =====================================================
// MANAGER: PaymentManager
// =====================================================
class PaymentManager {
  constructor(cartManager) {
    this.cart = cartManager;
    this.method = "tunai";
    this.bayar = 0;
    this.printMode = "a5";
  }

  get kembalian() { return Math.max(0, this.bayar - this.cart.grandTotal); }
  isLunas() { return this.bayar >= this.cart.grandTotal && this.cart.grandTotal > 0; }
  reset() { this.method = "tunai"; this.bayar = 0; this.printMode = "a5"; }
}


// =====================================================
// MANAGER: PrintManager - Invoice + Thermal
// =====================================================
class PrintManager {
  constructor(productManager) {
    this.products = productManager;
    this.invoiceCounter = this._loadCounter();
  }

  _loadCounter() {
    const saved = localStorage.getItem("3son_invoice_counter");
    return saved ? parseInt(saved, 10) : 1;
  }

  _saveCounter() {
    localStorage.setItem("3son_invoice_counter", this.invoiceCounter.toString());
  }

  generateInvoice() {
    this.invoiceCounter++;
    this._saveCounter();
    const now = new Date();
    const pad = n => n.toString().padStart(2, "0");
    const dateStr = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}`;
    return {
      number: `INV-${dateStr}-${this.invoiceCounter.toString().padStart(4, "0")}`,
      date: `${pad(now.getDate())}/${pad(now.getMonth() + 1)}/${now.getFullYear()}`,
      time: `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`,
      tanggalPanjang: new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "long", year: "numeric" }).format(now)
    };
  }

  print(cart, payment, customer) {
    const container = document.getElementById("printContainer");
    if (!container) return;

    const inv = this.generateInvoice();
    const cashier = document.getElementById("cashierName")?.textContent || "Admin";
    const isThermal = payment.printMode === "thermal";

    if (isThermal) {
      container.innerHTML = this._buildThermalHTML(inv, cart, payment, cashier);
      container.className = "print-container thermal-mode";
    } else {
      container.innerHTML = this._buildInvoiceHTML(inv, cart, payment, cashier, customer);
      container.className = "print-container a5-mode";
    }

    setTimeout(() => window.print(), 200);
  }

  // ---- THERMAL 80mm ----
  _buildThermalHTML(inv, cart, payment, cashier) {
    const rows = cart.items.map(i => {
      return `<div class="t-row"><span>${this._esc(i.nama)}</span><span>${formatRupiah(i.harga * i.qty)}</span></div>
      <div class="t-detail">${i.qty} x ${formatRupiah(i.harga)}</div>`;
    }).join("");

    return `<div class="receipt-thermal">
  <div class="t-center t-logo">3SON</div>
  <div class="t-center t-name">3SON Frozen Food</div>
  <div class="t-center t-sm">Perum Harapan Mulya, Cluster Efodia</div>
  <div class="t-center t-sm">Jl. Efodia 6 Blok 33 HN No.21</div>
  <div class="t-center t-sm">0812-8073-0102</div>
  <div class="t-divider">================================</div>
  <div class="t-row"><span>${inv.number}</span><span>${inv.date}</span></div>
  <div class="t-row"><span>Cashier: ${cashier}</span><span>${inv.time}</span></div>
  <div class="t-divider">--------------------------------</div>
  ${rows}
  <div class="t-divider">--------------------------------</div>
  <div class="t-row t-bold"><span>TOTAL</span><span>${formatRupiah(cart.grandTotal)}</span></div>
  ${cart.diskon > 0 ? `<div class="t-row"><span>Diskon</span><span>-${formatRupiah(cart.diskon)}</span></div>` : ""}
  ${cart.ongkir > 0 ? `<div class="t-row"><span>Ongkir</span><span>${formatRupiah(cart.ongkir)}</span></div>` : ""}
  <div class="t-row"><span>${payment.method.toUpperCase()}</span><span>${formatRupiah(payment.bayar)}</span></div>
  <div class="t-row"><span>Kembali</span><span>${formatRupiah(payment.kembalian)}</span></div>
  <div class="t-divider">================================</div>
  <div class="t-center t-sm">Terima Kasih</div>
  <div class="t-center t-sm">Belanja lagi yaa!</div>
  <div class="t-spacer"></div>
</div>`;
  }

  _esc(str) { return str.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;"); }


  // ---- A5 INVOICE (Distributor Format) ----
  _buildInvoiceHTML(inv, cart, payment, cashier, customer) {
    const slots = this.products.invoiceSlots || [];
    const cartMap = {};
    cart.items.forEach(i => { cartMap[i.id] = i; });

    const tableRows = slots.map(slot => {
      const cartItem = cartMap[slot.productId];
      const qty = cartItem ? cartItem.qty : "";
      const price = cartItem ? formatNumber(cartItem.harga) : "";
      const subtotal = cartItem ? formatNumber(cartItem.harga * cartItem.qty) : "";

      if (slot.no === 34) {
        return `<tr>
          <td class="cell-no">34</td>
          <td class="cell-produk">Ongkir</td>
          <td class="cell-qty"></td>
          <td class="cell-harga">${cart.ongkir > 0 ? formatNumber(cart.ongkir) : ""}</td>
          <td class="cell-total">${cart.ongkir > 0 ? formatNumber(cart.ongkir) : ""}</td>
        </tr>`;
      }

      return `<tr>
        <td class="cell-no">${slot.no}</td>
        <td class="cell-produk">${slot.nama}</td>
        <td class="cell-qty">${qty}</td>
        <td class="cell-harga">${price}</td>
        <td class="cell-total">${subtotal}</td>
      </tr>`;
    }).join("");

    return `<div class="receipt-a5">

  <!-- COMPANY HEADER -->
  <table class="header-table">
    <tr>
      <td class="header-left" width="62%">
        <div class="hl-logo-row">
          <div class="hl-logo">
            <img src="logo.png" alt="3SON" style="width:62px;height:62px;"
                 onerror="this.style.display='none'">
          </div>
          <div class="hl-brand">
            <h2>3SON FROZEN FOOD</h2>
            <p class="hl-sub">Distributor Sakana Indo Prima</p>
            <p class="hl-company">CV 3Son Frozen Food Bekasi</p>
          </div>
        </div>
        <div class="hl-address">
          <p>Perum Harapan Mulya, Cluster Efodia</p>
          <p>Jl. Efodia 6 Blok 33 HN No.21</p>
          <p>Desa Setia Mulya, Kec. Tarumajaya</p>
          <p>0812-8073-0102  |  0812-8147-2474</p>
        </div>
      </td>
      <td class="header-right" width="38%">
        <table class="info-table">
          <tr><td class="info-label">Tanggal</td><td class="info-colon">:</td><td>${inv.date}</td></tr>
          <tr><td class="info-label">Customer</td><td class="info-colon">:</td><td>${customer || "____________________"}</td></tr>
          <tr><td class="info-label">Invoice</td><td class="info-colon">:</td><td class="inv-num">${inv.number}</td></tr>
        </table>
      </td>
    </tr>
  </table>

  <!-- PRODUCT TABLE -->
  <table class="product-table">
    <thead>
      <tr>
        <th class="col-no">No</th>
        <th class="col-produk">Produk</th>
        <th class="col-qty">Qty</th>
        <th class="col-harga">Harga</th>
        <th class="col-total">Total</th>
      </tr>
    </thead>
    <tbody>
      ${tableRows}
    </tbody>
  </table>

  <!-- TOTALS -->
  <table class="totals-table">
    <tr>
      <td class="tt-label">Subtotal</td>
      <td class="tt-colon">:</td>
      <td class="tt-value">${formatRupiah(cart.subtotal)}</td>
    </tr>
    <tr>
      <td class="tt-label">Diskon</td>
      <td class="tt-colon">:</td>
      <td class="tt-value">${formatRupiah(cart.diskon)}</td>
    </tr>
    <tr>
      <td class="tt-label">Ongkir</td>
      <td class="tt-colon">:</td>
      <td class="tt-value">${formatRupiah(cart.ongkir)}</td>
    </tr>
    <tr class="tt-grand">
      <td class="tt-label">Grand Total</td>
      <td class="tt-colon">:</td>
      <td class="tt-value">${formatRupiah(cart.grandTotal)}</td>
    </tr>
  </table>

  <!-- PAYMENT INFO -->
  <table class="payment-info-table">
    <tr>
      <td class="pi-label">Bayar</td>
      <td class="pi-colon">:</td>
      <td class="pi-value">${formatRupiah(payment.bayar)}</td>
      <td class="pi-spacer"></td>
      <td class="pi-label">Metode</td>
      <td class="pi-colon">:</td>
      <td class="pi-value">${payment.method.toUpperCase()}</td>
    </tr>
    <tr>
      <td class="pi-label">Kembali</td>
      <td class="pi-colon">:</td>
      <td class="pi-value">${formatRupiah(payment.kembalian)}</td>
    </tr>
  </table>

  <!-- FOOTER -->
  <div class="footer-section">
    <div class="footer-notes">
      <p class="fn-title">Catatan:</p>
      <p>Cek dianggap lunas setelah uang diterima.</p>
      <p>Transfer dianggap lunas setelah dana masuk rekening.</p>
    </div>

    <table class="footer-bottom">
      <tr>
        <td class="fb-bank" width="50%">
          <p class="fb-title">Pembayaran via:</p>
          <p><strong>BCA</strong></p>
          <p>a/n Three Son Frozen Food CV</p>
          <p>No. Rek: (rekening BCA)</p>
        </td>
        <td class="fb-sign" width="50%">
          <p class="fb-sign-text">Hormat Kami,</p>
          <p class="fb-sign-space"><br><br><br></p>
          <p class="fb-sign-line">____________________</p>
        </td>
      </tr>
    </table>
  </div>

  <div class="print-footer-line">
    ${inv.number} | ${inv.date} ${inv.time} | Kasir: ${cashier} | 3SON Frozen Food
  </div>
</div>`;
  }

  _getCashierName() {
    const el = document.getElementById("cashierName");
    return el ? el.textContent : "Admin";
  }
}

// =====================================================
// CONTROLLER: ProductAdmin - Admin Panel
// =====================================================
class ProductAdmin {
  constructor(productManager, renderCallback) {
    this.pm = productManager;
    this.renderCallback = renderCallback;
    this._editProd = null;
    this._imageData = null;
    this._eventsBound = false;
  }

  open() {
    const modal = new bootstrap.Modal(document.getElementById("adminModal"));
    modal.show();
    this._renderGrid();
    if (!this._eventsBound) { this._bindAdminEvents(); this._eventsBound = true; }
  }

  _renderGrid() {
    const grid = document.getElementById("adminProductGrid");
    const searchQ = (document.getElementById("adminSearch")?.value || "").toLowerCase().trim();
    const overrides = this.pm.getOverrides();
    let products = this.pm.produk.filter(p => {
      if (!searchQ) return true;
      return p.nama.toLowerCase().includes(searchQ);
    });

    if (products.length === 0) {
      grid.innerHTML = `<div style="grid-column:1/-1;text-align:center;padding:40px;color:var(--text-muted)">
        <i class="bi bi-search" style="font-size:36px;opacity:0.3;display:block;margin-bottom:8px"></i>
        <p style="font-weight:600;font-size:14px">Produk tidak ditemukan</p></div>`;
      return;
    }

    grid.innerHTML = products.map(p => {
      const isOverridden = !!overrides[p.id];
      const badge = isOverridden ? '<span class="admin-product-card-overridden">edited</span>' : '';
      return `<div class="admin-product-card" data-id="${p.id}" style="position:relative">
        ${badge}
        <img src="${p.gambar}" alt="${p.nama}" class="admin-product-card-img" loading="lazy"
             onerror="this.src='assets/img/default-product.svg';this.style.objectFit='contain';this.style.padding='10px'">
        <div class="admin-product-card-body">
          <div class="admin-product-card-name" title="${p.nama}">${p.nama}</div>
          <div class="admin-product-card-meta">
            <span class="admin-product-card-price">${formatRupiah(p.harga)}</span>
          </div>
        </div>
        <div class="admin-product-card-edit-hint">
          <i class="bi bi-pencil-square"></i> Klik untuk edit
        </div>
      </div>`;
    }).join("");

    grid.querySelectorAll(".admin-product-card").forEach(card => {
      card.addEventListener("click", () => this._openEdit(card.dataset.id));
    });
  }

  _bindAdminEvents() {
    document.getElementById("adminSearch")?.addEventListener("input", () => this._renderGrid());

    document.getElementById("adminModal")?.addEventListener("show.bs.modal", () => {
      this._renderGrid();
    });

    document.getElementById("adminModal")?.addEventListener("hidden.bs.modal", () => {
      const searchInput = document.getElementById("adminSearch");
      if (searchInput) searchInput.value = "";
      document.querySelectorAll(".sidebar-item").forEach(s => s.classList.remove("active"));
      document.getElementById("sidebarAdmin")?.classList.add("active");
      console.log('[3SON] admin modal hidden, triggering re-render');
      setTimeout(() => {
        if (window.posApp) {
          window.posApp.searchQuery = '';
          const s = document.getElementById('searchProduct');
          if (s) s.value = '';
          window.posApp._renderProducts();
        }
        window.dispatchEvent(new CustomEvent('3son:product-updated'));
      }, 200);
    });

    document.getElementById("btnAddProduct")?.addEventListener("click", () => this._openNew());

    document.getElementById("btnResetAll")?.addEventListener("click", async () => {
      if (confirm("Reset SEMUA produk ke default? Semua perubahan foto, harga, dan nama akan hilang.")) {
        await this.pm.resetOverrides();
        this._renderGrid();
        window.dispatchEvent(new CustomEvent('3son:product-updated'));
        this._showToast("Semua produk direset ke default");
      }
    });

    document.getElementById("btnSaveProduct")?.addEventListener("click", () => this._saveEdit());

    document.getElementById("btnDeleteProduct")?.addEventListener("click", () => this._deleteProduct());

    document.getElementById("adminImageInput")?.addEventListener("change", (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        this._imageData = ev.target.result;
        this._updateImagePreview();
      };
      reader.readAsDataURL(file);
    });

    document.getElementById("adminEditImgWrap")?.addEventListener("click", () => {
      document.getElementById("adminImageInput")?.click();
    });

    document.getElementById("btnRemoveImage")?.addEventListener("click", () => {
      this._imageData = null;
      this._updateImagePreview();
    });
  }

  _openEdit(id) {
    this._editProd = this.pm.findById(id);
    if (!this._editProd) return;
    this._imageData = null;

    document.getElementById("adminEditId").value = id;
    document.getElementById("adminEditNama").value = this._editProd.nama;
    document.getElementById("adminEditHarga").value = this._editProd.harga;
    document.getElementById("adminEditStok").value = this._editProd.stok || 0;

    document.getElementById("adminEditFavorit").checked = this._editProd.favorit;

    this._updateImagePreview();

    document.getElementById("btnDeleteProduct").style.display = 'flex';
    const modalEl = document.getElementById("adminEditModal");
    const modalH5 = modalEl.querySelector(".modal-header h5");
    if (modalH5) modalH5.innerHTML = '<i class="bi bi-pencil-square"></i> Edit Produk';

    const editModal = new bootstrap.Modal(modalEl);
    editModal.show();
  }

  _openNew() {
    const newId = 'p' + (this.pm.produk.length + 1).toString().padStart(3, '0');
    this._editProd = { id: newId, nama: '', harga: 0, stok: 0, gambar: 'assets/img/default-product.svg' };
    this._imageData = null;
    this._isNew = true;

    document.getElementById("adminEditId").value = newId;
    document.getElementById("adminEditNama").value = '';
    document.getElementById("adminEditHarga").value = '';
    document.getElementById("adminEditStok").value = '';
    document.getElementById("btnDeleteProduct").style.display = 'none';
    this._updateImagePreview();

    const modalEl = document.getElementById("adminEditModal");
    const modalH5 = modalEl.querySelector(".modal-header h5");
    if (modalH5) modalH5.innerHTML = '<i class="bi bi-plus-circle"></i> Tambah Produk';

    const editModal = new bootstrap.Modal(modalEl);
    editModal.show();
  }

  _deleteProduct() {
    const id = document.getElementById("adminEditId").value;
    const prod = this.pm.findById(id);
    if (!prod) return;
    if (!confirm(`Hapus produk "${prod.nama}"? Tindakan ini tidak bisa dibatalkan.`)) return;

    this.pm.produk = this.pm.produk.filter(p => p.id !== id);
    delete this.pm._overrides[id];
    this.pm._saveOverrides();

    const editModal = bootstrap.Modal.getInstance(document.getElementById("adminEditModal"));
    editModal?.hide();
    this._renderGrid();
    window.dispatchEvent(new CustomEvent('3son:product-updated'));
    this._showToast("Produk dihapus");
  }

  _updateImagePreview() {
    const wrap = document.getElementById("adminEditImgWrap");
    const img = document.getElementById("adminEditImg");
    if (this._imageData) {
      img.src = this._imageData;
      wrap.classList.add("has-image");
    } else if (this._editProd?.gambar) {
      img.src = this._editProd.gambar;
      wrap.classList.add("has-image");
    } else {
      img.src = "assets/img/default-product.svg";
      wrap.classList.remove("has-image");
    }
  }

  _saveEdit() {
    console.log('[3SON] _saveEdit called!');
    if (this._saving) return;
    this._saving = true;
    const id = document.getElementById("adminEditId").value;
    const nama = document.getElementById("adminEditNama").value.trim();
    const harga = parseInt(document.getElementById("adminEditHarga").value) || 0;
    const stok = parseInt(document.getElementById("adminEditStok").value) || 0;

    if (!nama) { this._saving = false; this._showToast("Nama produk tidak boleh kosong!"); return; }

    const data = { nama, harga, stok };
    if (this._imageData) data.gambar = this._imageData;

    if (this._isNew) {
      const newProd = { id, ...data, gambar: data.gambar || 'assets/img/default-product.svg' };
      this.pm.produk.push(newProd);
      this.pm.saveProduct(id, newProd);
    } else {
      this.pm.saveProduct(id, data);
    }
    this._renderGrid();

    const card = document.querySelector(`.product-card[data-id="${id}"]`);
    if (card) {
      if (data.gambar) {
        const img = card.querySelector(".product-img");
        if (img) img.src = data.gambar;
      }
      const nameEl = card.querySelector(".product-name");
      if (nameEl) nameEl.textContent = data.nama;
      const priceEl = card.querySelector(".product-price");
      if (priceEl) priceEl.textContent = formatRupiah(data.harga);
    }

    console.log('[3SON] saveProduct done, dispatching event for id:', id, 'hasImage:', !!data.gambar);
    window.dispatchEvent(new CustomEvent('3son:product-updated'));

    // Direct fallback: force re-render via window.posApp
    if (window.posApp && typeof window.posApp._renderProducts === 'function') {
      console.log('[3SON] also calling window.posApp._renderProducts directly');
      window.posApp.searchQuery = '';
      window.posApp._renderProducts();
    }

    const editModal = bootstrap.Modal.getInstance(document.getElementById("adminEditModal"));
    editModal?.hide();

    this._showToast("Produk " + nama + " berhasil disimpan!");
    this._isNew = false;
    this._saving = false;
    const modalH5 = document.getElementById("adminEditModal").querySelector(".modal-header h5");
    if (modalH5) modalH5.innerHTML = '<i class="bi bi-pencil-square"></i> Edit Produk';
  }

  _showToast(msg) {
    if (window.posApp && window.posApp._showToast) { window.posApp._showToast(msg); return; }
    let toast = document.getElementById("toastMsg");
    if (!toast) { toast = document.createElement("div"); toast.id = "toastMsg"; toast.className = "toast-msg"; document.body.appendChild(toast); }
    toast.textContent = msg; toast.classList.add("show");
    clearTimeout(this._toastTimer);
    this._toastTimer = setTimeout(() => toast.classList.remove("show"), 1500);
  }
}

// =====================================================
// CONTROLLER: POSApp
// =====================================================
class POSApp {
  constructor() {
    this.products = new ProductManager();
    this.cart = new CartManager();
    this.payment = new PaymentManager(this.cart);
    this.printer = new PrintManager(this.products);
    this.admin = new ProductAdmin(this.products, () => this._renderProducts());
    this.searchQuery = "";
    this.searchTimeout = null;
    this.selectedCustomer = "";
    this.customers = [
      "Toko Berkah", "Warung Sari", "UD Maju Jaya", "Toko Serba Ada",
      "Warung Mbak Sri", "Toko Barokah", "Agen Frozen A", "Agen Frozen B",
      "Pedagang Pasar", "Warung Kelontong", "Resto Sederhana", "Kantin Sekolah"
    ];
  }

  // ---- INIT ----
  async init() {
    await this.products.load();
    this.printer.products = this.products;
    this._renderProducts();
    this._renderCart();
    this._startClock();
    this._bindEvents();
  }

  // ---- CLOCK ----
  _startClock() {
    const update = () => {
      const now = new Date();
      const opts = { weekday: "long", day: "numeric", month: "long", year: "numeric" };
      document.getElementById("headerDate").textContent = now.toLocaleDateString("id-ID", opts);
      document.getElementById("headerTime").textContent = now.toLocaleTimeString("id-ID", {
        hour: "2-digit", minute: "2-digit", second: "2-digit"
      });
    };
    update();
    setInterval(update, 1000);
  }

  // ---- PRODUCTS ----
  _renderProducts() {
    console.log('[3SON] _renderProducts called, produk count:', this.products.produk.length, 'searchQuery:', this.searchQuery);
    const container = document.getElementById("productsGrid");
    const countEl = document.getElementById("productCount");
    if (!container) return;
    const q = this.searchQuery.toLowerCase().trim();
    const products = q ? this.products.produk.filter(p => p.nama.toLowerCase().includes(q)) : [...this.products.produk];
    if (products.length === 0) {
      container.innerHTML = `<div style="grid-column:1/-1;text-align:center;padding:60px 20px;color:var(--text-muted)">
        <i class="bi bi-search" style="font-size:48px;opacity:0.2;display:block;margin-bottom:12px"></i>
        <p style="font-weight:600">Produk tidak ditemukan</p>
        <p style="font-size:13px">Coba kata kunci lain</p></div>`;
    } else {
      container.innerHTML = products.map(p => `<div class="product-card" data-id="${p.id}" data-nama="${p.nama}" data-harga="${p.harga}">
        <div class="product-img-wrap">
          <img src="${p.gambar}" alt="${p.nama}" class="product-img" loading="lazy"
               onerror="this.src='assets/img/default-product.svg';this.style.objectFit='contain';this.style.padding='10px'">
        </div>
        <div class="product-info-bar">
          <div class="product-name" title="${p.nama}">${p.nama}</div>
          <div class="product-row">
            <div class="product-price">${formatRupiah(p.harga)}</div>
            <button class="btn-add-card" data-action="add" title="Tambah">&plus;</button>
          </div>
        </div></div>`).join("");
    }
    if (countEl) countEl.textContent = `${products.length} produk`;
    container.querySelectorAll(".product-card").forEach(card => {
      card.addEventListener("click", (e) => {
        if (e.target.closest(".btn-add-card")) return;
        const produk = products.find(p => p.id === card.dataset.id);
        if (produk) { this._addToCart(produk); card.classList.add("adding"); setTimeout(() => card.classList.remove("adding"), 400); }
      });
      card.querySelector(".btn-add-card")?.addEventListener("click", (e) => {
        e.stopPropagation();
        const produk = products.find(p => p.id === card.dataset.id);
        if (produk) { this._addToCart(produk); card.classList.add("adding"); setTimeout(() => card.classList.remove("adding"), 400); }
      });
    });
  }

  // ---- CART ----
  _addToCart(produk) { this.cart.addItem(produk); this._renderCart(); this._showToast("OK " + produk.nama + " ditambahkan"); }

  _renderCart() {
    const itemsContainer = document.getElementById("cartItems");
    const badgeEl = document.getElementById("cartBadge");
    if (!itemsContainer) return;
    if (this.cart.isEmpty) {
      itemsContainer.innerHTML = `<div class="cart-empty">
        <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="100" cy="100" r="96" fill="#F3F4F6" stroke="#E5E7EB" stroke-width="2"/>
          <path d="M65 75 L85 55 L135 55 L155 75 L175 75 L165 160 L55 160 L45 75 Z" fill="#D1D5DB" stroke="#9CA3AF" stroke-width="2" stroke-linejoin="round"/>
          <path d="M65 75 L100 40 L135 75" fill="#E5E7EB" stroke="#9CA3AF" stroke-width="2" stroke-linejoin="round"/>
          <circle cx="80" cy="110" r="5" fill="#fff"/>
          <circle cx="120" cy="110" r="5" fill="#fff"/>
          <line x1="75" y1="130" x2="145" y2="130" stroke="#fff" stroke-width="3" stroke-linecap="round"/>
        </svg>
        <p class="empty-title">Keranjang Kosong</p>
        <p class="empty-desc">Klik produk atau ketuk tombol + untuk menambahkan ke keranjang</p>
      </div>`;
    } else {
      itemsContainer.innerHTML = this.cart.items.map(item => `<div class="cart-item" data-id="${item.id}">
        <div class="cart-item-info"><div class="cart-item-name" title="${item.nama}">${item.nama}</div><div class="cart-item-price">${formatRupiah(item.harga)}</div></div>
        <div class="cart-qty"><button class="qty-btn minus" data-action="minus">-</button><span class="qty-value">${item.qty}</span><button class="qty-btn" data-action="plus">+</button></div>
        <div class="cart-item-subtotal">${formatRupiah(item.harga * item.qty)}</div>
        <button class="cart-item-delete" data-action="delete" title="Hapus"><i class="bi bi-trash3"></i></button></div>`).join("");
      itemsContainer.querySelectorAll(".cart-item").forEach(itemEl => {
        const id = itemEl.dataset.id;
        itemEl.querySelector('[data-action="minus"]').addEventListener("click", (e) => { e.stopPropagation(); this.cart.updateQty(id, -1); this._renderCart(); });
        itemEl.querySelector('[data-action="plus"]').addEventListener("click", (e) => { e.stopPropagation(); this.cart.updateQty(id, 1); this._renderCart(); });
        itemEl.querySelector('[data-action="delete"]').addEventListener("click", (e) => { e.stopPropagation(); this.cart.removeItem(id); this._renderCart(); });
      });
    }
    if (badgeEl) badgeEl.textContent = this.cart.itemCount;
    document.getElementById("cartSubtotal").textContent = formatRupiah(this.cart.subtotal);
    document.getElementById("cartDiskon").value = this.cart.diskon > 0 ? this.cart.diskon : "";
    document.getElementById("cartOngkir").value = this.cart.ongkir > 0 ? this.cart.ongkir : "";
    document.getElementById("cartGrandTotal").textContent = formatRupiah(this.cart.grandTotal);
    const payBtn = document.getElementById("btnPay");
    if (payBtn) payBtn.disabled = this.cart.isEmpty;

    // Sync mobile cart
    this._syncMobileCart();
  }

  _syncMobileCart() {
    const mCount = document.getElementById("mobileCartBadge");
    const mBadge = document.getElementById("mobileFabBadge");
    const mSub = document.getElementById("mobileCartSubtotal");
    const mDisk = document.getElementById("mobileCartDiskon");
    const mOng = document.getElementById("mobileCartOngkir");
    const mGt = document.getElementById("mobileCartGrandTotal");
    const mPay = document.getElementById("btnMobilePay");
    if (mCount) mCount.textContent = this.cart.itemCount;
    if (mBadge) mBadge.textContent = this.cart.itemCount;
    if (mSub) mSub.textContent = formatRupiah(this.cart.subtotal);
    if (mDisk) mDisk.value = this.cart.diskon > 0 ? this.cart.diskon : "";
    if (mOng) mOng.value = this.cart.ongkir > 0 ? this.cart.ongkir : "";
    if (mGt) mGt.textContent = formatRupiah(this.cart.grandTotal);
    if (mPay) mPay.disabled = this.cart.isEmpty;
    // Sync mobile items
    const mItems = document.getElementById("mobileCartItems");
    if (mItems) {
      if (this.cart.isEmpty) {
        mItems.innerHTML = `<div class="cart-empty">
          <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" style="width:90px;height:90px;opacity:0.3">
            <circle cx="100" cy="100" r="96" fill="#F3F4F6" stroke="#E5E7EB" stroke-width="2"/>
            <path d="M65 75 L85 55 L135 55 L155 75 L175 75 L165 160 L55 160 L45 75 Z" fill="#D1D5DB" stroke="#9CA3AF" stroke-width="2" stroke-linejoin="round"/>
            <path d="M65 75 L100 40 L135 75" fill="#E5E7EB" stroke="#9CA3AF" stroke-width="2" stroke-linejoin="round"/>
            <circle cx="80" cy="110" r="5" fill="#fff"/><circle cx="120" cy="110" r="5" fill="#fff"/>
            <line x1="75" y1="130" x2="145" y2="130" stroke="#fff" stroke-width="3" stroke-linecap="round"/>
          </svg>
          <p class="empty-title" style="font-size:13px">Keranjang Kosong</p>
        </div>`;
      } else {
        mItems.innerHTML = this.cart.items.map(item => `<div class="cart-item" data-id="${item.id}">
          <div class="cart-item-info"><div class="cart-item-name" title="${item.nama}">${item.nama}</div><div class="cart-item-price">${formatRupiah(item.harga)}</div></div>
          <div class="cart-qty"><button class="qty-btn minus" data-action="minus">-</button><span class="qty-value">${item.qty}</span><button class="qty-btn" data-action="plus">+</button></div>
          <div class="cart-item-subtotal">${formatRupiah(item.harga * item.qty)}</div>
          <button class="cart-item-delete" data-action="delete" title="Hapus"><i class="bi bi-trash3"></i></button></div>`).join("");
        mItems.querySelectorAll(".cart-item").forEach(itemEl => {
          const id = itemEl.dataset.id;
          itemEl.querySelector('[data-action="minus"]').addEventListener("click", (e) => { e.stopPropagation(); this.cart.updateQty(id, -1); this._renderCart(); });
          itemEl.querySelector('[data-action="plus"]').addEventListener("click", (e) => { e.stopPropagation(); this.cart.updateQty(id, 1); this._renderCart(); });
          itemEl.querySelector('[data-action="delete"]').addEventListener("click", (e) => { e.stopPropagation(); this.cart.removeItem(id); this._renderCart(); });
        });
      }
    }
  }

  // ---- EVENTS ----
  _bindEvents() {
    // Admin button (header)
    document.getElementById("btnAdmin")?.addEventListener("click", () => this.admin.open());

    // Admin button (sidebar)
    document.getElementById("sidebarAdmin")?.addEventListener("click", () => {
      document.querySelectorAll(".sidebar-item").forEach(s => s.classList.remove("active"));
      document.getElementById("sidebarAdmin")?.classList.add("active");
      this.admin.open();
    });

    // Sidebar Riwayat
    document.getElementById("sidebarRiwayat")?.addEventListener("click", () => {
      document.querySelectorAll(".sidebar-item").forEach(s => s.classList.remove("active"));
      document.getElementById("sidebarRiwayat")?.classList.add("active");
      this._showToast("Riwayat: coming soon");
    });

    // Sidebar Customer
    document.getElementById("sidebarCustomer")?.addEventListener("click", () => {
      document.querySelectorAll(".sidebar-item").forEach(s => s.classList.remove("active"));
      document.getElementById("sidebarCustomer")?.classList.add("active");
      this._openCustomerModal();
    });

    // Listen for product updates from admin panel
    window.addEventListener('3son:product-updated', () => {
      console.log('[3SON] product-updated event received, re-rendering...');
      this.searchQuery = "";
      const searchEl = document.getElementById("searchProduct");
      if (searchEl) searchEl.value = "";
      this._renderProducts();
    });

    const searchInput = document.getElementById("searchProduct");
    if (searchInput) {
      searchInput.addEventListener("input", (e) => {
        this.searchQuery = e.target.value;
        clearTimeout(this.searchTimeout);
        this.searchTimeout = setTimeout(() => this._renderProducts(), 200);
      });
    }

    document.getElementById("cartDiskon")?.addEventListener("input", (e) => {
      this.cart.diskon = parseInt(e.target.value) || 0;
      this._renderCart();
    });

    document.getElementById("cartOngkir")?.addEventListener("input", (e) => {
      this.cart.ongkir = parseInt(e.target.value) || 0;
      this._renderCart();
    });

    document.getElementById("btnClearCart")?.addEventListener("click", () => {
      if (this.cart.isEmpty) return;
      if (confirm("Kosongkan keranjang?")) { this.cart.clear(); this._renderCart(); this._showToast("Keranjang dikosongkan"); }
    });

    document.getElementById("btnPay")?.addEventListener("click", () => this._openPaymentModal());

    // Mobile events
    document.getElementById("btnMobilePay")?.addEventListener("click", () => {
      const bsOffcanvas = bootstrap.Offcanvas.getInstance(document.getElementById("mobileCartOffcanvas"));
      bsOffcanvas?.hide();
      this._openPaymentModal();
    });
    document.getElementById("btnMobileClearCart")?.addEventListener("click", () => {
      if (this.cart.isEmpty) return;
      if (confirm("Kosongkan keranjang?")) { this.cart.clear(); this._renderCart(); }
    });
    document.getElementById("mobileCartDiskon")?.addEventListener("input", (e) => {
      this.cart.diskon = parseInt(e.target.value) || 0;
      this._renderCart();
    });
    document.getElementById("mobileCartOngkir")?.addEventListener("input", (e) => {
      this.cart.ongkir = parseInt(e.target.value) || 0;
      this._renderCart();
    });

    // Bottom Nav
    document.getElementById("bottomNavCart")?.addEventListener("click", () => {
      const bs = new bootstrap.Offcanvas(document.getElementById("mobileCartOffcanvas"));
      bs.show();
    });
    document.getElementById("bottomNavPay")?.addEventListener("click", () => {
      if (!this.cart.isEmpty) this._openPaymentModal();
    });
    document.querySelectorAll(".bottom-nav-item[data-nav='home']").forEach(btn => {
      btn.addEventListener("click", () => {
        document.querySelectorAll(".bottom-nav-item").forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        this.searchQuery = "";
        document.getElementById("searchProduct").value = "";
        this._renderProducts();
      });
    });

    // Payment method buttons
    document.querySelectorAll(".method-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        document.querySelectorAll(".method-btn").forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        this.payment.method = btn.dataset.method;
        this._updatePaymentDisplay();
        if (this.payment.method !== "tunai") {
          document.getElementById("inputBayar").value = this.cart.grandTotal;
          this.payment.bayar = this.cart.grandTotal;
          this._updatePaymentDisplay();
        }
      });
    });

    // Print mode toggle
    document.querySelectorAll(".print-mode-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        document.querySelectorAll(".print-mode-btn").forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        this.payment.printMode = btn.dataset.mode;
      });
    });

    // Payment input
    document.getElementById("inputBayar")?.addEventListener("input", (e) => {
      this.payment.bayar = parseInt(e.target.value) || 0;
      this._updatePaymentDisplay();
    });

    // Split Bill
    let splitCount = 2;
    document.getElementById("splitBillCheck")?.addEventListener("change", (e) => {
      document.getElementById("splitBillSection").style.display = e.target.checked ? "block" : "none";
      this._updateSplitBill(splitCount);
    });
    document.getElementById("splitMinus")?.addEventListener("click", () => {
      if (splitCount > 2) { splitCount--; document.getElementById("splitCount").textContent = splitCount; this._updateSplitBill(splitCount); }
    });
    document.getElementById("splitPlus")?.addEventListener("click", () => {
      if (splitCount < 10) { splitCount++; document.getElementById("splitCount").textContent = splitCount; this._updateSplitBill(splitCount); }
    });

    // Save and print
    document.getElementById("btnSavePayment")?.addEventListener("click", () => {
      if (!this.payment.isLunas()) return;
      const customer = this.selectedCustomer || "";
      this.printer.print(this.cart, this.payment, customer);
      const modal = bootstrap.Modal.getInstance(document.getElementById("paymentModal"));
      modal?.hide();
      this.cart.clear();
      this.payment.reset();
      this._renderCart();
      this._showToast("Pembayaran berhasil!");
    });

    // Reset when modal opens
    document.getElementById("paymentModal")?.addEventListener("show.bs.modal", () => {
      this.payment.reset();
      document.getElementById("inputBayar").value = "";
      document.getElementById("splitBillCheck").checked = false;
      document.getElementById("splitCount").textContent = "2";
      document.getElementById("splitBillSection").style.display = "none";
      this._updatePaymentDisplay();
      document.querySelectorAll(".method-btn").forEach(b => b.classList.remove("active"));
      document.querySelector('.method-btn[data-method="tunai"]')?.classList.add("active");
      document.querySelectorAll(".print-mode-btn").forEach(b => b.classList.remove("active"));
      document.querySelector('.print-mode-btn[data-mode="a5"]')?.classList.add("active");
      setTimeout(() => document.getElementById("inputBayar")?.focus(), 200);
    });

    // Cleanup after print
    window.addEventListener("afterprint", () => {
      const container = document.getElementById("printContainer");
      if (container) { container.innerHTML = ""; container.className = "print-container"; }
    });
  }

  // ---- CUSTOMER MODAL ----
  _openCustomerModal() {
    const list = document.getElementById("customerList");
    if (!list) return;
    list.innerHTML = this.customers.map(c =>
      `<div class="customer-item${c === this.selectedCustomer ? ' active' : ''}" data-name="${c}">${c}</div>`
    ).join("");
    list.querySelectorAll(".customer-item").forEach(item => {
      item.addEventListener("click", () => {
        this.selectedCustomer = item.dataset.name;
        document.getElementById("customerSelectedName").textContent = this.selectedCustomer;
        document.querySelectorAll(".customer-item").forEach(i => i.classList.remove("active"));
        item.classList.add("active");
        const modal = bootstrap.Modal.getInstance(document.getElementById("customerModal"));
        modal?.hide();
      });
    });
    const modal = new bootstrap.Modal(document.getElementById("customerModal"));
    modal.show();
  }

  // ---- PAYMENT MODAL ----
  _openPaymentModal() {
    if (this.cart.isEmpty) return;
    const modal = new bootstrap.Modal(document.getElementById("paymentModal"), { backdrop: "static", keyboard: false });
    modal.show();
  }

  _updatePaymentDisplay() {
    document.getElementById("modalGrandTotal").textContent = formatRupiah(this.cart.grandTotal);
    document.getElementById("changeAmount").textContent = formatRupiah(this.payment.kembalian);
    const saveBtn = document.getElementById("btnSavePayment");
    if (saveBtn) saveBtn.disabled = !this.payment.isLunas();
  }

  _updateSplitBill(count) {
    const perPerson = Math.floor(this.cart.grandTotal / count);
    document.getElementById("splitBillPerPerson").innerHTML = `<span>${formatRupiah(perPerson)} / orang</span>`;
  }

  // ---- TOAST ----
  _showToast(msg) {
    let toast = document.getElementById("toastMsg");
    if (!toast) { toast = document.createElement("div"); toast.id = "toastMsg"; toast.className = "toast-msg"; document.body.appendChild(toast); }
    toast.textContent = msg;
    toast.classList.add("show");
    clearTimeout(this._toastTimer);
    this._toastTimer = setTimeout(() => toast.classList.remove("show"), 1500);
  }
}

// =====================================================
// BOOTSTRAP
// =====================================================
document.addEventListener("DOMContentLoaded", () => {
  window.posApp = new POSApp();
  window.posApp.init();
});

