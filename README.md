<div align="center">

# 🚀 StackPilot

### Scaffold production-grade **Next.js** apps in seconds from CLI or Web GUI

[![NPM Version](https://img.shields.io/npm/v/stackpilot?style=flat-square)](https://www.npmjs.com/package/stackpilot)
[![Downloads](https://img.shields.io/npm/dm/stackpilot?style=flat-square)](https://www.npmjs.com/package/stackpilot)
[![GitHub Stars](https://img.shields.io/github/stars/yourusername/stackpilot?style=flat-square)](https://github.com/yourusername/stackpilot)

<img src="https://raw.githubusercontent.com/yourusername/stackpilot/main/assets/banner.png" alt="StackPilot Banner" width="100%" />

</div>

---

## ✨ Features

- 🔐 **Authentication**: Email, Google, GitHub via NextAuth/Auth.js  
- 💳 **Payments**: Stripe & Razorpay (single & subscription)  
- 🎨 **Theming**: ShadCN + Tailwind v4 + Color Picker  
- 🧱 **Middleware & Contexts**: Pre-configured with best practices  
- 🧪 **Code Quality**: ESLint, Prettier, Husky, Commitlint  
- 🔭 **SEO Tools**: `sitemap.ts`, `robots.txt`, meta utilities  
- 🚀 **CI/CD**: GitHub Actions ready-to-go  
- 🌐 **Deploy-Ready**: Vercel-optimized out of the box  
- 🧠 **AI-Powered GUI**: Web-based builder with code editor  

---

## 📆 Installation

> Install globally or use instantly with `npx`

### 🔧 Global Install

```bash
npm install -g stackpilot
stackpilot init
```

### ⚡ One-shot Install

```bash
npx stackpilot init
```

---

## 🧺 CLI Flow Example

```bash
npx stackpilot init my-app
```

```text
✔ Select features to include:
  ▸ [x] Authentication
    ▸ [x] Google [x] GitHub [x] Email
  ▸ [x] Payment Integration
    ▸ [x] Stripe [ ] Razorpay
  ▸ [x] SEO Toolkit
  ▸ [x] Code Quality (ESLint, Prettier)
  ▸ [x] CI/CD + Husky + Linting
✔ Choose Theme Color:
    ▸ 🔸 Purple ▸ 🔹 Blue ▸ 🔷 Green ▸ 🔴 Red ...
```

---

## 📁 Project Structure

```text
my-app/
├── app/
│   ├── layout.tsx
│   └── globals.css
├── components/
├── lib/
├── utils/
├── features/
├── stripe/
├── prisma/
│   └── schema.prisma
└── .eslintrc.json
    .prettierrc
```

---

## 🌟 Why StackPilot?

| Feature               | StackPilot ✅ | Create T3 App ⚙️ | Vite ❌ | Manual Setup 😵 |
|-----------------------|---------------|------------------|---------|------------------|
| **Auth Providers**    | ✅             | ✅               | ❌      | ❌               |
| **Stripe & Razorpay** | ✅             | ❌               | ❌      | ❌               |
| **CLI + GUI Support** | ✅             | ❌               | ❌      | ❌               |
| **Tailwind v4 + ShadCN** | ✅         | ✅               | ⚠️      | ⚠️              |
| **SEO Setup**         | ✅             | ⚠️              | ❌      | ❌               |
| **Theme Color Picker**| ✅             | ❌               | ❌      | ❌               |
| **Deploy-Ready (Vercel)** | ✅        | ✅               | ⚠️      | ❌               |
| **CI/CD + Code Quality** | ✅        | ⚠️              | ❌      | ❌               |

---

## 💻 Web GUI (Coming Soon)

Build your stack visually like [v0.dev](https://v0.dev)

- Drag-and-drop feature toggles  
- Live preview with full VS Code-like editing  
- Download with payment (₹359/project or ₹559/month for 20 projects)  

---

## 🔐 Licensing & SaaS Plans

| Plan         | Download Limit | Price         |
| ------------ | -------------- | ------------- |
| Free Plan    | Use in web GUI | ₹0            |
| One-time     | 1 Project      | ₹359/project  |
| Subscription | 20 Projects/mo | ₹559/month    |

---

## 🧠 Coming Soon

- [ ] Plugin System (auth/payment/theme/etc.)
- [ ] Web GUI (v0-style editor)
- [ ] React Native / Expo templates
- [ ] Custom stack integrations

---

## 📜 License

MIT © [Ankit Biswas](https://github.com/ankit420)

---

## 📬 Support

Have suggestions or issues?  
Open an issue at 👉 [GitHub Issues](https://github.com/yourusername/stackpilot/issues)

---

<div align="center">
With ❤️ from India 🇮🇳
</div>
