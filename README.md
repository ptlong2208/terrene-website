# Terrene Website

E-commerce storefront for Terrene — a Vietnamese specialty coffee brand. Built with Next.js, Tailwind CSS, and integrates Strapi, Haravan, PayOS, Brevo, and Upstash Redis.

---

## Getting Started

```bash
npm install
cp .env.example .env.local
# Fill in the env vars (see below)
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Environment Variables

### Strapi CMS

| Variable                 | Description              |
| ------------------------ | ------------------------ |
| `NEXT_PUBLIC_STRAPI_URL` | Your Strapi instance URL |

**How to get:** Strapi Cloud dashboard → your project → the base URL shown (e.g. `https://xxx.strapiapp.com`).

---

### Haravan

| Variable            | Description           |
| ------------------- | --------------------- |
| `HARAVAN_API_TOKEN` | Private app API token |

**How to get:**

1. Haravan admin → **Ứng dụng** → **Quản lý ứng dụng riêng** → create a private app
2. Enable scopes: `com.read_products`, `com.write_orders`
3. Copy the API token

---

### Brevo

| Variable            | Description                          |
| ------------------- | ------------------------------------ |
| `BREVO_API_KEY`     | API key                              |
| `BREVO_TEMPLATE_ID` | Order confirmation email template ID |
| `BREVO_LIST_ID`     | Newsletter contact list ID           |

**How to get:**

1. [app.brevo.com](https://app.brevo.com) → **Settings → API Keys** → create a key
2. **Email Templates** → open your order confirmation template → note the numeric ID in the URL
3. **Contacts → Lists** → open your newsletter list → note the numeric ID

---

### Site URL

| Variable   | Description                                                      |
| ---------- | ---------------------------------------------------------------- |
| `SITE_URL` | Production domain, no trailing slash (e.g. `https://terrene.vn`) |

Set this in Vercel scoped to **Production** only. Preview deployments fall back to `VERCEL_URL` automatically — no need to set it there.

---

### PayOS

| Variable             | Description                                     |
| -------------------- | ----------------------------------------------- |
| `PAYOS_CLIENT_ID`    | Client ID                                       |
| `PAYOS_API_KEY`      | API key                                         |
| `PAYOS_CHECKSUM_KEY` | Checksum key for webhook signature verification |

**How to get:**

1. [my.payos.vn](https://my.payos.vn) → **Kênh thanh toán** → open your channel
2. Copy **Client ID**, **API Key**, and **Checksum Key**
3. Under **Thiết lập nâng cao → Webhook URL** → enter `https://your-domain.com/api/webhooks/payment`

---

### Upstash Redis

| Variable                   | Description    |
| -------------------------- | -------------- |
| `UPSTASH_REDIS_REST_URL`   | REST API URL   |
| `UPSTASH_REDIS_REST_TOKEN` | REST API token |

**How to get:**

1. [console.upstash.com](https://console.upstash.com) → **Create database**
   - Region: `ap-southeast-1` (Singapore)
   - Eviction: off
2. Open the database → **REST API** tab → copy the URL and token

**On Vercel:** install the [Upstash integration](https://vercel.com/marketplace) from the marketplace — it fills in these vars automatically, no manual copy needed.
