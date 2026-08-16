/**
 * CERTIFICATE.JS - Sinh chứng nhận cá nhân hoá
 * Vẽ tên người tham gia lên nền chứng nhận (img/cert.png) bằng Canvas 2D,
 * sau đó xuất ra ảnh PNG để hiển thị trong modal và cho phép tải về.
 *
 * Toạ độ NAME_Y_RATIO / NAME_MAX_WIDTH_RATIO được tính theo đúng bố cục gốc
 * của file thiết kế chứng nhận (khung 1700x1300), quy về tỉ lệ % để áp dụng
 * cho ảnh nền ở bất kỳ độ phân giải nào.
 */
const CertificateModule = {
    TEMPLATE_SRC: 'img/cert.png',

    // Vị trí & style của dòng tên, tính theo tỉ lệ so với kích thước ảnh nền
    NAME_Y_RATIO: 502 / 1340,
    NAME_MAX_WIDTH_RATIO: 680 / 1700, // độ rộng tối đa (giữa 2 đầu gạch chấm cam)
    NAME_FONT_SIZE_RATIO: 52 / 1700,
    NAME_MIN_FONT_SIZE_RATIO: 24 / 1700,
    NAME_COLOR: '#E03C31',
    NAME_FONT_FAMILY: '"Lexend", Arial, sans-serif',
    NAME_FONT_WEIGHT: 800,

    _templateImg: null,

    async _loadTemplate() {
        if (this._templateImg) return this._templateImg;
        const img = new Image();
        img.src = this.TEMPLATE_SRC;
        if (img.decode) {
            await img.decode();
        } else {
            await new Promise((resolve, reject) => {
                img.onload = resolve;
                img.onerror = reject;
            });
        }
        this._templateImg = img;
        return img;
    },

    async _ensureFontLoaded(sizePx) {
        if (!document.fonts || !document.fonts.load) return;
        try {
            await document.fonts.load(`${this.NAME_FONT_WEIGHT} ${sizePx}px "Lexend"`);
            await document.fonts.ready;
        } catch (e) {
            // Nếu font chưa sẵn sàng, canvas sẽ tự fallback sang Arial
        }
    },

    /**
     * Vẽ tên lên chứng nhận, trả về canvas đã render.
     * @param {string} name - Họ tên người tham gia (đã trim)
     */
    async render(name) {
        const img = await this._loadTemplate();

        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        const baseFontSize = Math.round(canvas.width * this.NAME_FONT_SIZE_RATIO);
        const minFontSize = Math.round(canvas.width * this.NAME_MIN_FONT_SIZE_RATIO);
        const maxTextWidth = canvas.width * this.NAME_MAX_WIDTH_RATIO;

        await this._ensureFontLoaded(baseFontSize);

        let fontSize = baseFontSize;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'alphabetic';
        ctx.fillStyle = this.NAME_COLOR;

        const buildFont = (size) => `${this.NAME_FONT_WEIGHT} ${size}px ${this.NAME_FONT_FAMILY}`;
        ctx.font = buildFont(fontSize);

        // Tự động giảm cỡ chữ nếu tên quá dài để vẫn nằm gọn trong khung
        while (ctx.measureText(name).width > maxTextWidth && fontSize > minFontSize) {
            fontSize -= 2;
            ctx.font = buildFont(fontSize);
        }

        const x = canvas.width / 2;
        const y = canvas.height * this.NAME_Y_RATIO;
        ctx.fillText(name, x, y);

        return canvas;
    },

    /**
     * Sinh chứng nhận cho `name`, gắn vào <img id="cert-img"> và link tải về.
     */
    async generateAndDisplay(name) {
        const canvas = await this.render(name);
        const dataUrl = canvas.toDataURL('image/png');

        const certImg = document.getElementById('cert-img');
        if (certImg) certImg.src = dataUrl;

        const downloadLink = document.getElementById('cert-download-link');
        if (downloadLink) {
            downloadLink.href = dataUrl;
            const safeName = name
                .normalize('NFD').replace(/[\u0300-\u036f]/g, '') // bỏ dấu để tên file an toàn
                .replace(/Đ/g, 'D').replace(/đ/g, 'd')
                .replace(/[^a-zA-Z0-9]+/g, '_')
                .replace(/^_+|_+$/g, '');
            downloadLink.setAttribute('download', `ChungNhan_SCIP_GIALAI_${safeName || 'HocSinh'}.png`);
        }

        return dataUrl;
    }
};

// Gán vào window để app.js (được nạp sau) có thể truy cập.
// Lưu ý: khai báo `const CertificateModule` ở top-level KHÔNG tự động
// trở thành thuộc tính của window (đây là hành vi chuẩn của JS với let/const,
// khác với var) — nên phải gán tường minh như dưới đây.
window.CertificateModule = CertificateModule;
