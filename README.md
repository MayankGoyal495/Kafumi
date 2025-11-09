# ☕ Kafumi - Cafe Discovery Platform

A modern web application for discovering and sharing cafes in Jaipur, built with Next.js 14, TypeScript, and Google Sheets as a backend.

## 🌟 Features

- 🔍 **Smart Search** - Find cafes by name, location, or amenities
- 🗺️ **Interactive Map** - Visualize cafe locations with MapMyIndia integration
- 📝 **User Submissions** - Add new cafes to the platform
- 🎨 **Modern UI** - Beautiful, responsive interface with Tailwind CSS
- 🤖 **AI-Powered** - Smart recommendations using Google Gemini AI
- 📊 **Google Sheets Backend** - Easy data management and updates

## 🚀 Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **UI Components:** Radix UI + shadcn/ui
- **Backend:** Google Sheets API
- **Maps:** MapMyIndia
- **AI:** Google Gemini API
- **Deployment:** Vercel

## 🛠️ Local Development

### Prerequisites

- Node.js 18+ and npm
- Google Cloud Project with Sheets API enabled
- MapMyIndia API keys
- Google Gemini API key

### Installation

1. Clone the repository:
```bash
git clone https://github.com/YOUR_USERNAME/kafumi.git
cd kafumi
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
Create a `.env.local` file with:
```env
NEXT_PUBLIC_LOCATIONIQ_KEY=your_key
NEXT_PUBLIC_OPENCAGE_KEY=your_key
NEXT_PUBLIC_GEMINI_API_KEY=your_key
GOOGLE_CLIENT_ID=your_client_id
GOOGLE_CLIENT_SECRET=your_client_secret
GOOGLE_REDIRECT_URI=http://localhost:3000
GOOGLE_SERVICE_ACCOUNT_EMAIL=your_service_account
GOOGLE_PRIVATE_KEY="your_private_key"
GOOGLE_SHEET_ID=your_sheet_id
GOOGLE_DRIVE_FOLDER_ID=your_folder_id
```

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000)

## 📦 Project Structure

```
kafumi/
├── app/              # Next.js app directory
│   ├── api/         # API routes
│   ├── cafes/       # Cafe listing pages
│   └── submit/      # Submission forms
├── components/       # React components
├── lib/             # Utility functions
├── public/          # Static assets
└── styles/          # Global styles
```

## 🌐 Deployment

This project is deployed on Vercel and connected to www.kafumi.com

For detailed deployment instructions, see [PRODUCTION_DEPLOYMENT.md](./PRODUCTION_DEPLOYMENT.md)

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License.

## 👤 Author

**Mayank Goyal**

## 🙏 Acknowledgments

- shadcn/ui for the beautiful UI components
- Vercel for hosting
- Google Cloud Platform for APIs
- MapMyIndia for mapping services

---

**Live Site:** [www.kafumi.com](https://www.kafumi.com)
